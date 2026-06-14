# 01. 플랫폼 개요

## 1.1 목적

테크밸리 IoT 서비스 플랫폼은 **산업용 X-ray·검사 장비**의 원격 관제·알람·서비스·원격제어를 위한 운영 시스템입니다.

- **포함 (Project A · IoT)**: A1~A12 — 수집, 파이프라인, 관제, 알람, 원격진단/제어, 서비스 티켓, SLA, 장비·설치·고객, 부품·AS, 검사·수율, 리포트, 시스템 관리
- **포함 (IoT 운영 AI)**: SageMaker 이상 센서 탐지, 룰셋 추천, 알림·경고·제어 연동, **엣지 자가복구·OTA 제품 개선 루프** ([09-ai-anomaly-rules-and-edge-self-healing.md](./09-ai-anomaly-rules-and-edge-self-healing.md))
- **별도 (D · 지원 AI)**: Bedrock + RAG — 매뉴얼·정비 이력 검색, 챗봇, 리포트 초안 (사람 확인 후 실행)
- **제외**: Project B 제조 AI·MES 심화

## 1.2 조직·자산 계층

Warm Tier(Postgres) SSOT와 UI·배치 롤업의 **조직 트리**는 아래 4단계입니다.

```
company (회사)
  └── branch (지점·지사)
        └── site (조직·현장 — org_level_type)
              └── device (단말, device_code = S/N)
                    └── Greengrass v2 (엣지) → IoT Core Thing
```

| 계층 | RDS 테이블 | 업무 키 | UI·문서 매핑 | 예시 |
|------|-----------|---------|--------------|------|
| **회사** | `company` | `code` | customers (고객사) | COMP-DEMO-001 |
| **지점** | `branch` | `code` | 조직·지사 관리 | 본사 지점 · 수도권 지사 |
| **현장** | `site` | `code` | installation · site 필터 | 화성 Campus A (`org_level_type=3`) |
| **장비** | `device` | `device_code` | equipment | HK-2024-00158 |
| **엣지** | — | MQTT `topic(4)` | Greengrass Core | `device_code`와 동일 |

### site.org_level_type (S0015)

`site`는 **본사·지사·현장**을 한 테이블에 등록합니다 (`01-core-schema.sql`).

| 값 | 의미 | FK 규칙 |
|----|------|---------|
| `1` | 본사 (headquarters) | `company_id` 필수 |
| `2` | 지사 (branch office) | `branch_id` 필수 |
| `3` | 현장 (field site) | `branch_id` 선택 — **device.site_id** 는 보통 이 레벨 |

`branch` 마스터는 `company` 하위 지점(본사 지점·일반 지사)이며, `site(org_level=2)` 와 연동됩니다.

### MQTT·파이프라인과의 관계

토픽 8세그먼트에는 **company/branch/site 코드가 없습니다** — `device`(=`device_code`)만 carries합니다.

```
{tenant}/{env}/{edge}/{device}/{data_kind}/{domain}/{role}/json
```

`stream_sync_consumer` 적재 시 manifest `rdbms_time_series_link` 로 `device` → `site_id` → (branch·company) 를 **조인·스냅샷**합니다.  
KDS PartitionKey·DocDB UK는 `device_code` 기준 ([12-database-design.md](./12-database-design.md) §12.1).

**서비스 권역**(UI): 한국 · 동아시아 · 유럽 · 멕시코 · 전세계 — 플릿 지도·KPI 집계 필터에 사용 (`locale/settings.ts`).

## 1.3 WBS ↔ 도메인 매핑

| WBS | 도메인 | 핵심 AWS·앱 |
|-----|--------|-------------|
| A1 | IoT 데이터 수집 | Greengrass, IoT Core, 엣지 스풀 |
| A2 | 데이터 파이프라인·저장 | Kinesis, Lambda, 3-Tier |
| A3 | 통합 관제 | 배치 롤업, 대시보드 KPI |
| A4 | 이상 알람·룰셋 | EventBridge, SNS/SES, **SageMaker + 룰 추천** |
| A5 | 원격진단·원격제어 | IoT Jobs, Device Shadow, **엣지 자가복구**, OTA Job UI |
| A6~A7 | 서비스 티켓·진행·SLA | Aurora 배치 스냅샷 |
| A8 | 검사·수율 | Iceberg 일별 롤업 |
| A9 | company·branch·site·device (장비·현장·고객) | Aurora 마스터 + 배치 플릿 |
| A10~A11 | 부품·AS | Aurora 트랜잭션 |
| A12 | 시스템 관리 | Cognito, RBAC, IoT X.509 |

