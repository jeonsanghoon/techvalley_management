/**
 * 브라우저 내부에서 emotion cache.insert와 StyleSheet._insertTag를 직접 패치해
 * 첫 dark 전환 시 D1 주입이 왜 실패하는지 추적
 */
import pwPkg from "../../03.source/frontend/node_modules/playwright-core/index.js";
const { chromium } = pwPkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "http://localhost:3000";

const MOCK_SESSION = JSON.stringify({
  id: "usr-001", name: "관리자", email: "admin@techvalley.io",
  role: "시스템 관리자", appRole: "admin", region: "전체",
});

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// 브라우저에 디버그 패치 주입 — cache.insert, StyleSheet.insert 호출 추적
const INJECT_DEBUG = () => {
  window.__debug_log = [];
  const log = (...args) => {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    window.__debug_log.push(msg);
    // console.log('[DIAG]', msg); // 필요 시 활성화
  };

  // emotion cache에 접근하기 위한 방법: React devtools hook 사용
  // React __SECRET_INTERNALS 통해 fiber 트리를 탐색
  // 더 직접적인 방법: emotion의 CacheProvider context 값 읽기

  // 대안: emotion cache의 insert 함수를 MutationObserver로 감시
  // style 태그 추가/삭제를 세밀하게 추적

  window.__style_events = [];
  const obs = new MutationObserver(muts => {
    const ts = performance.now().toFixed(1);
    muts.forEach(m => {
      [...m.removedNodes].forEach(n => {
        if (n.nodeType === 1 && n.tagName === 'STYLE') {
          const ev = { t: 'DEL', ms: ts, attr: n.getAttribute('data-emotion') || '?', rules: n.sheet?.cssRules?.length ?? 0 };
          window.__style_events.push(ev);
          log('DEL', ev.attr, 'rules=' + ev.rules);
        }
      });
      [...m.addedNodes].forEach(n => {
        if (n.nodeType === 1 && n.tagName === 'STYLE') {
          // 즉시 after add: 아직 DOM에 있는지 확인
          requestAnimationFrame(() => {
            const stillInHead = document.head.contains(n);
            const ev = { t: 'ADD', ms: ts, attr: n.getAttribute('data-emotion') || '?', stillInHead, rules: n.sheet?.cssRules?.length ?? 0, text: n.textContent?.slice(0, 80) || '' };
            window.__style_events.push(ev);
            log('ADD', ev.attr, 'stillInHead=' + stillInHead, 'text=' + ev.text.slice(0,40));
          });
        }
      });
    });
  });
  obs.observe(document.head, { childList: true });

  // React 파이버에서 emotion cache 찾기
  function findEmotionCache() {
    // React 내부 키로 fiber root 찾기
    const rootKeys = Object.keys(document.querySelector('[data-reactroot]') || document.body)
      .filter(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternals'));

    if (!rootKeys.length) return null;

    // fiber 트리 탐색은 복잡하므로 대신 window.__emotion_cache 가 있는지 확인
    return null;
  }

  window.__get_events = () => {
    const evs = window.__style_events;
    window.__style_events = [];
    return evs;
  };

  window.__get_log = () => {
    const l = window.__debug_log;
    window.__debug_log = [];
    return l;
  };

  log('debug patch injected');
};

// RAF을 기다린 후 이벤트 수집
const COLLECT = async () => {
  // 여러 RAF 사이클 대기
  return new Promise(r => setTimeout(() => {
    const evs = window.__get_events();
    const logs = window.__get_log();
    const globals = [...document.head.querySelectorAll('style[data-emotion]')]
      .filter(t => t.getAttribute('data-emotion').startsWith('css-global'));
    return r({ evs, logs, globalCount: globals.length });
  }, 300));
};

// 실시간 head 상태 + css-global 상세
const HEAD_STATE = () => {
  const all = [...document.head.querySelectorAll('style[data-emotion]')];
  const globals = all.filter(t => t.getAttribute('data-emotion').startsWith('css-global') || t.getAttribute('data-emotion') === 'css-global');
  return {
    total: all.length,
    globals: globals.length,
    globalDetails: globals.map(t => ({
      attr: t.getAttribute('data-emotion'),
      rules: t.sheet?.cssRules?.length ?? 0,
      text50: (t.textContent || '').slice(0, 50),
      inHead: document.head.contains(t),
    })),
    headSize: document.head.children.length,
  };
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  const consoleLogs = [];
  page.on('console', m => {
    const txt = m.text();
    if (txt.startsWith('[DIAG]') || m.type() === 'error') {
      consoleLogs.push({ type: m.type(), text: txt.slice(0, 200) });
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(s => {
    localStorage.setItem('tv-auth-session', s);
    localStorage.setItem('tv-auto-login', '1');
  }, MOCK_SESSION);
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await sleep(1200);
  await page.evaluate(INJECT_DEBUG);

  const h0 = await page.evaluate(HEAD_STATE);
  console.log('\n=== 초기 상태 ===');
  console.log(`globals=${h0.globals} total=${h0.total}`);
  h0.globalDetails.forEach((d, i) => console.log(`  [${i}] "${d.attr}" rules=${d.rules} text="${d.text50}"`));

  // dark 전환
  await page.locator("button[aria-label='테마 전환']").click();
  await sleep(500);
  const c1 = await page.evaluate(COLLECT);
  const h1 = await page.evaluate(HEAD_STATE);

  console.log('\n=== 첫 번째 dark 전환 후 ===');
  console.log(`globals=${h1.globals} (${h1.globals < h0.globals ? '⚠ 감소!' : 'OK'})`);
  h1.globalDetails.forEach((d, i) => console.log(`  [${i}] "${d.attr}" rules=${d.rules} text="${d.text50}"`));
  console.log('\n이벤트:');
  c1.evs.forEach(e => console.log(`  ${e.t} "${e.attr}" rules=${e.rules} ${e.t==='ADD' ? 'stillInHead=' + e.stillInHead : ''} t=${e.ms}`));
  if (c1.logs.length) console.log('로그:', c1.logs.join('\n'));

  // light 재전환
  await page.locator("button[aria-label='테마 전환']").click();
  await sleep(500);
  const c2 = await page.evaluate(COLLECT);
  const h2 = await page.evaluate(HEAD_STATE);

  console.log('\n=== 두 번째 light 재전환 후 ===');
  console.log(`globals=${h2.globals}`);
  h2.globalDetails.forEach((d, i) => console.log(`  [${i}] "${d.attr}" rules=${d.rules} text="${d.text50}"`));
  console.log('\n이벤트:');
  c2.evs.forEach(e => console.log(`  ${e.t} "${e.attr}" rules=${e.rules} ${e.t==='ADD' ? 'stillInHead=' + e.stillInHead : ''} t=${e.ms}`));

  if (consoleLogs.length > 0) {
    console.log('\n=== 콘솔 ===');
    consoleLogs.forEach(l => console.log(`  [${l.type}]`, l.text));
  }

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
