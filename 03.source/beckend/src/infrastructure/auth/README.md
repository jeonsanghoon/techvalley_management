# Auth (JWT / Cognito)

## 로컬 개발 (`AUTH_PROVIDER=local`)

1. `.env.example` → `.env` 복사
2. 시드 적용 후 로그인:
   - 계정: `USR-TV-OPS` / `USR-TV-ADMIN`
   - 비밀번호: `demo-password` (05-seed-dev.sql bcrypt)

```bash
curl -s -X POST http://localhost:3002/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"userId":"USR-TV-OPS","password":"demo-password"}' | jq
```

응답: `{ user, tokens: { accessToken, refreshToken, expiresIn }, provider: "local" }`

이후 API 호출: `Authorization: Bearer {accessToken}`

## AWS 운영 (`AUTH_PROVIDER=aws`)

```env
AUTH_PROVIDER=aws
COGNITO_REGION=ap-northeast-2
COGNITO_USER_POOL_ID=ap-northeast-2_XXXXX
COGNITO_CLIENT_ID=xxxxxxxx
```

- `POST /api/auth/login` — Cognito `USER_PASSWORD_AUTH`
- Guard — Cognito access token JWKS 검증 (`aws-jwt-verify`)
- `user.sso_id` = Cognito `sub` 로 PG 사용자 매핑

## 공개 API (`@Public()`)

- `GET /health`
- `GET|POST /api/auth/*` ( `/auth/me` 제외 — Bearer 필수 )

## JWT Claims

| claim | 설명 |
|-------|------|
| sub | user.id |
| role | admin · engineer · cs · customer |
| siteId | scope_site_id |
| companyId / branchId | Cognito custom attribute (AWS) |
