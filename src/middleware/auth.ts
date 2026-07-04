import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

// Shared Hono environment. Once real auth lands, `userId` is populated from the
// resolved API key's owner; `keyType` gates secret-only vs. publishable routes.
export type AppEnv = {
  Variables: {
    userId: string
    keyType: 'secret' | 'publishable'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER AUTH — NOT SECURE. See TODO.md ("Authentication").
//
// Real auth is a follow-up. For now this middleware fabricates an authenticated
// context so the contact routes can be built and exercised end-to-end. It does
// NOT verify any Bearer token. Every route already scopes its queries by the
// `userId` set here, so swapping this stub for real key resolution is the only
// change the routes need.
//
// Dev usage: set DEV_USER_ID in .env to an existing users.id so writes attribute
// to a real account (the user_id FK on `contacts` requires one).
// ─────────────────────────────────────────────────────────────────────────────
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const devUserId = process.env.DEV_USER_ID
  if (!devUserId) {
    throw new HTTPException(401, {
      message:
        'Authentication is not wired up yet. Set DEV_USER_ID in .env to a users.id to exercise the API. See TODO.md.',
    })
  }

  c.set('userId', devUserId)
  c.set('keyType', 'secret') // stub: treat every request as a full-access secret key
  await next()
})

// Placeholder for the secret-only guard. Real implementation rejects publishable
// keys (403) on every endpoint except POST /v1/contacts. No-op while the stub
// above always sets keyType='secret'.
export const requireSecretKey = createMiddleware<AppEnv>(async (c, next) => {
  if (c.get('keyType') !== 'secret') {
    throw new HTTPException(403, {
      message: 'This endpoint requires a secret key.',
    })
  }
  await next()
})
