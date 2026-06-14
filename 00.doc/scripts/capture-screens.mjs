import { chromium } from "../../03.source/frontend/node_modules/playwright/index.mjs";
import { writeFileSync } from "fs";

const BASE = "http://localhost:3000";
const W = 1920;
const H = 1080;

// 탭이 있는 페이지 정의
const TAB_PAGES = {
  "/equipment-logs": [
    "튜브", "디텍터", "본체", "알람", "원격제어", "펌웨어", "주기", "이벤트", "감사"
  ],
};

const PAGES = [
  { path: "/dashboard",              title: "대시보드" },
  { path: "/equipment",              title: "장비 관리" },
  { path: "/equipment-logs",         title: "장비 이력" },
  { path: "/data-pipeline",          title: "데이터 파이프라인" },
  { path: "/metric-stream",          title: "메트릭 스트림" },
  { path: "/alarms",                 title: "알람" },
  { path: "/alarm-rules",            title: "알람 규칙" },
  { path: "/service-tickets",        title: "서비스 티켓" },
  { path: "/service-progress",       title: "서비스 진행" },
  { path: "/inspection",             title: "점검" },
  { path: "/installation",           title: "설치" },
  { path: "/remote-control",         title: "원격 제어" },
  { path: "/reports",                title: "보고서" },
  { path: "/parts-orders",           title: "부품 주문" },
  { path: "/parts-schedule",         title: "부품 일정" },
  { path: "/customers",              title: "고객사" },
  { path: "/sla",                    title: "SLA" },
  { path: "/as",                     title: "A/S" },
  { path: "/settings/notifications", title: "알림 설정" },
  { path: "/settings/firmware",      title: "펌웨어 설정" },
  { path: "/admin/users",            title: "사용자 관리" },
  { path: "/admin/codes",            title: "코드 관리" },
  { path: "/admin/menus",            title: "메뉴 관리" },
  { path: "/admin/iot-auth",         title: "IoT 인증" },
];

async function applyModeToContext(ctx, page, mode) {
  await ctx.addCookies([{
    name: "tv-color-mode", value: mode,
    domain: "localhost", path: "/",
    httpOnly: false, secure: false, sameSite: "Lax",
  }]);
  await page.evaluate((m) => {
    document.documentElement.setAttribute("data-color-mode", m);
    document.documentElement.style.colorScheme = m;
    try { localStorage.setItem("tv-color-mode", m); } catch {}
    document.cookie = `tv-color-mode=${m};path=/;max-age=31536000;SameSite=Lax`;
  }, mode);
}

async function isPermissionDenied(page) {
  try {
    const texts = ["접근 권한", "권한이 없", "Unauthorized", "Forbidden"];
    for (const t of texts) {
      if (await page.locator(`text=${t}`).count() > 0) return true;
    }
    return false;
  } catch { return false; }
}

// 스크롤 가능한 페이지의 뷰포트 캡처 위치 목록 반환
async function getScrollPositions(page) {
  const scrollH = await page.evaluate(() =>
    Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
  );
  if (scrollH <= H * 1.25) return [0]; // 스크롤 없음 → 1장

  const positions = [0];
  let pos = Math.round(H * 0.85); // 15% 겹침
  while (pos < scrollH - H * 0.3) {
    positions.push(pos);
    pos += Math.round(H * 0.85);
  }
  // 마지막은 항상 맨 아래
  const lastPos = scrollH - H;
  if (lastPos > 0 && lastPos > positions[positions.length - 1] + 100) {
    positions.push(lastPos);
  }
  return positions;
}

async function doLogin(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  const loginBtn = page.locator("button[type=submit], button:has-text('로그인')").first();
  if (await loginBtn.isVisible({ timeout: 3000 })) await loginBtn.click();
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 10000 });
  await page.waitForLoadState("networkidle");
}

