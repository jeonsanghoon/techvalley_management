import pwPkg from "../../03.source/frontend/node_modules/playwright-core/index.js";
const { chromium } = pwPkg;

const BASE_URL = "http://localhost:3000";
const MOCK = JSON.stringify({ id:"usr-001", name:"관리자", email:"admin@techvalley.io", role:"시스템 관리자", appRole:"admin", region:"전체" });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const browser = await chromium.launch({ headless: false }); // 헤드풀 — 실제 렌더 확인
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('[ERR] ' + m.text().slice(0, 300)); });
  page.on('pageerror', e => errors.push('[PAGEERR] ' + e.message.slice(0, 300)));

  await page.goto(BASE_URL);
  await page.evaluate(s => {
    localStorage.setItem('tv-auth-session', s);
    localStorage.setItem('tv-auto-login', '1');
    localStorage.setItem('tv-color-mode', 'dark'); // 다크 모드
    document.cookie = 'tv-color-mode=dark;path=/';
  }, MOCK);

  await page.goto(`${BASE_URL}/alarms`, { waitUntil: 'networkidle' });
  await sleep(2000);

  // 주요 MUI 컴포넌트 스타일 확인
  const check = await page.evaluate(() => {
    const head = document.head;
    const emotionTags = [...head.querySelectorAll('style[data-emotion]')];
    const baselineTag = head.querySelector('style[data-tv-baseline]');

    // MUI 컴포넌트 계산된 스타일
    const paper = document.querySelector('.MuiPaper-root');
    const chip = document.querySelector('.MuiChip-root');
    const btn = document.querySelector('.MuiButtonBase-root');
    const input = document.querySelector('.MuiInputBase-root');

    const cs = el => el ? {
      bg: window.getComputedStyle(el).backgroundColor,
      color: window.getComputedStyle(el).color,
      border: window.getComputedStyle(el).border,
      display: window.getComputedStyle(el).display,
    } : null;

    return {
      emotionCount: emotionTags.length,
      globals: emotionTags.filter(t => t.getAttribute('data-emotion').startsWith('css-global')).length,
      rules: emotionTags.reduce((s, t) => s + (t.sheet?.cssRules?.length ?? 0), 0),
      hasBaseline: !!baselineTag,
      baselineSnippet: baselineTag?.textContent?.slice(0, 150) ?? 'MISSING',
      dataColorMode: document.documentElement.getAttribute('data-color-mode'),
      bodyBg: window.getComputedStyle(document.body).backgroundColor,
      paper: cs(paper),
      chip: cs(chip),
      btn: cs(btn),
      input: cs(input),
      // 페이지에 에러 바운더리가 떴는지
      errorBoundary: !!document.querySelector('[data-error-boundary], .error-boundary'),
    };
  });

  console.log('\n=== /alarms 다크 모드 스타일 체크 ===');
  console.log(JSON.stringify(check, null, 2));

  if (errors.length) {
    console.log('\n=== JS 에러 ===');
    errors.forEach(e => console.log(e));
  }

  // 스크린샷 저장 (다크 모드)
  await page.screenshot({ path: '/Users/jeonsanghun/source/project/techvalley/screenshot-tool/alarms-dark.png' });
  console.log('\n스크린샷: alarms-dark.png');

  // 5초 열어둠 (육안 확인용)
  await sleep(5000);
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
