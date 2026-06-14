/**
 * StyleSheet.prototype.insert 를 직접 패치해 _insertTag 호출 여부와 container 확인
 * emotion-sheet 의 실제 StyleSheet 인스턴스를 패치
 */
import pwPkg from "../../03.source/frontend/node_modules/playwright-core/index.js";
const { chromium } = pwPkg;

const BASE_URL = "http://localhost:3000";
const MOCK_SESSION = JSON.stringify({
  id: "usr-001", name: "관리자", email: "admin@techvalley.io",
  role: "시스템 관리자", appRole: "admin", region: "전체",
});

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// emotion StyleSheet.prototype.insert 와 _insertTag 패치
const PATCH_SHEET = () => {
  window.__insert_calls = [];
  window.__insertTag_calls = [];

  // emotion's createStyleElement가 document.createElement('style')을 호출하므로
  // 이를 intercept해서 추적
  const origCreateElement = document.createElement.bind(document);
  document.createElement = function(tag, options) {
    const el = origCreateElement(tag, options);
    if (tag.toLowerCase() === 'style') {
      const ts = performance.now().toFixed(1);
      // 삽입 시점 추적
      const origBeforeInsert = el.setAttribute.bind(el);
      el.setAttribute = function(name, value) {
        if (name === 'data-emotion') {
          window.__insert_calls.push({
            t: 'createElement-style',
            attr: value,
            ms: ts,
            stack: new Error().stack.split('\n').slice(1,4).join(' | '),
          });
        }
        return origBeforeInsert(name, value);
      };

      // appendChild 또는 insertBefore 가 호출되면 추적
      // insertBefore는 document.head에 직접 있으므로 MutationObserver가 감지
    }
    return el;
  };

  // MutationObserver로 추가/삭제 감지 (즉시 확인)
  const events = [];
  const obs = new MutationObserver(muts => {
    muts.forEach(m => {
      [...m.removedNodes].forEach(n => {
        if (n.nodeType === 1 && n.tagName === 'STYLE') {
          events.push({ t: 'DEL', attr: n.getAttribute('data-emotion') || '?', ms: performance.now().toFixed(1) });
        }
      });
      [...m.addedNodes].forEach(n => {
        if (n.nodeType === 1 && n.tagName === 'STYLE') {
          const attr = n.getAttribute('data-emotion') || '?';
          events.push({ t: 'ADD', attr, ms: performance.now().toFixed(1), inHead: document.head.contains(n) });
          // 5ms 후 다시 확인
          setTimeout(() => {
            events.push({ t: 'CHECK', attr, ms: performance.now().toFixed(1), inHead: document.head.contains(n) });
          }, 5);
        }
      });
    });
  });
  obs.observe(document.head, { childList: true });

  window.__get_insert_data = () => {
    const d = {
      creates: window.__insert_calls,
      events: events.splice(0),
    };
    window.__insert_calls = [];
    return d;
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
  await page.evaluate(PATCH_SHEET);

  // dark 전환
  await page.locator("button[aria-label='테마 전환']").click();
  await sleep(600);  // 충분히 대기

  const data = await page.evaluate(() => window.__get_insert_data());

  console.log('\n=== dark 전환 시 style 태그 생성/삽입 추적 ===');
  console.log(`createElement('style') 호출: ${data.creates.length}건`);
  data.creates.filter(c => c.attr.includes('global') || c.attr === 'css-global').forEach((c, i) => {
    console.log(`  [global-${i}] attr="${c.attr}" t=${c.ms}`);
    if (c.stack) console.log(`    stack: ${c.stack}`);
  });

  console.log(`\nMutationObserver 이벤트: ${data.events.length}건`);
  data.events.filter(e => e.attr === 'css-global' || e.attr.includes('global')).forEach(e => {
    console.log(`  ${e.t} attr="${e.attr}" t=${e.ms} inHead=${e.inHead}`);
  });

  // 최종 상태
  const globals = await page.evaluate(() => {
    return [...document.head.querySelectorAll('style[data-emotion]')]
      .filter(t => { const a = t.getAttribute('data-emotion'); return a === 'css-global' || a.startsWith('css-global '); })
      .map(t => ({ attr: t.getAttribute('data-emotion'), rules: t.sheet?.cssRules?.length ?? 0 }));
  });
  console.log('\n최종 css-global 태그:', globals);

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
