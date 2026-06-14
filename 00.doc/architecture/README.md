# 테크밸리 아키텍처 문서 (Next.js SSG)

`02.arch/` Markdown·config SSOT를 **Next.js Static Site Generation**으로 페이지별 탐색합니다.  
단일 HTML(`index.html`) 대신 페이징·레퍼런스·검색을 제공합니다.

## 실행

```bash
# 개발 (http://localhost:3001)
npm run dev:architecture-docs

# SSG 빌드 → site/out/ 정적 산출
npm run build:architecture-docs
```

루트에서:

```bash
npm run dev:architecture-docs
npm run build:architecture-docs
```

정적 산출물 미리보기:

```bash
npx serve 00.doc/architecture/site/out
```

## 사이트 구조

| 경로 | 내용 |
|------|------|
| `/` | 홈 — 학습 경로, 도메인 카드, KPI |
| `/docs/[slug]/` | `02.arch` Markdown 25+편 (SSG) |
| `/reference/ui-api/` | UI ↔ REST · NestJS contexts · FOTA · JWT |
| `/reference/lambda/` | AWS Lambda 9종 · Node.js 24 · bundle · predeploy |
| `/reference/media-upload/` | S3 업로드 모드 · MQTT file/* · samples · converter-rules |
| `/reference/postgres/` | DDL 파일별 테이블·컬럼 상세 |
| `/reference/docdb/` | `03-documentdb.yaml` 컬렉션·인덱스·RDS 링크 |
| `/reference/config/` | `02.arch/config/` 전체 파일 트리 |
| `/search/` | 문서 전체 검색 |
| `/status/` | 구현 상태 체크리스트 |

## SSOT

| 원본 | 역할 |
|------|------|
| `02.arch/*.md` | 아키텍처 서술 — 빌드 시 fs로 읽음 |
| `02.arch/config/` | YAML·DDL·manifest |
| `site/lib/manifest.ts` | 목차·학습 경로·slug |
| `site/out/` | `next build` + `output: export` 산출물 |

Markdown 수정 후 **`npm run build:architecture-docs`** 로 재생성.

## 레거시

단일 HTML 미러: `npm run build:legacy-html --prefix 00.doc/architecture` → `index.html`

## 기술

- Next.js 16 App Router · `output: "export"`
- react-markdown + remark-gfm + mermaid
- Tailwind CSS 4
