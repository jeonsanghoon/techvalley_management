import pwPkg from "../../03.source/frontend/node_modules/playwright-core/index.js";
const { chromium } = pwPkg;
import PptxGenJs from "./node_modules/pptxgenjs/dist/pptxgen.cjs.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "http://localhost:3000";
const SCREENSHOT_DIR = path.join(__dirname, "../screenshots");

// 모든 화면 목록 (label, path, hash, group)
const PAGES = [
  { label: "로그인", path: "/login", hash: "", group: "" },
  // 관제·모니터링
  { label: "통합 관제 대시보드", path: "/dashboard", hash: "", group: "관제·모니터링" },
  { label: "데이터 수집·파이프라인", path: "/data-pipeline", hash: "", group: "관제·모니터링" },
  { label: "주기 메트릭", path: "/metric-stream", hash: "periodic", group: "관제·모니터링" },
  { label: "이벤트 메트릭", path: "/metric-stream", hash: "event", group: "관제·모니터링" },
  { label: "펌웨어 메트릭", path: "/metric-stream", hash: "firmware", group: "관제·모니터링" },
  { label: "제어 메트릭", path: "/metric-stream", hash: "control", group: "관제·모니터링" },
  { label: "장비 로그", path: "/equipment-logs", hash: "", group: "관제·모니터링" },
  // 알람·원격제어
  { label: "이상 알람 목록", path: "/alarms", hash: "", group: "알람·원격제어" },
  { label: "알람 룰·EventBridge", path: "/alarm-rules", hash: "", group: "알람·원격제어" },
  { label: "원격제어", path: "/remote-control", hash: "", group: "알람·원격제어" },
  // 서비스·알람 처리
  { label: "서비스 호출·티케팅", path: "/service-tickets", hash: "", group: "서비스·알람 처리" },
  { label: "처리 진행·엔지니어 배정", path: "/service-progress", hash: "", group: "서비스·알람 처리" },
  { label: "SLA·서비스 가능 수준", path: "/sla", hash: "", group: "서비스·알람 처리" },
  // 장비·설치·고객
  { label: "장비 마스터", path: "/equipment", hash: "", group: "장비·설치·고객" },
  { label: "장비 설치 관리", path: "/installation", hash: "", group: "장비·설치·고객" },
  { label: "고객사·설치현장", path: "/customers", hash: "", group: "장비·설치·고객" },
  // 부품·AS
  { label: "부품 발주 요청", path: "/parts-orders", hash: "", group: "부품·AS" },
  { label: "배송·일정 추적", path: "/parts-schedule", hash: "", group: "부품·AS" },
  { label: "AS(정비) 관리", path: "/as", hash: "", group: "부품·AS" },
  // 검사·리포트
  { label: "검사·수율 관리", path: "/inspection", hash: "", group: "검사·리포트" },
  { label: "리포트", path: "/reports", hash: "", group: "검사·리포트" },
  // 설정
  { label: "알림 채널", path: "/settings/notifications", hash: "", group: "설정" },
  { label: "펌웨어·OTA", path: "/settings/firmware", hash: "", group: "설정" },
  // 시스템 관리
  { label: "사용자·권한", path: "/admin/users", hash: "", group: "시스템 관리" },
  { label: "공통코드", path: "/admin/codes", hash: "", group: "시스템 관리" },
  { label: "메뉴 권한(RBAC)", path: "/admin/menus", hash: "", group: "시스템 관리" },
  { label: "IoT 장비 인증", path: "/admin/iot-auth", hash: "", group: "시스템 관리" },
];

