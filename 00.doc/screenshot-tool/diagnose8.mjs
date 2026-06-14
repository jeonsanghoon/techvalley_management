/**
 * /alarms 페이지 emotion 스타일 주입 상태 진단
 */
import pwPkg from "../../03.source/frontend/node_modules/playwright-core/index.js";
const { chromium } = pwPkg;

const BASE_URL = "http://localhost:3000";
const MOCK_SESSION = JSON.stringify({
  id: "usr-001", name: "관리자", email: "admin@techvalley.io",
  role: "시스템 관리자", appRole: "admin", region: "전체",
});

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const GET_STYLE_STATE = () => {
  const emotionTags = [...document.head.querySelectorAll('style[data-emotion]')];
  const globalTags = emotionTags.filter(t => t.getAttribute('data-emotion').startsWith('css-global'));
  const compTags = emotionTags.filter(t => !t.getAttribute('data-emotion').startsWith('css-global'));

  // MUI Paper 클래스가 실제 적용됐는지 체크
  const paperEl = document.querySelector('.MuiPaper-root');
  const paperStyles = paperEl ? window.getComputedStyle(paperEl) : null;

  // baseline tag
  const baselineTag = document.head.querySelector('style[data-tv-baseline]');

  return {
    emotionTotal: emotionTags.length,
    globals: globalTags.length,
    components: compTags.length,
    totalCSSRules: emotionTags.reduce((s, t) => s + (t.sheet?.cssRules?.length ?? 0), 0),
    hasBaseline: !!baselineTag,
    baselineLen: baselineTag?.textContent?.length ?? 0,
    paperEl: !!paperEl,
    paperBg: paperStyles?.backgroundColor ?? 'N/A',
    paperDisplay: paperStyles?.display ?? 'N/A',
    // 첫 번째 emotion 태그 내용 확인
    firstEmotionContent: emotionTags[0]?.textContent?.slice(0, 100) ?? 'none',
    bodyBg: window.getComputedStyle(document.body).backgroundColor,
  };
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  const errors = [];
  page.on('console', m => {
    if (m.type() === 'error') errors.push(m.text().slice(0, 200));
  });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message.slice(0, 200)));

  // 세션 설정
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(s => {
    localStorage.setItem('tv-auth-session', s);
    localStorage.setItem('tv-auto-login', '1');
  }, MOCK_SESSION);

  // === 케이스 1: /alarms 직접 접근 ===
  console.log('\n=== [케이스 1] /alarms 직접 접근 ===');
  await page.goto(`${BASE_URL}/alarms`, { waitUntil: 'networkidle' });
  await sleep(1500);
  const s1 = await page.evaluate(GET_STYLE_STATE);
  console.log(JSON.stringify(s1, null, 2));
  if (errors.length) { console.log('JS 에러:', errors); errors.length = 0; }

  // === 케이스 2: /dashboard → /alarms SPA 이동 ===
  console.log('\n=== [케이스 2] /dashboard → /alarms SPA 이동 ===');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await sleep(1000);
  const sDash = await page.evaluate(GET_STYLE_STATE);
  console.log('dashboard 상태:', { emotion: sDash.emotionTotal, globals: sDash.globals, rules: sDash.totalCSSRules, paperBg: sDash.paperBg });

  // SPA 이동
  await page.evaluate(() => {
    window.history.pushState({}, '', '/alarms');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await sleep(500);
  // 실제 Link 클릭으로 이동
  await page.goto(`${BASE_URL}/alarms`, { waitUntil: 'networkidle' });
  await sleep(1000);
  const s2 = await page.evaluate(GET_STYLE_STATE);
  console.log('alarms 상태 (dashboard 거쳐 이동):', JSON.stringify(s2, null, 2));
  if (errors.length) { console.log('JS 에러:', errors); errors.length = 0; }

  // === 케이스 3: /alarms에서 테마 토글 ===
  console.log('\n=== [케이스 3] /alarms에서 테마 토글 ===');
  await page.goto(`${BASE_URL}/alarms`, { waitUntil: 'networkidle' });
  await sleep(1000);
  const sBefore = await page.evaluate(GET_STYLE_STATE);
  console.log('토글 전:', { emotion: sBefore.emotionTotal, globals: sBefore.globals, rules: sBefore.totalCSSRules, paperBg: sBefore.paperBg });

  await page.locator("button[aria-label='테마 전환']").click();
  await sleep(600);
  const sAfter = await page.evaluate(GET_STYLE_STATE);
  console.log('토글 후:', { emotion: sAfter.emotionTotal, globals: sAfter.globals, rules: sAfter.totalCSSRules, paperBg: sAfter.paperBg });

  if (errors.length) { console.log('JS 에러:', errors); }

  await page.screenshot({ path: '/Users/jeonsanghun/source/project/techvalley/screenshot-tool/alarms-debug.png', fullPage: false });
  console.log('\n스크린샷 저장: alarms-debug.png');

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
