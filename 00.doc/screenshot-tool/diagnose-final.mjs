/**
 * 최종 CSS 안정성 검증:
 * 1. 라이트 모드 시작 → 다크 전환 → 라이트 재전환
 * 2. 다크 모드 시작 → 라이트 전환 → 다크 재전환
 * 3. SPA 이동 중 테마 전환
 */
import pwPkg from "../../03.source/frontend/node_modules/playwright-core/index.js";
const { chromium } = pwPkg;

const BASE_URL = "http://localhost:3000";
const MOCK = JSON.stringify({ id:"usr-001", name:"관리자", email:"admin@techvalley.io", role:"시스템 관리자", appRole:"admin", region:"전체" });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const SNAP = (label) => {
  const tags = [...document.head.querySelectorAll('style[data-emotion]')];
  const globals = tags.filter(t => t.getAttribute('data-emotion').startsWith('css-global'));
  const rules = tags.reduce((s, t) => s + (t.sheet?.cssRules?.length ?? 0), 0);
  const baseline = document.head.querySelector('style[data-tv-baseline]');
  const paper = document.querySelector('.MuiPaper-root');
  const chip = document.querySelector('.MuiChip-root');
  return {
    label,
    emotion: tags.length,
    globals: globals.length,
    rules,
    baseline: !!baseline,
    baselineMode: baseline?.textContent?.includes('color-scheme:dark') ? 'dark' : 'light',
    bodyBg: window.getComputedStyle(document.body).backgroundColor,
    paperBg: paper ? window.getComputedStyle(paper).backgroundColor : 'N/A',
    chipBg: chip ? window.getComputedStyle(chip).backgroundColor : 'N/A',
    mode: document.documentElement.getAttribute('data-color-mode'),
    allInHead: tags.every(t => document.head.contains(t)),
  };
};

function printSnap(s) {
  const ok = s.allInHead ? '✓' : '✗';
  const modeMatch = s.mode === s.baselineMode ? '✓' : '✗모드불일치';
  console.log(`  [${s.label}] emotion=${s.emotion} globals=${s.globals} rules=${s.rules} mode=${s.mode} inHead=${ok} ${modeMatch}`);
  console.log(`    bodyBg=${s.bodyBg} paperBg=${s.paperBg.slice(0,30)}`);
}

async function runTest(browser, startMode, label) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(BASE_URL);
  await page.evaluate((args) => {
    localStorage.setItem('tv-auth-session', args.mock);
    localStorage.setItem('tv-auto-login', '1');
    localStorage.setItem('tv-color-mode', args.mode);
    document.cookie = `tv-color-mode=${args.mode};path=/`;
  }, { mock: MOCK, mode: startMode });

  await page.goto(`${BASE_URL}/alarms`, { waitUntil: 'networkidle' });
  await sleep(1200);

  console.log(`\n=== ${label} (시작: ${startMode}) ===`);
  printSnap(await page.evaluate(SNAP, '초기'));

  // 1차 전환
  await page.locator("button[aria-label='테마 전환']").click();
  await sleep(700);
  printSnap(await page.evaluate(SNAP, '1차 전환'));

  // 2차 전환 (복귀)
  await page.locator("button[aria-label='테마 전환']").click();
  await sleep(700);
  printSnap(await page.evaluate(SNAP, '2차 전환(복귀)'));

  // 스크린샷
  await page.screenshot({ path: `/Users/jeonsanghun/source/project/techvalley/screenshot-tool/final-${startMode}.png` });

  await ctx.close();
}

async function runSPATest(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(BASE_URL);
  await page.evaluate(s => {
    localStorage.setItem('tv-auth-session', s);
    localStorage.setItem('tv-auto-login', '1');
    localStorage.setItem('tv-color-mode', 'dark');
    document.cookie = 'tv-color-mode=dark;path=/';
  }, MOCK);

  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await sleep(1000);

  console.log('\n=== SPA 이동 + 테마 전환 ===');
  printSnap(await page.evaluate(SNAP, 'dashboard(dark)'));

  // /alarms SPA 이동
  await page.goto(`${BASE_URL}/alarms`, { waitUntil: 'networkidle' });
  await sleep(800);
  printSnap(await page.evaluate(SNAP, 'alarms(dark)'));

  // 라이트 전환
  await page.locator("button[aria-label='테마 전환']").click();
  await sleep(700);
  printSnap(await page.evaluate(SNAP, 'alarms(light 전환)'));

  // /equipment SPA 이동
  await page.goto(`${BASE_URL}/equipment`, { waitUntil: 'networkidle' });
  await sleep(800);
  printSnap(await page.evaluate(SNAP, 'equipment(light)'));

  // 다크 재전환
  await page.locator("button[aria-label='테마 전환']").click();
  await sleep(700);
  printSnap(await page.evaluate(SNAP, 'equipment(dark 재전환)'));

  await ctx.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  await runTest(browser, 'light', '라이트 시작');
  await runTest(browser, 'dark', '다크 시작');
  await runSPATest(browser);

  await browser.close();
  console.log('\n✅ 검증 완료');
}

main().catch(e => { console.error(e); process.exit(1); });
