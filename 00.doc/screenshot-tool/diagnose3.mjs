/**
 * 정밀 진단: SPA 이동 + 테마 전환 중 emotion 스타일 주입 흐름 추적
 * - head 태그 추가/삭제 모두 기록 (필터 없음)
 * - CSS rule 수 vs emotion 태그 수 비교
 * - 장비마스터 SPA 이동 후 상태 확인
 */
import pwPkg from "../../03.source/frontend/node_modules/playwright-core/index.js";
const { chromium } = pwPkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "http://localhost:3000";
const OUT = path.join(__dirname, "../diag3");
fs.mkdirSync(OUT, { recursive: true });

const MOCK_SESSION = JSON.stringify({
  id: "usr-001", name: "관리자", email: "admin@techvalley.io",
  role: "시스템 관리자", appRole: "admin", region: "전체",
});

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const INJECT_OBS = () => {
  window.__hc = [];
  const obs = new MutationObserver(muts => {
    muts.forEach(m => {
      [...m.removedNodes].forEach(n => {
        if (n.nodeType === 1 && (n.tagName === 'STYLE' || n.tagName === 'LINK'))
          window.__hc.push({ t: 'DEL', tag: n.tagName, attr: n.getAttribute('data-emotion') || n.getAttribute('href') || '', ms: Math.round(performance.now()) });
      });
      [...m.addedNodes].forEach(n => {
        if (n.nodeType === 1 && (n.tagName === 'STYLE' || n.tagName === 'LINK'))
          window.__hc.push({ t: 'ADD', tag: n.tagName, attr: n.getAttribute('data-emotion') || n.getAttribute('href') || '', ms: Math.round(performance.now()) });
      });
    });
  });
  obs.observe(document.head, { childList: true });
};

const GET_OBS = () => { const r = window.__hc || []; window.__hc = []; return r; };

const SNAP = () => {
  const all = [...document.head.querySelectorAll('style[data-emotion]')];
  let rules = 0, speedy = 0, text = 0;
  all.forEach(t => {
    if (t.sheet) rules += t.sheet.cssRules?.length ?? 0;
    t.textContent?.trim() ? text++ : speedy++;
  });
  const globals = all.filter(t => (t.getAttribute('data-emotion') || '').startsWith('css-global'));
  return { total: all.length, text, speedy, rules, globals: globals.length, headTotal: document.head.children.length };
};

async function snap(page, label, screenshot) {
  const d = await page.evaluate(SNAP);
  const changes = await page.evaluate(GET_OBS);
  const adds = changes.filter(c => c.t === 'ADD');
  const dels = changes.filter(c => c.t === 'DEL');

  console.log(`\n[${label}]`);
  console.log(`  emotion: ${d.total}개 (text=${d.text} speedy=${d.speedy}) | globals=${d.globals} | rules=${d.rules} | head=${d.headTotal}`);
  if (dels.length) dels.forEach(c => console.log(`  ❌ DEL ${c.tag} "${c.attr}" t=${c.ms}`));
  if (adds.length) adds.forEach(c => console.log(`  ✅ ADD ${c.tag} "${c.attr}" t=${c.ms}`));
  if (!adds.length && !dels.length) console.log(`  • 변경 없음`);

  if (screenshot) await page.screenshot({ path: path.join(OUT, screenshot) });
  return d;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(s => {
    localStorage.setItem('tv-auth-session', s);
    localStorage.setItem('tv-auto-login', '1');
  }, MOCK_SESSION);
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await sleep(1200);
  await page.evaluate(INJECT_OBS);
  const s0 = await snap(page, '기준: 대시보드 로드', '01_dashboard.png');

  // ── 테마 전환 ──
  const themeBtn = page.locator("button[aria-label='테마 전환']");
  await themeBtn.click(); await sleep(600);
  const s1 = await snap(page, '테마 → dark', '02_dark.png');
  if (s1.globals < s0.globals) console.log(`  ⚠ css-global 태그 감소: ${s0.globals}→${s1.globals}`);

  await themeBtn.click(); await sleep(600);
  const s2 = await snap(page, '테마 → light (재전환)', '03_light_back.png');
  if (s2.globals < s1.globals) console.log(`  ⚠ css-global 태그 감소: ${s1.globals}→${s2.globals}`);

  // ── 빠른 연속 테마 토글 ──
  for (let i = 0; i < 4; i++) { await themeBtn.click(); await sleep(100); }
  await sleep(500);
  const s3 = await snap(page, '빠른 테마토글 x4 후', '04_rapid_theme.png');

  // ── SPA 이동: 이상알람 ──
  await page.locator('text=이상 알람 목록').first().click(); await sleep(1500);
  const s4 = await snap(page, 'SPA → 이상알람', '05_alarms.png');
  if (s4.rules < s0.rules - 50) console.log(`  ⚠ CSS rules 급감: ${s0.rules}→${s4.rules}`);

  // ── SPA 이동: 장비마스터 ──
  await page.locator('text=장비 마스터').first().click(); await sleep(2000);
  const s5 = await snap(page, 'SPA → 장비마스터', '06_equipment.png');
  if (s5.rules < s4.rules - 30) console.log(`  ⚠ CSS rules 감소: ${s4.rules}→${s5.rules}`);

  // ── 테마 전환 (장비마스터에서) ──
  await themeBtn.click(); await sleep(700);
  const s6 = await snap(page, '장비마스터에서 테마→dark', '07_equip_dark.png');

  await themeBtn.click(); await sleep(700);
  const s7 = await snap(page, '장비마스터에서 테마→light', '08_equip_light.png');

  // ── SPA 이동: 대시보드 귀환 ──
  await page.locator('text=통합 관제 대시보드').first().click(); await sleep(1500);
  const s8 = await snap(page, 'SPA → 대시보드 귀환', '09_dashboard_back.png');

  // ── 빠른 연속 SPA ──
  const quickRoutes = ['이상 알람 목록', '원격제어', '서비스 호출·티케팅', '리포트', '통합 관제 대시보드'];
  for (const r of quickRoutes) { await page.locator(`text=${r}`).first().click(); await sleep(250); }
  await sleep(1000);
  const s9 = await snap(page, '빠른 SPA x5 후', '10_rapid_nav.png');

  console.log('\n=== 최종 요약 ===');
  console.log(`기준(대시보드): rules=${s0.rules} emotion=${s0.total} globals=${s0.globals}`);
  console.log(`장비마스터:     rules=${s5.rules} emotion=${s5.total} globals=${s5.globals}`);
  console.log(`빠른 SPA 후:    rules=${s9.rules} emotion=${s9.total} globals=${s9.globals}`);

  if (errs.length) { console.log('\n=== 콘솔 에러 ==='); errs.forEach(e => console.log(' ', e)); }

  await browser.close();
  console.log(`\n저장: ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
