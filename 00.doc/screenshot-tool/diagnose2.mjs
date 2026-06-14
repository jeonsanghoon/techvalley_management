/**
 * 실제 SPA Link 클릭 + 테마 전환 중 emotion 스타일 태그가 어떻게 변하는지 추적
 * - MutationObserver 로 <head> style 태그 추가/삭제 기록
 * - 각 단계마다 emotion 태그 수 / speedy 모드 / <head> 자식 수 보고
 */
import pwPkg from "../../03.source/frontend/node_modules/playwright-core/index.js";
const { chromium } = pwPkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "http://localhost:3000";
const OUT = path.join(__dirname, "../diag2");
fs.mkdirSync(OUT, { recursive: true });

const MOCK_SESSION = JSON.stringify({
  id: "usr-001",
  name: "관리자",
  email: "admin@techvalley.io",
  role: "시스템 관리자",
  appRole: "admin",
  region: "전체",
});

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** 브라우저에서 실행: emotion 태그 현황 스냅샷 */
const SNAPSHOT_JS = () => {
  const tags = [...document.head.querySelectorAll("style[data-emotion]")];
  // speedy 모드: data-emotion 속성에 클래스명이 있지만 textContent가 비어있음
  let speedyCount = 0, textCount = 0, totalRules = 0;
  tags.forEach(t => {
    if (t.sheet?.cssRules) totalRules += t.sheet.cssRules.length;
    if (t.textContent?.trim()) textCount++; else speedyCount++;
  });
  return {
    total: tags.length,
    speedy: speedyCount,
    text: textCount,
    totalRules,
    headChildren: document.head.children.length,
    allDataEmotionAttrs: tags.map(t => t.getAttribute("data-emotion")).slice(0, 5),
  };
};

/** MutationObserver 주입 — head 자식 변경 추적 */
const INJECT_OBSERVER_JS = () => {
  window.__headChanges = [];
  const obs = new MutationObserver(muts => {
    muts.forEach(m => {
      m.removedNodes.forEach(n => {
        if (n.nodeType === 1) {
          window.__headChanges.push({
            type: "removed",
            tag: n.tagName,
            attr: n.getAttribute?.("data-emotion") ?? n.getAttribute?.("id") ?? "",
            time: performance.now().toFixed(0),
          });
        }
      });
      m.addedNodes.forEach(n => {
        if (n.nodeType === 1) {
          window.__headChanges.push({
            type: "added",
            tag: n.tagName,
            attr: n.getAttribute?.("data-emotion") ?? n.getAttribute?.("id") ?? "",
            time: performance.now().toFixed(0),
          });
        }
      });
    });
  });
  obs.observe(document.head, { childList: true, subtree: false });
  window.__headObs = obs;
};

const GET_CHANGES_JS = () => {
  const changes = window.__headChanges || [];
  window.__headChanges = [];
  return changes;
};

async function snap(page, label) {
  const data = await page.evaluate(SNAPSHOT_JS);
  console.log(`\n[${label}]`);
  console.log(`  emotion 태그: ${data.total} (speedy=${data.speedy}, text=${data.text})`);
  console.log(`  CSS rules: ${data.totalRules}  head children: ${data.headChildren}`);
  if (data.allDataEmotionAttrs.length)
    console.log(`  첫 attrs: ${data.allDataEmotionAttrs.join(" | ")}`);
  return data;
}

