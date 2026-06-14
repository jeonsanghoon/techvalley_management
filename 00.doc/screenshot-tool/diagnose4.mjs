/**
 * 브라우저 내부에서 emotion cache.insert와 StyleSheet.insert를 패치해
 * 테마 전환 시 실제 호출 흐름 추적
 */
import pwPkg from "../../03.source/frontend/node_modules/playwright-core/index.js";
const { chromium } = pwPkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "http://localhost:3000";
const OUT = path.join(__dirname, "../diag4");
fs.mkdirSync(OUT, { recursive: true });

const MOCK_SESSION = JSON.stringify({
  id: "usr-001", name: "관리자", email: "admin@techvalley.io",
  role: "시스템 관리자", appRole: "admin", region: "전체",
});

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// 브라우저에서 실행: emotion style 태그 내 CssBaseline 관련 규칙 확인
const CHECK_CSSBASELINE = () => {
  const all = [...document.head.querySelectorAll('style[data-emotion]')];
  const globals = all.filter(t => t.getAttribute('data-emotion').startsWith('css-global'));

  const result = {
    globalCount: globals.length,
    globalDetails: globals.map(t => ({
      attr: t.getAttribute('data-emotion'),
      rules: t.sheet?.cssRules?.length ?? 0,
      textLen: t.textContent?.length ?? 0,
      // Check for body/html rules that CssBaseline injects
      hasBodyRule: t.textContent?.includes('body') ||
                   [...(t.sheet?.cssRules ?? [])].some(r => r.cssText?.includes('body')),
      hasColorScheme: t.textContent?.includes('color-scheme') ||
                      [...(t.sheet?.cssRules ?? [])].some(r => r.cssText?.includes('color-scheme')),
      preview: t.textContent?.slice(0, 200) || 'speedy mode (no text)',
    })),
    totalRules: all.reduce((s, t) => s + (t.sheet?.cssRules?.length ?? 0), 0),
  };
  return result;
};

// 브라우저에서: head에서 emotion 태그 내 body 스타일 체크
const CHECK_BODY_STYLE = () => {
  // body의 실제 적용 스타일
  const cs = getComputedStyle(document.body);
  return {
    bgColor: cs.backgroundColor,
    color: cs.color,
    fontFamily: cs.fontFamily.slice(0, 50),
    colorScheme: cs.colorScheme || document.documentElement.style.colorScheme,
    htmlDataMode: document.documentElement.getAttribute('data-color-mode'),
  };
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(s => {
    localStorage.setItem('tv-auth-session', s);
    localStorage.setItem('tv-auto-login', '1');
  }, MOCK_SESSION);
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await sleep(1200);

  console.log('\n=== 초기 상태 (light mode) ===');
  const c0 = await page.evaluate(CHECK_CSSBASELINE);
  const b0 = await page.evaluate(CHECK_BODY_STYLE);
  console.log('css-global 태그:', c0.globalCount);
  c0.globalDetails.forEach((d, i) => console.log(`  [${i}] attr="${d.attr}" rules=${d.rules} hasBody=${d.hasBodyRule} hasColorScheme=${d.hasColorScheme}`));
  console.log('body 스타일:', b0);
  await page.screenshot({ path: path.join(OUT, '01_initial_light.png') });

  // 테마 전환 (→ dark)
  const themeBtn = page.locator("button[aria-label='테마 전환']");
  await themeBtn.click();
  await sleep(800);

  console.log('\n=== 첫 번째 dark 전환 후 ===');
  const c1 = await page.evaluate(CHECK_CSSBASELINE);
  const b1 = await page.evaluate(CHECK_BODY_STYLE);
  console.log('css-global 태그:', c1.globalCount, `(${c1.globalCount < c0.globalCount ? '⚠ 감소!' : '유지'})`);
  c1.globalDetails.forEach((d, i) => console.log(`  [${i}] attr="${d.attr}" rules=${d.rules} hasBody=${d.hasBodyRule} hasColorScheme=${d.hasColorScheme}`));
  console.log('body 스타일:', b1);
  await page.screenshot({ path: path.join(OUT, '02_dark.png') });

  // 다시 light
  await themeBtn.click();
  await sleep(800);

  console.log('\n=== 두 번째 light 재전환 후 ===');
  const c2 = await page.evaluate(CHECK_CSSBASELINE);
  const b2 = await page.evaluate(CHECK_BODY_STYLE);
  console.log('css-global 태그:', c2.globalCount);
  c2.globalDetails.forEach((d, i) => console.log(`  [${i}] attr="${d.attr}" rules=${d.rules} hasBody=${d.hasBodyRule} hasColorScheme=${d.hasColorScheme}`));
  console.log('body 스타일:', b2);
  await page.screenshot({ path: path.join(OUT, '03_light_back.png') });

  await browser.close();
  console.log(`\n저장: ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
