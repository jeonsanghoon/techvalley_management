/**
 * 브라우저 내에서 StyleSheet._insertTag를 직접 패치하여 호출 여부 확인
 * emotion cache.insert가 호출되지만 _insertTag 호출이 없는지 검증
 */
import pwPkg from "../../03.source/frontend/node_modules/playwright-core/index.js";
const { chromium } = pwPkg;

const BASE_URL = "http://localhost:3000";
const MOCK_SESSION = JSON.stringify({
  id: "usr-001", name: "관리자", email: "admin@techvalley.io",
  role: "시스템 관리자", appRole: "admin", region: "전체",
});

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// emotion StyleSheet 프로토타입 패치 + cache.insert 패치
const PATCH_EMOTION = () => {
  window.__calls = [];

  // StyleSheet constructor 패치: 새 StyleSheet 인스턴스가 생성될 때마다 _insertTag 패치
  const origCreateElement = document.createElement.bind(document);
  // 대신: 주기적으로 emotion cache를 찾아 패치

  // React 루트에서 emotion cache 찾기
  function findEmotionCacheViaDOM() {
    // emotion CacheProvider는 React context를 통해 캐시를 제공
    // 브라우저에서 __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED 를 통해 탐색
    try {
      const ReactInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      if (!ReactInternals) return null;

      // fiber root 찾기
      const root = document.getElementById('__next') || document.querySelector('[data-reactroot]') || document.body;
      const fiberKey = Object.keys(root).find(k => k.startsWith('__reactFiber'));
      if (!fiberKey) return null;

      let fiber = root[fiberKey];
      while (fiber) {
        // CacheProvider context value를 탐색
        if (fiber.memoizedProps?.value?.cache?.insert) {
          return fiber.memoizedProps.value.cache;
        }
        if (fiber.type?.displayName === 'EmotionCacheProvider' ||
            fiber.type?.name === 'EmotionCacheProvider') {
          if (fiber.memoizedState?.cache?.insert) {
            return fiber.memoizedState.cache;
          }
        }
        fiber = fiber.child || fiber.sibling || fiber.return;
        if (!fiber || fiber === root[fiberKey]) break;
      }
    } catch(e) {}
    return null;
  }

  // BFS 방식으로 fiber 탐색
  function findCacheInFiber(startFiber) {
    const visited = new Set();
    const queue = [startFiber];
    let depth = 0;
    while (queue.length && depth < 500) {
      const fiber = queue.shift();
      if (!fiber || visited.has(fiber)) continue;
      visited.add(fiber);
      depth++;

      // memoizedState (useState, useRef) 체크
      let s = fiber.memoizedState;
      while (s) {
        if (s.memoizedState?.cache?.insert && s.memoizedState?.cache?.key === 'css') {
          return s.memoizedState.cache;
        }
        if (s.queue?.dispatch && s.memoizedState?.cache?.key === 'css') {
          return s.memoizedState.cache;
        }
        s = s.next;
      }

      if (fiber.child) queue.push(fiber.child);
      if (fiber.sibling) queue.push(fiber.sibling);
    }
    return null;
  }

  function patchCache(cache) {
    if (cache.__patched) return;
    cache.__patched = true;

    const origInsert = cache.insert;
    cache.insert = function(...args) {
      const [selector, serialized, sheet] = args;
      const isGlobal = !selector;
      window.__calls.push({
        t: 'cache.insert',
        selector: selector || '(global)',
        name: serialized?.name,
        stylesLen: serialized?.styles?.length,
        stylesStart: serialized?.styles?.slice(0, 80),
        sheetTagsLen: sheet?.tags?.length,
        sheetBefore: sheet?.before ? sheet.before.tagName + (sheet.before.getAttribute('data-emotion') || '') : null,
        isGlobal,
        ms: performance.now().toFixed(1),
      });
      return origInsert.apply(this, args);
    };

    // sheet._insertTag 패치
    const origProto = cache.sheet.constructor.prototype;
    if (!origProto.__patchedInsertTag) {
      origProto.__patchedInsertTag = true;
      const origInsertTag = origProto._insertTag;
      // 인스턴스 단에서 패치 (프로토타입 패치는 위험할 수 있음)
    }

    window.__calls.push({ t: 'cache patched', key: cache.key });
  }

  // 페이지 로드 후 React fiber 탐색으로 cache 찾기
  setTimeout(() => {
    const body = document.body;
    const fiberKey = Object.keys(body).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternals'));
    if (fiberKey) {
      const cache = findCacheInFiber(body[fiberKey]);
      if (cache) {
        patchCache(cache);
      } else {
        window.__calls.push({ t: 'ERROR: cache not found' });
      }
    } else {
      window.__calls.push({ t: 'ERROR: no fiber key' });
    }
  }, 100);

  window.__get_calls = () => { const c = window.__calls; window.__calls = []; return c; };
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
  await page.evaluate(PATCH_EMOTION);
  await sleep(300);

  const c0 = await page.evaluate(() => window.__get_calls());
  console.log('패치 상태:', c0.map(c => c.t));

  // dark 전환
  await page.locator("button[aria-label='테마 전환']").click();
  await sleep(500);

  const c1 = await page.evaluate(() => window.__get_calls());
  const globalCalls = c1.filter(c => c.isGlobal);
  const nonGlobal = c1.filter(c => !c.isGlobal && c.t === 'cache.insert');
  console.log(`\n=== dark 전환 후 cache.insert 호출: ${c1.filter(c=>c.t==='cache.insert').length}건 ===`);
  console.log(`  글로벌 삽입(selector=''): ${globalCalls.length}건`);
  console.log(`  컴포넌트 삽입: ${nonGlobal.length}건`);

  if (globalCalls.length > 0) {
    console.log('\n  글로벌 삽입 상세:');
    globalCalls.forEach((c, i) => console.log(`    [${i}] name=${c.name} stylesLen=${c.stylesLen} sheetTagsLen=${c.sheetTagsLen} before=${c.before} styles="${c.stylesStart}"`));
  } else {
    console.log('  ⚠ 글로벌 삽입 없음! (CssBaseline 스타일이 주입되지 않음)');
  }

  const globals = await page.evaluate(() => {
    return [...document.head.querySelectorAll('style[data-emotion]')]
      .filter(t => t.getAttribute('data-emotion').startsWith('css-global') || t.getAttribute('data-emotion') === 'css-global')
      .length;
  });
  console.log(`globals 수: ${globals}`);

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
