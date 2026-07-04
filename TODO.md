# TODO — Authentication

The `/v1/contacts` CRUD endpoints are implemented and scoped by `user_id`, but
**authentication is a stub**. Everything below is what's left to make the API
actually secure and match the documented auth model in `src/content/llms.ts`.

## Current state (the stub)

- [`src/middleware/auth.ts`](src/middleware/auth.ts) — `requireAuth` does **not**
  verify any Bearer token. It reads `DEV_USER_ID` from `.env` and fabricates an
  authenticated context (`userId` + `keyType='secret'`). No env var → `401`.
- `requireSecretKey` exists and guards every route except `POST /v1/contacts`,
  but it's a no-op today because the stub always sets `keyType='secret'`.
- The routes themselves need **no changes** when real auth lands — they already
  read `c.get('userId')` and filter every query by it. Only the middleware is
  swapped.

## What's left

### 1. Key generation & storage
- [ ] On login / from the dashboard, mint keys: `ck_secret_…` and `ck_pub_…`.
  Show the raw token **once**; persist only its `SHA-256` in `api_keys.key_hash`.
- [ ] Store a display hint in `api_keys.key_prefix` (e.g. last 4 chars).
- [ ] For publishable keys, capture `allowed_domains` (array); empty for secret.

### 2. Resolve a Bearer key → user (replace the stub)
- [ ] Read `Authorization: Bearer <token>`; `401` if missing/malformed.
- [ ] `SHA-256` the token, look up `api_keys.key_hash`; `401` if no match.
- [ ] Reject when `revoked_at IS NOT NULL` (`401`).
- [ ] Set `userId = api_keys.user_id` and `keyType = api_keys.type` on context.
- [ ] Best-effort update `last_used_at` (don't block the request on it).

### 3. Permission enforcement
- [ ] `requireSecretKey` is already applied to `GET`/`PATCH`/`DELETE` — verify it
  returns `403` once `keyType` can actually be `'publishable'`.
- [ ] `POST /v1/contacts` accepts both key types (already un-guarded).
- [ ] Publishable keys: enforce domain lock — check request `Origin`/`Referer`
  against `allowed_domains`; `403` on mismatch. Add CORS for those origins.

### 4. User accounts (signup / login)
- [ ] Wire `POST /signup`: create a `users` row, hash the password
  (argon2/bcrypt — never plaintext), handle duplicate-email (`users.email` is
  unique).
- [ ] Wire `POST /login`: verify password hash, start a session for the
  dashboard (cookie/JWT) so users can manage keys.
- [ ] The signup/login pages are UI-only today (`src/pages/{signup,login}.ts`).

### 5. Cleanup
- [ ] Delete the `DEV_USER_ID` branch in `requireAuth` and the `DEV_USER_ID`
  entry in `.env.example`.
- [ ] Add tests: missing key → `401`, publishable key on `GET` → `403`,
  revoked key → `401`, domain mismatch → `403`.

## Reference
- Auth model & error codes: `src/content/llms.ts` (the `/llms.txt` spec).
- Schema: `src/db/schema.ts` (`users`, `api_keys` already model all of the above).
