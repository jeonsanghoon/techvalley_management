# 테크밸리 IoT 서비스 플랫폼 (Frontend)

Next.js 기반 운영·모니터링·정비 플랫폼 UI입니다.

**설계 SSOT**: [`02.arch/14-backend-frontend-design.md`](../../02.arch/14-backend-frontend-design.md)

| 항목 | 버전 |
|------|------|
| Next.js | 16.2 |
| React | 19 |
| MUI | 9 |
| AG Grid Enterprise | 35 |
| TanStack Query | 5 |

워크스페이스 경로: `techvalley/03.source/frontend` (모노레포 `03.source` 하위)

## 로컬 실행

```bash
npm ci
cp .env.local.example .env.local
npm run dev
```

워크스페이스 루트(`techvalley/`)에서 실행하려면 `npm run dev:frontend`를 사용합니다.

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

## Vercel 배포

1. [Vercel](https://vercel.com/)에서 `jeonsanghoon/techvalley_project` 저장소를 import합니다.
2. **Root Directory**는 저장소 루트(`.`) 그대로 둡니다.
3. **Framework Preset**은 `Next.js`로 자동 감지됩니다.
4. Environment Variables에 `NEXT_PUBLIC_AG_GRID_LICENSE_KEY`를 추가합니다.
5. 배포 후 Preview/Production URL에서 동작을 확인합니다.

루트 `vercel.json`에 Next.js 빌드 설정이 포함되어 있습니다.