## 1.4 UI 데이터 범위 (batch vs realtime)

프론트엔드는 **`DataScope`** 로 조회 계약을 구분합니다 (`03.source/frontend/src/lib/data/scope.ts`).

| scope | 의미 | 대표 화면 |
|-------|------|-----------|
| `batch` | 배치 Job 완료 시각(`asOf`) 기준 스냅샷 | 대시보드, 알람 목록, SLA, 장비 마스터, 장비 로그 |
| `realtime` | Hot Tier / 스트림 최신값 | 메트릭 스트림, 데이터 파이프라인 하단 실시간 패널, 원격제어 |

**원칙**: 대시보드 KPI·플릿 지도·알람 패널은 **배치 롤업만** 반영. 실시간 MQTT 스트림은 **메트릭 스트림·Hot Tier 모니터링** 전용.

## 1.5 수집 라이프사이클 (UI 4단계)

```
① 수집·파이프라인 → ② 실시간 Hot → ③ Warm 조회 → ④ 배치 관제
   data-pipeline      metric-stream    equipment-logs    dashboard
```

| 단계 | storageTier | dataScope |
|------|-------------|-----------|
| ① | — | mixed |
| ② | Hot | realtime |
| ③ | Warm | batch |
| ④ | — | batch |

## 1.6 장비 텔레메트리 도메인

| 구분 | Warm Tier 카테고리 | Hot 스트림 (metric-stream) |
|------|-------------------|----------------------------|
| 튜브 | kV/mA, 수명, 캘리브레이션 | `#periodic` tube.kv |
| 디텍터 | 온도, 캘리브레이션 | temp, yield |
| 본체 | Greengrass, 가동시간 | — |
| 알람 | 발생·해제·룰 매칭 | `#event` |
| 원격제어 | Shadow, IoT Job | `#control` |
| 펌웨어 | OTA, 버전, **Job 배포** | `#firmware` · `settings-firmware` |

Warm Tier 장비 로그는 **카테고리별 분리 조회** — 통합 시간순 타임라인 없음.

## 1.7 보안·인증 (요약)

| 주체 | 방식 |
|------|------|
| 운영 사용자 | Cognito / OIDC JWT + 앱 RBAC (admin · engineer · cs · customer) |
| IoT 장비 | X.509, JITP/JITR, Thing Policy, Topic ACL |
| 엣지·원격제어 | Greengrass v2, IoT Jobs, Shadow (Fail-safe 인터락) |
| API | API Gateway Authorizer, Secrets Manager, KMS |

상세: 기능정의서 §⑤ 인증·보안(AWS).

## 1.8 애플리케이션 계층 (개발 SSOT)

운영 포털·API·파이프라인은 **역할이 분리**됩니다. UI는 mock + `DataScope`로 계약을 고정하고, Lambda는 MQTT→Tier 적재, NestJS는 REST/SSE를 담당합니다.

| 계층 | 경로 | 기술 | 설계 SSOT | 상태 |
|------|------|------|-----------|------|
| **프론트엔드** | `03.source/frontend` | Next.js 16 · MUI · AG Grid | [14-backend-frontend-design.md](./14-backend-frontend-design.md) | UI + mock **done** |
| **백엔드 API** | `03.source/beckend` | NestJS · Aurora + DocDB CQRS | [14-backend-frontend-design.md](./14-backend-frontend-design.md) · [04-backend-services.md](./04-backend-services.md) | **next** |
| **파이프라인 Lambda** | `03.source/lambda` | Node.js 24 ESM · 9종 | [15-lambda-development.md](./15-lambda-development.md) · [02-data-pipeline.md](./02-data-pipeline.md) | skeleton |

설정·배포: **`02.arch/config/`** → [07-repo-and-deployment.md](./07-repo-and-deployment.md) · [10-yaml-pipeline-deploy-automation.md](./10-yaml-pipeline-deploy-automation.md)