// mock-data usr-001 (시스템 관리자) 세션 — AuthUser 구조 그대로
const MOCK_SESSION = JSON.stringify({
  id: "usr-001",
  name: "관리자",
  email: "admin@techvalley.io",
  role: "시스템 관리자",
  appRole: "admin",
  region: "전체",
});

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  const results = [];

  for (let i = 0; i < PAGES.length; i++) {
    const { label, path: pagePath, hash, group } = PAGES[i];

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // 로그인 페이지가 아닌 경우 세션 주입
    if (pagePath !== "/login") {
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await page.evaluate((session) => {
        localStorage.setItem("tv-auth-session", session);
        localStorage.setItem("tv-auto-login", "1");
      }, MOCK_SESSION);
    }

    const url = hash
      ? `${BASE_URL}${pagePath}#${hash}`
      : `${BASE_URL}${pagePath}`;

    const safeLabel = label.replace(/[·\/\s]/g, "_").replace(/[^\w가-힣]/g, "");
    const filename = `${String(i).padStart(2, "0")}_${safeLabel}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
      await sleep(2500);

      // hash가 있는 경우 해당 탭이 활성화될 때까지 대기
      if (hash) {
        await sleep(1000);
      }

      await page.screenshot({ path: filepath, fullPage: false });
      console.log(`✓ [${String(i).padStart(2, "0")}] ${label}`);
      results.push({ label, file: filename, group });
    } catch (err) {
      console.error(`✗ ${label}: ${err.message.split("\n")[0]}`);
      results.push({ label, file: null, group });
    }

    await context.close();
  }

  await browser.close();

  // ── PPTX 생성 ──
  console.log("\n📊 PPTX 생성 중...");
  const pptx = new PptxGenJs();
  pptx.layout = "LAYOUT_16x9";
  pptx.title = "테크밸리 IoT 서비스 플랫폼 - 화면 목록";

  // 표지 슬라이드
  const cover = pptx.addSlide();
  cover.background = { color: "0D0F12" };
  cover.addText("테크밸리 IoT 서비스 플랫폼", {
    x: 0.5, y: 2.8, w: 9, h: 1.4,
    fontSize: 40, bold: true, color: "FFFFFF", align: "center",
    fontFace: "Malgun Gothic",
  });
  cover.addText("화면 목록 스크린샷", {
    x: 0.5, y: 4.3, w: 9, h: 0.8,
    fontSize: 24, color: "9CA3AF", align: "center",
    fontFace: "Malgun Gothic",
  });
  cover.addText(`총 ${results.filter((r) => r.file).length}개 화면  ·  Full HD 1920×1080`, {
    x: 0.5, y: 5.2, w: 9, h: 0.5,
    fontSize: 14, color: "6B7280", align: "center",
    fontFace: "Malgun Gothic",
  });

  // 각 스크린샷 슬라이드
  for (const { label, file, group } of results) {
    if (!file) continue;
    const imgPath = path.join(SCREENSHOT_DIR, file);
    if (!fs.existsSync(imgPath)) continue;

    const slide = pptx.addSlide();
    slide.background = { color: "0D0F12" };

    // 상단 제목 바 (40px 높이 → 약 0.42 inch)
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: "100%", h: 0.42,
      fill: { color: "1C1F24" },
      line: { color: "2A2D31", width: 0.5 },
    });
    // 그룹 태그
    if (group) {
      slide.addText(group, {
        x: 0.18, y: 0.04, w: 2.5, h: 0.32,
        fontSize: 9, color: "6B7280", valign: "middle",
        fontFace: "Malgun Gothic",
      });
    }
    // 페이지 제목
    slide.addText(label, {
      x: group ? 2.5 : 0.18, y: 0.04, w: 7, h: 0.32,
      fontSize: 13, bold: true, color: "E5E7EB", valign: "middle",
      fontFace: "Malgun Gothic",
    });

    // 이미지 (나머지 공간 꽉 채우기)
    slide.addImage({
      path: imgPath,
      x: 0,
      y: 0.42,
      w: "100%",
      h: 7.08,
      sizing: { type: "cover", w: "100%", h: 7.08 },
    });
  }

  const outPath = path.join(__dirname, "../테크밸리_화면목록.pptx");
  await pptx.writeFile({ fileName: outPath });
  console.log(`\n✅ PPTX 저장 완료:`);
  console.log(`   ${outPath}`);
  console.log(`   슬라이드 수: ${results.filter((r) => r.file).length + 1} (표지 포함)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
