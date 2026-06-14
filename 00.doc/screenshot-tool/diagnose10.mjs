/**
 * 다크 모드 시작 → 라이트 전환 시 emotion 스타일 추적
 */
import pwPkg from "../../03.source/frontend/node_modules/playwright-core/index.js";
const { chromium } = pwPkg;

const BASE_URL = "http://localhost:3000";
const MOCK = JSON.stringify({ id:"usr-001", name:"관리자", email:"admin@techvalley.io", role:"시스템 관리자", appRole:"admin", region:"전체" });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const SNAP = () => {
  const tags = [...document.head.querySelectorAll('style[data-emotion]')];
  const globalTags = tags.filter(t => t.getAttribute('data-emotion').startsWith('css-global'));
  const compTags = tags.filter(t => !t.getAttribute('data-emotion').startsWith('css-global'));

  const baseline = document.head.querySelector('style[data-tv-baseline]');
  const paper = document.querySelector('.MuiPaper-root');
  const chip = document.querySelector('.MuiChip-root');

  const cs = el => el ? window.getComputedStyle(el).backgroundColor : 'N/A';

  return {
    emotion: tags.length,
    globals: globalTags.length,
    comp: compTags.length,
    rules: tags.reduce((s, t) => s + (t.sheet?.cssRules?.length ?? 0), 0),
    baseline: baseline ? baseline.textContent.slice(0, 80) : 'MISSING',
    bodyBg: window.getComputedStyle(document.body).backgroundColor,
    paperBg: cs(paper),
    chipBg: cs(chip),
    mode: document.documentElement.getAttribute('data-color-mode'),
    // 태그가 실제 document.head에 붙어있는지 확인
    allInHead: tags.every(t => document.head.contains(t)),
  };
};

const OBS = () => {
  window.__evts = [];
  const obs = new MutationObserver(muts => {
    muts.forEach(m => {
      [...m.removedNodes].filter(n => n.tagName === 'STYLE').forEach(n => {
        window.__evts.push({ t: 'DEL', attr: n.getAttribute('data-emotion') || '?', rules: n.sheet?.cssRules?.length ?? 0 });
      });
      [...m.addedNodes].filter(n => n.tagName === 'STYLE').forEach(n => {
        window.__evts.push({ t: 'ADD', attr: n.getAttribute('data-emotion') || '?', inHead: document.head.contains(n) });
      });
    });
  });
  obs.observe(document.head, { childList: true });
  window.__getEvts = () => { const e = window.__evts; window.__evts = []; return e; };
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // 다크 모드로 시작
  await page.goto(BASE_URL);
  await page.evaluate(s => {
    localStorage.setItem('tv-auth-session', s);
    localStorage.setItem('tv-auto-login', '1');
    localStorage.setItem('tv-color-mode', 'dark');
    document.cookie = 'tv-color-mode=dark;path=/';
  }, MOCK);

  await page.goto(`${BASE_URL}/alarms`, { waitUntil: 'networkidle' });
  await sleep(1500);

  // Observer 설치 후 초기 상태
  await page.evaluate(OBS);
  const s0 = await page.evaluate(SNAP);
  console.log('\n[0] 다크 모드 /alarms 초기:');
  console.log(JSON.stringify(s0, null, 2));

  // ── 다크 → 라이트 전환 ──
  console.log('\n>> 테마 전환 클릭 (dark → light)');
  await page.locator("button[aria-label='테마 전환']").click();
  await sleep(800);

  const evts1 = await page.evaluate(() => window.__getEvts());
  const s1 = await page.evaluate(SNAP);
  console.log('\n[1] 라이트 전환 후:');
  console.log(JSON.stringify(s1, null, 2));
  console.log('\n이벤트 (DEL/ADD):');
  evts1.forEach(e => console.log(` ${e.t} "${e.attr?.slice(0,40)}" ${e.t === 'ADD' ? 'inHead=' + e.inHead : 'rules=' + e.rules}`));
  console.log(`  총 DEL=${evts1.filter(e=>e.t==='DEL').length} ADD=${evts1.filter(e=>e.t==='ADD').length}`);

  // ADD인데 inHead=false인 것이 있으면 stale container 문제
  const detachedAdds = evts1.filter(e => e.t === 'ADD' && e.inHead === false);
  if (detachedAdds.length > 0) {
    console.log('\n⚠ detached container에 삽입된 태그 발견!');
    detachedAdds.forEach(e => console.log(`  "${e.attr}"`));
  } else {
    console.log('\n✓ 모든 ADD가 document.head에 올바르게 삽입됨');
  }

  await page.screenshot({ path: '/Users/jeonsanghun/source/project/techvalley/screenshot-tool/dark-to-light.png' });

  // ── 라이트 → 다크 전환 ──
  console.log('\n>> 테마 전환 클릭 (light → dark)');
  await page.evaluate(() => { window.__evts = []; });
  await page.locator("button[aria-label='테마 전환']").click();
  await sleep(800);

  const evts2 = await page.evaluate(() => window.__getEvts());
  const s2 = await page.evaluate(SNAP);
  console.log('\n[2] 다크 재전환 후:');
  console.log(`  emotion=${s2.emotion} globals=${s2.globals} rules=${s2.rules} bodyBg=${s2.bodyBg}`);
  console.log(`  DEL=${evts2.filter(e=>e.t==='DEL').length} ADD=${evts2.filter(e=>e.t==='ADD').length}`);

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
