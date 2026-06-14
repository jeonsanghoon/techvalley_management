import pwPkg from "../../03.source/frontend/node_modules/playwright-core/index.js";
const { chromium } = pwPkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "http://localhost:3000";
const OUT_DIR = path.join(__dirname, "../diag");

const MOCK_SESSION = JSON.stringify({
  id: "usr-001",
  name: "관리자",
  email: "admin@techvalley.io",
  role: "시스템 관리자",
  appRole: "admin",
  region: "전체",
});

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function injectSession(page) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate((s) => {
    localStorage.setItem("tv-auth-session", s);
    localStorage.setItem("tv-auto-login", "1");
  }, MOCK_SESSION);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  const errors = [];
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", err => errors.push(err.message));

  await injectSession(page);

  // ── 1. 대시보드 → 다른 메뉴들 빠르게 전환 ──
  console.log("=== 메뉴 전환 테스트 ===");
  const testPages = [
    "/dashboard", "/metric-stream#periodic", "/alarms",
    "/equipment", "/service-tickets", "/inspection",
    "/admin/users",
  ];

  for (const url of testPages) {
    errors.length = 0;
    await page.goto(`${BASE_URL}${url}`, { waitUntil: "networkidle", timeout: 15000 });
    await sleep(1500);
    const fn = `nav_${url.replace(/[/#]/g, "_").replace(/^_/, "")}.png`;
    await page.screenshot({ path: path.join(OUT_DIR, fn), fullPage: false });
    if (errors.length) {
      console.log(`⚠  ${url} — console errors: ${errors.join(" | ")}`);
    } else {
      console.log(`✓  ${url}`);
    }
  }

  // ── 2. 테마 전환 테스트 ──
  console.log("\n=== 테마 전환 테스트 ===");
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, "theme_01_before.png") });
  console.log("before toggle");

  // 테마 토글 버튼 클릭
  const themeBtn = page.locator("[data-testid='theme-toggle'], button[aria-label*='theme'], button[aria-label*='mode'], button[aria-label*='다크'], button[aria-label*='라이트']").first();
  const found = await themeBtn.count();
  if (found > 0) {
    await themeBtn.click();
    await sleep(2000);
    await page.screenshot({ path: path.join(OUT_DIR, "theme_02_after_toggle.png") });
    console.log("after toggle");

    // 메뉴 이동 후 테마 유지 확인
    await page.goto(`${BASE_URL}/equipment`, { waitUntil: "networkidle" });
    await sleep(1500);
    await page.screenshot({ path: path.join(OUT_DIR, "theme_03_after_nav.png") });
    console.log("after nav with new theme");
  } else {
    // MUI IconButton으로 테마 버튼 찾기
    const btns = await page.locator("header button, nav button").all();
    console.log(`header/nav buttons found: ${btns.length}`);
    for (let i = 0; i < Math.min(btns.length, 10); i++) {
      const txt = await btns[i].textContent().catch(() => "");
      const label = await btns[i].getAttribute("aria-label").catch(() => "");
      console.log(`  btn[${i}]: text="${txt.trim()}" label="${label}"`);
    }
  }

  // ── 3. 빠른 연속 클릭 테스트 ──
  console.log("\n=== 빠른 연속 네비게이션 ===");
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
  const quickPages = ["/alarms", "/equipment", "/reports", "/dashboard"];
  for (const url of quickPages) {
    await page.goto(`${BASE_URL}${url}`, { waitUntil: "commit" }); // 빠른 전환
    await sleep(300);
  }
  await sleep(2000);
  await page.screenshot({ path: path.join(OUT_DIR, "rapid_nav_final.png") });
  console.log("rapid nav complete");

  // ── 4. 브라우저 콘솔 에러 수집 ──
  console.log("\n=== 최종 콘솔 에러 ===");
  if (errors.length) {
    errors.forEach(e => console.log("  ERR:", e));
  } else {
    console.log("  없음");
  }

  await browser.close();
  console.log(`\n진단 스크린샷: ${OUT_DIR}`);
}

main().catch(err => { console.error(err); process.exit(1); });