async function changes(page, label) {
  const list = await page.evaluate(GET_CHANGES_JS);
  const removed = list.filter(c => c.type === "removed" && (c.tag === "STYLE" || c.attr.includes("emotion")));
  const addedEmotion = list.filter(c => c.type === "added" && c.attr.includes("emotion"));
  if (removed.length || addedEmotion.length) {
    console.log(`  ↳ [${label}] DOM 변경 — 제거된 STYLE: ${removed.length}, 추가된 emotion: ${addedEmotion.length}`);
    removed.forEach(c => console.log(`     REMOVED  t=${c.time} tag=${c.tag} attr="${c.attr}"`));
    addedEmotion.forEach(c => console.log(`     ADDED    t=${c.time} tag=${c.tag} attr="${c.attr}"`));
  } else {
    console.log(`  ↳ [${label}] head DOM 변경 없음`);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on("console", m => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 150));
  });

  // ─── 초기 로드 ───
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate(s => {
    localStorage.setItem("tv-auth-session", s);
    localStorage.setItem("tv-auto-login", "1");
  }, MOCK_SESSION);
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
  await sleep(1000);

  // MutationObserver 주입
  await page.evaluate(INJECT_OBSERVER_JS);
  await snap(page, "초기 대시보드");
  await page.screenshot({ path: path.join(OUT, "01_dashboard.png") });

  // ─── 테마 전환 ───
  const themeBtn = page.locator("button[aria-label='테마 전환']");
  await themeBtn.click();
  await sleep(800);
  await changes(page, "테마 전환 후");
  const s2 = await snap(page, "테마 전환 후");
  await page.screenshot({ path: path.join(OUT, "02_theme_dark.png") });

  if (s2.total === 0) {
    console.log("  !!! emotion 태그 전멸 !!!");
  }

  // ─── SPA: 알람 이동 ───
  await page.locator("text=이상 알람 목록").first().click();
  await sleep(1200);
  await changes(page, "알람 이동 후");
  const s3 = await snap(page, "알람 이동 후 (SPA)");
  await page.screenshot({ path: path.join(OUT, "03_alarms_spa.png") });
  if (s3.total === 0) console.log("  !!! emotion 태그 전멸 !!!");

  // ─── SPA: 대시보드 귀환 ───
  await page.locator("text=통합 관제 대시보드").first().click();
  await sleep(1200);
  await changes(page, "대시보드 귀환 후");
  const s4 = await snap(page, "대시보드 귀환 후 (SPA)");
  await page.screenshot({ path: path.join(OUT, "04_dashboard_back.png") });
  if (s4.total === 0) console.log("  !!! emotion 태그 전멸 !!!");

  // ─── SPA: 3연속 이동 ───
  console.log("\n--- 3연속 SPA 이동 ---");
  for (const label of ["이상 알람 목록", "원격제어", "통합 관제 대시보드"]) {
    await page.locator(`text=${label}`).first().click();
    await sleep(600);
  }
  await sleep(800);
  await changes(page, "연속 이동 후");
  const s5 = await snap(page, "연속 이동 후");
  await page.screenshot({ path: path.join(OUT, "05_rapid.png") });
  if (s5.total === 0) console.log("  !!! emotion 태그 전멸 !!!");

  // ─── 테마 다시 전환 (dark → light) ───
  await themeBtn.click();
  await sleep(800);
  await changes(page, "테마 원복 후");
  const s6 = await snap(page, "테마 원복 후");
  await page.screenshot({ path: path.join(OUT, "06_theme_light.png") });
  if (s6.total === 0) console.log("  !!! emotion 태그 전멸 !!!");

  // ─── 추가: 빠른 연속 테마 토글 ───
  console.log("\n--- 빠른 테마 토글 x5 ---");
  for (let i = 0; i < 5; i++) {
    await themeBtn.click();
    await sleep(120);
  }
  await sleep(800);
  await changes(page, "빠른 토글 후");
  const s7 = await snap(page, "빠른 토글 후");
  await page.screenshot({ path: path.join(OUT, "07_rapid_theme.png") });
  if (s7.total === 0) console.log("  !!! emotion 태그 전멸 !!!");

  console.log("\n=== 콘솔 에러 ===");
  if (consoleErrors.length) consoleErrors.forEach(e => console.log("  ERR:", e));
  else console.log("  없음");

  await browser.close();
  console.log(`\n저장: ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