async function captureAll(browser, mode, outDir) {
  const meta = [];

  // 로그인 페이지
  {
    const ctx0 = await browser.newContext({ viewport: { width: W, height: H } });
    const pg0 = await ctx0.newPage();
    await pg0.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await applyModeToContext(ctx0, pg0, mode);
    await pg0.waitForTimeout(600);
    const f = `${outDir}/00_login.png`;
    await pg0.screenshot({ path: f, fullPage: false });
    meta.push({ file: f, title: "로그인", path: "/login" });
    await ctx0.close();
  }

  // 쿠키 먼저 심고 로그인
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  await ctx.addCookies([{
    name: "tv-color-mode", value: mode,
    domain: "localhost", path: "/",
    httpOnly: false, secure: false, sameSite: "Lax",
  }]);
  const page = await ctx.newPage();
  await doLogin(page);
  await applyModeToContext(ctx, page, mode);
  await page.waitForTimeout(1000);

  let permDeniedCaptured = false; // 접근 권한 없음 화면은 최초 1회만

  for (let i = 0; i < PAGES.length; i++) {
    const { path, title } = PAGES[i];
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 20000 });
      await page.evaluate((m) => {
        document.documentElement.setAttribute("data-color-mode", m);
        document.documentElement.style.colorScheme = m;
        document.cookie = `tv-color-mode=${m};path=/;max-age=31536000;SameSite=Lax`;
      }, mode);
      await page.waitForTimeout(1500);

      // 접근 권한 없음 중복 처리
      const denied = await isPermissionDenied(page);
      if (denied) {
        if (permDeniedCaptured) {
          console.log(`  [${mode}] ${title} → 접근 권한 없음 (중복 스킵)`);
          continue;
        }
        permDeniedCaptured = true;
        const idx = String(i + 1).padStart(2, "0");
        const f = `${outDir}/${idx}_no-permission.png`;
        await page.screenshot({ path: f, fullPage: false });
        meta.push({ file: f, title: "접근 권한 없음", path });
        console.log(`  [${mode}] ${title} → 접근 권한 없음 (1회 캡처)`);
        continue;
      }

      const tabs = TAB_PAGES[path];
      if (tabs) {
        // 탭이 있는 페이지: 각 탭 캡처
        for (let t = 0; t < tabs.length; t++) {
          const tabLabel = tabs[t];
          try {
            const tabEl = page.getByRole("tab", { name: tabLabel }).first();
            if (await tabEl.isVisible({ timeout: 3000 })) {
              await tabEl.click();
              await page.waitForTimeout(800);
            }
          } catch {}
          const idx = String(i + 1).padStart(2, "0");
          const safe = path.replace(/\//g, "_").replace(/^_/, "");
          const f = `${outDir}/${idx}_${safe}_tab${t + 1}_${tabLabel}.png`;
          await page.screenshot({ path: f, fullPage: false });
          meta.push({ file: f, title: `${title} — ${tabLabel}`, path, tab: tabLabel });
          console.log(`  [${mode}] ${title} — ${tabLabel} ✓`);
        }
      } else {
        // 스크롤 캡처
        const positions = await getScrollPositions(page);
        const suffixes = positions.length === 1 ? [""] : positions.map((_, k) => `_${k + 1}`);

        for (let k = 0; k < positions.length; k++) {
          await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), positions[k]);
          await page.waitForTimeout(300);

          const idx = String(i + 1).padStart(2, "0");
          const safe = path.replace(/\//g, "_").replace(/^_/, "");
          const f = `${outDir}/${idx}_${safe}${suffixes[k]}.png`;
          const slideTitle = positions.length === 1 ? title :
            k === 0 ? `${title} (상단)` :
            k === positions.length - 1 ? `${title} (하단)` :
            `${title} (${k + 1})`;

          await page.screenshot({ path: f, fullPage: false });
          meta.push({ file: f, title: slideTitle, path });
          console.log(`  [${mode}] ${slideTitle} ✓`);
        }
      }
    } catch (e) {
      console.warn(`  [${mode}] ${title} 실패: ${e.message}`);
    }
  }

  await ctx.close();
  return meta;
}

(async () => {
  const browser = await chromium.launch({
    executablePath: "/Users/jeonsanghun/Library/Caches/ms-playwright/chromium-1148/chrome-mac/Chromium.app/Contents/MacOS/Chromium",
    headless: true,
  });

  const results = { light: [], dark: [] };
  for (const mode of ["light", "dark"]) {
    console.log(`\n=== ${mode.toUpperCase()} 모드 캡처 시작 ===`);
    results[mode] = await captureAll(browser, mode, `/tmp/tv-screenshots/${mode}`);
  }

  writeFileSync("/tmp/tv-screenshots/meta.json", JSON.stringify(results, null, 2));
  console.log(`\n✅ 스크린샷 완료 → /tmp/tv-screenshots/`);
  await browser.close();
})();
