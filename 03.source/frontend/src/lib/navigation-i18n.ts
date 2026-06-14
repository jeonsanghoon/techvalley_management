import type { LocalizableText } from "@/lib/locale/types";

export type NavItemI18n = {
  id: string;
  label: LocalizableText;
  href: string;
  description?: LocalizableText;
  wbs?: string;
};

export type NavGroupI18n = {
  id: string;
  label: LocalizableText;
  items: NavItemI18n[];
};

export const NAVIGATION_I18N: NavGroupI18n[] = [
  {
    id: "monitoring",
    label: { ko: "관제·모니터링", en: "Monitoring" },
    items: [
      {
        id: "dashboard",
        label: { ko: "통합 관제 대시보드", en: "Operations dashboard" },
        href: "/dashboard",
        description: {
          ko: "배치 롤업 플릿 지도·KPI·EMG (스트림 미사용)",
          en: "Batch rollup fleet map · KPIs · EMG (no stream)",
        },
        wbs: "A3/M5",
      },
      {
        id: "data-pipeline",
        label: { ko: "데이터 수집·파이프라인", en: "Data pipeline" },
        href: "/data-pipeline",
        description: {
          ko: "Greengrass·IoT Core → Kinesis·Lambda → 3-Tier 이관. 대시보드 KPI는 배치 롤업만, 하단 실시간 수집은 Hot Tier 모니터링 전용",
          en: "Greengrass · IoT Core → Kinesis · Lambda → 3-tier. Dashboard KPIs use batch rollup only; live collection monitors Hot Tier",
        },
        wbs: "A1/A2/M2/M4",
      },
      {
        id: "metric-stream-periodic",
        label: { ko: "주기 메트릭", en: "Periodic metrics" },
        href: "/metric-stream#periodic",
        description: { ko: "Hot · tube.kv · temp · yield 주기 보고", en: "Hot · periodic tube.kv · temp · yield" },
        wbs: "A1/A2/M5",
      },
      {
        id: "metric-stream-event",
        label: { ko: "이벤트 메트릭", en: "Event metrics" },
        href: "/metric-stream#event",
        description: { ko: "Hot · 상태 전이 · 알람 트리거 이벤트", en: "Hot · state transitions · alarm trigger events" },
        wbs: "A1/A2/M5",
      },
      {
        id: "metric-stream-firmware",
        label: { ko: "펌웨어 메트릭", en: "Firmware metrics" },
        href: "/metric-stream#firmware",
        description: { ko: "Hot · OTA 진행 · firmware.version", en: "Hot · OTA progress · firmware.version" },
        wbs: "A1/A2/M5",
      },
      {
        id: "metric-stream-control",
        label: { ko: "제어 메트릭", en: "Control metrics" },
        href: "/metric-stream#control",
        description: { ko: "Hot · Shadow · IoT Job · 파라미터 제어", en: "Hot · Shadow · IoT Job · parameter control" },
        wbs: "A1/A2/M5",
      },
      {
        id: "equipment-logs",
        label: { ko: "장비 로그", en: "Equipment logs" },
        href: "/equipment-logs",
        description: {
          ko: "Warm Tier 배치 조회 — 구분(튜브·디텍터·알람 등)별 분리, 통합 시간순 조회 없음. 실시간 MQTT는 메트릭 스트림. 알람 연계 진입 시 ±1일 자동 적용",
          en: "Warm Tier batch queries by category (tube, detector, alarm, etc.). No unified timeline. Live MQTT is on metric stream. Alarm links apply ±1 day range",
        },
        wbs: "A2/M8/M9",
      },
    ],
  },
  {
    id: "alarm-control",
    label: { ko: "알람·원격제어", en: "Alarms & remote" },
    items: [
      {
        id: "alarms",
        label: { ko: "이상 알람 목록", en: "Alarm list" },
        href: "/alarms",
        description: {
          ko: "배치 알람 스냅샷·SNS/SES 발송 이력. Critical은 SLA 15분 내 1차 대응",
          en: "Batch alarm snapshot · SNS/SES delivery. Critical requires first response within 15 min SLA",
        },
        wbs: "A4",
      },
      {
        id: "alarm-rules",
        label: { ko: "알람 룰·EventBridge", en: "Alarm rules · EventBridge" },
        href: "/alarm-rules",
        description: { ko: "EventBridge 룰·복합 조건·원격/티켓 트리거", en: "EventBridge rules · compound conditions · remote/ticket triggers" },
        wbs: "A4",
      },
      {
        id: "remote-diagnosis",
        label: { ko: "원격진단", en: "Remote diagnosis" },
        href: "/remote-diagnosis",
        description: {
          ko: "Edge 진단 Job — 디텍터·모터·튜브 이상 자동 분석 및 보정 권고",
          en: "Edge diagnosis jobs — auto analysis of detector, motor, tube anomalies and correction recommendations",
        },
        wbs: "A5/M6",
      },
      {
        id: "remote-control",
        label: { ko: "원격제어", en: "Remote control" },
        href: "/remote-control",
        description: { ko: "kV/mA 보정·안전모드·IoT Jobs·해결 판정", en: "kV/mA calibration · safe mode · IoT Jobs · resolution" },
        wbs: "A5/M6",
      },
    ],
  },
  {
    id: "service",
    label: { ko: "서비스·알람 처리", en: "Service & tickets" },
    items: [
      {
        id: "service-tickets",
        label: { ko: "서비스 호출·티케팅", en: "Service tickets" },
        href: "/service-tickets",
        description: { ko: "티켓 단계: 접수→배정→출동→작업→완료. 배치 hourly snapshot 기준", en: "Ticket stages: received → assigned → dispatch → work → done. Batch hourly snapshot" },
        wbs: "A6/M6",
      },
      {
        id: "service-progress",
        label: { ko: "처리 진행·엔지니어 배정", en: "Service progress" },
        href: "/service-progress",
        description: { ko: "배치 진행 스냅샷·엔지니어 배정 현황", en: "Batch progress snapshot · engineer assignment" },
        wbs: "A7/M6",
      },
      {
        id: "sla",
        label: { ko: "SLA·서비스 가능 수준", en: "SLA & serviceability" },
        href: "/sla",
        description: { ko: "배치 플릿 기준 SLA·서비스 가능 수준", en: "Fleet SLA and serviceability from batch snapshot" },
        wbs: "A6/A7",
      },
    ],
  },
  {
    id: "equipment",
    label: { ko: "장비·설치·고객", en: "Equipment & customers" },
    items: [
      {
        id: "equipment",
        label: { ko: "장비 마스터", en: "Equipment master" },
        href: "/equipment",
        description: { ko: "배치 플릿 스냅샷·수명·펌웨어·SLA", en: "Batch fleet snapshot · life · firmware · SLA" },
        wbs: "A9/M9",
      },
      {
        id: "installation",
        label: { ko: "장비 설치 관리", en: "Installation" },
        href: "/installation",
        description: { ko: "설치·시운전·IoT 연동 등록", en: "Install · commissioning · IoT registration" },
        wbs: "A9",
      },
      {
        id: "customers",
        label: { ko: "고객사·설치현장", en: "Customers & sites" },
        href: "/customers",
        description: { ko: "고객사는 등록일, 설치현장은 설치일 기준 기간 조회·프리셋 지원", en: "Customers by registration date; sites by install date with presets" },
        wbs: "A9/M9",
      },
    ],
  },
  {
    id: "parts-as",
    label: { ko: "부품·AS", en: "Parts & service" },
    items: [
      {
        id: "parts-orders",
        label: { ko: "부품 발주 요청", en: "Parts orders" },
        href: "/parts-orders",
        description: { ko: "발주·배송(A10) 중심 — AS(A11)는 정비 이력·품질 중심으로 분리", en: "Orders & shipping (A10) — AS (A11) focuses on maintenance history" },
        wbs: "A10/M6",
      },
      {
        id: "parts-schedule",
        label: { ko: "배송·일정 추적", en: "Delivery schedule" },
        href: "/parts-schedule",
        description: { ko: "발주 확정→출고→운송→도착→교체 순. POD·운송장 인덱스 검색", en: "Order → ship → transit → arrive → replace. POD & tracking search" },
        wbs: "A10",
      },
      {
        id: "as",
        label: { ko: "AS(정비) 관리", en: "Field service (AS)" },
        href: "/as",
        description: { ko: "정비·교체 이력·만족도·운영 복귀", en: "Maintenance · replacement · satisfaction · restore" },
        wbs: "A11/M6",
      },
    ],
  },
  {
    id: "inspection-report",
    label: { ko: "검사·리포트", en: "Inspection & reports" },
    items: [
      {
        id: "inspection",
        label: { ko: "검사·수율 관리", en: "Inspection & yield" },
        href: "/inspection",
        description: { ko: "알고리즘·Threshold·Yield·LOT 트레이서빌리티", en: "Algorithms · threshold · yield · LOT traceability" },
        wbs: "A8/M8",
      },
      {
        id: "reports",
        label: { ko: "리포트", en: "Reports" },
        href: "/reports",
        description: { ko: "튜브/디텍터 로그·이상집계·A/S 교체집계", en: "Tube/detector logs · anomaly rollups · service replacements" },
        wbs: "M8",
      },
    ],
  },
  {
    id: "settings",
    label: { ko: "설정", en: "Settings" },
    items: [
      {
        id: "settings-notifications",
        label: { ko: "알림 채널", en: "Notification channels" },
        href: "/settings/notifications",
        description: { ko: "SNS·SES·Dashboard·Webhook 수신 대상", en: "SNS · SES · dashboard · webhook targets" },
        wbs: "M6",
      },
      {
        id: "settings-firmware",
        label: { ko: "펌웨어·OTA", en: "Firmware & OTA" },
        href: "/settings/firmware",
        description: { ko: "Greengrass OTA·Auto Update·Shadow 롤백", en: "Greengrass OTA · auto update · shadow rollback" },
        wbs: "M6",
      },
    ],
  },
  {
    id: "admin",
    label: { ko: "시스템 관리", en: "Administration" },
    items: [
      {
        id: "admin-users",
        label: { ko: "사용자·권한", en: "Users & roles" },
        href: "/admin/users",
        wbs: "A12/M10",
      },
      {
        id: "admin-codes",
        label: { ko: "공통코드", en: "Common codes" },
        href: "/admin/codes",
        wbs: "M10",
      },
      {
        id: "admin-menus",
        label: { ko: "메뉴 권한(RBAC)", en: "Menu RBAC" },
        href: "/admin/menus",
        description: {
          ko: "사이드바 동기화 메뉴·RBAC. metric-stream 서브 메뉴는 metric-stream 권한 상속",
          en: "Sidebar-synced menus · RBAC. Metric stream submenus inherit metric-stream permission",
        },
        wbs: "A12/M10",
      },
      {
        id: "admin-iot-auth",
        label: { ko: "IoT 장비 인증", en: "IoT device auth" },
        href: "/admin/iot-auth",
        description: { ko: "X.509·JITP/JITR·Thing Policy", en: "X.509 · JITP/JITR · thing policy" },
        wbs: "A12/M10",
      },
    ],
  },
];
