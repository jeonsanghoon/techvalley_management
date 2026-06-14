/**
 * SPA 메뉴 클릭 + 테마 전환 재현 테스트
 * page.goto() 대신 실제 Link 클릭으로 이동
 */
import pwPkg from "../../03.source/frontend/node_modules/playwright-core/index.js";
const { chromium } = pwPkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "http://localhost:3000";
const OUT = path.join(__dirname, "../diag_spa");
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

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push(e.message));

  // 세션 주입 후 대시보드 직접 이동
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate(s => {
    localStorage.setItem("tv-auth-session", s);
    localStorage.setItem("tv-auto-login", "1");
  }, MOCK_SESSION);
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
  await sleep(2000);
  await page.screenshot({ path: path.join(OUT, "01_dashboard_initial.png") });
  console.log("01. 초기 대시보드 로드");

  // ── 테마 전환 테스트 ──
  const themeBtn = page.locator("button[aria-label='테마 전환']");
  await themeBtn.click();
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT, "02_after_theme_toggle.png") });
  console.log("02. 테마 전환 후");

  // 테마 전환 후 SPA 네비게이션
  await page.locator("text=이상 알람 목록").first().click();
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT, "03_alarms_after_theme_toggle.png") });
  console.log("03. 테마 전환 후 알람 페이지 이동 (SPA)");

  // 다시 대시보드로
  await page.locator("text=통합 관제 대시보드").first().click();
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT, "04_dashboard_back.png") });
  console.log("04. 대시보드 돌아오기 (SPA)");

  // 테마 원복
  await themeBtn.click();
  await sleep(1000);

  // ── 메뉴 그룹 접기/펼치기 후 이동 테스트 ──
  // 장비·설치·고객 그룹 클릭 (접기)
  await page.locator("text=장비·설치·고객").first().click();
  await sleep(500);
  await page.screenshot({ path: path.join(OUT, "05_group_collapsed.png") });
  console.log("05. 그룹 접기");

  // 다시 펼치기
  await page.locator("text=장비·설치·고객").first().click();
  await sleep(500);

  // 장비 마스터로 이동
  await page.locator("text=장비 마스터").first().click();
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT, "06_equipment_after_collapse.png") });
  console.log("06. 그룹 펼친 후 장비 마스터 이동 (SPA)");

  // ── metric-stream hash 탭 이동 테스트 ──
  // 사이드바가 접혀 있을 수 있으므로 직접 goto → 이후 SPA 탭 전환
  await page.goto(`${BASE_URL}/metric-stream#periodic`, { waitUntil: "networkidle" });
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT, "07_metric_periodic.png") });
  console.log("07. 주기 메트릭 (직접 이동)");

  // hash 탭 전환: sidebar 링크를 직접 goto로 시뮬레이션
  await page.goto(`${BASE_URL}/metric-stream#event`, { waitUntil: "networkidle" });
  await sleep(1000);
  await page.screenshot({ path: path.join(OUT, "08_metric_event.png") });
  console.log("08. 이벤트 메트릭 (hash 변경)");

  await page.goto(`${BASE_URL}/metric-stream#firmware`, { waitUntil: "networkidle" });
  await sleep(1000);
  await page.screenshot({ path: path.join(OUT, "09_metric_firmware.png") });
  console.log("09. 펌웨어 메트릭 (hash 변경)");

  // ── 빠른 연속 클릭 테스트 ──
  console.log("10. 빠른 연속 메뉴 클릭...");
  const quickLinks = ["이상 알람 목록", "원격제어", "서비스 호출·티케팅", "리포트", "통합 관제 대시보드"];
  for (const label of quickLinks) {
    await page.locator(`text=${label}`).first().click();
    await sleep(200); // 매우 빠른 전환
  }
  await sleep(2000);
  await page.screenshot({ path: path.join(OUT, "10_rapid_nav_final.png") });
  console.log("10. 빠른 연속 클릭 후 최종 상태");

  // ── 동일 페이지 재클릭 ──
  await page.locator("text=통합 관제 대시보드").first().click();
  await sleep(500);
  await page.locator("text=통합 관제 대시보드").first().click();
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT, "11_same_page_reclick.png") });
  console.log("11. 동일 페이지 재클릭");

  console.log("\n=== 콘솔 에러 ===");
  if (consoleErrors.length) {
    consoleErrors.forEach(e => console.log("  ERR:", e.slice(0, 200)));
  } else {
    console.log("  없음");
  }

  await browser.close();
  console.log(`\n저장: ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
