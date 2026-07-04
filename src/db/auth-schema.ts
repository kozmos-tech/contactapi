import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core'

// ─────────────────────────────────────────────────────────────────────────────
// Better Auth owns these four tables (dashboard accounts + sessions). The shape
// matches Better Auth's core model exactly — property KEYS are the field names
// its Drizzle adapter looks up (camelCase); the SQL column names are snake_case.
// Do not hand-edit fields without keeping them in sync with the library.
//
// `user` is the account of record: `contacts` and `api_keys` FK into `user.id`.
// The customer-facing API keys are NOT modelled here — those stay in
// `schema.ts` (`api_keys`) because they're a product feature with their own
// contract (ck_secret_… / ck_pub_…, domain locks).
// ─────────────────────────────────────────────────────────────────────────────

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  // Hashed password for the email/password ("credential") provider — never plaintext.
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─────────────────────────────────────────────────────────────────────────────
// OAuth 2.1 provider tables — the Better Auth `mcp` plugin owns these. They let
// MCP clients register themselves (dynamic client registration) and hold the
// access tokens the /mcp endpoint authenticates against. Generated with
// `npx @better-auth/cli generate`; keep in sync with the plugin (column names in
// snake_case; timezone-aware timestamps to match the rest of the schema).
// ─────────────────────────────────────────────────────────────────────────────

// One row per registered OAuth/MCP client (created by DCR at /api/auth/mcp/register).
export const oauthApplication = pgTable(
  'oauth_application',
  {
    id: text('id').primaryKey(),
    name: text('name'),
    icon: text('icon'),
    metadata: text('metadata'),
    clientId: text('client_id').unique(),
    clientSecret: text('client_secret'),
    redirectUrls: text('redirect_urls'),
    type: text('type'),
    disabled: boolean('disabled').default(false),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  (t) => [index('oauth_application_user_id_idx').on(t.userId)],
)

// Issued access/refresh tokens. `auth.api.getMcpSession` resolves a Bearer token
// to its `(userId, clientId, scopes)` here — that userId scopes the MCP tools.
export const oauthAccessToken = pgTable(
  'oauth_access_token',
  {
    id: text('id').primaryKey(),
    accessToken: text('access_token').unique(),
    refreshToken: text('refresh_token').unique(),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    clientId: text('client_id').references(() => oauthApplication.clientId, {
      onDelete: 'cascade',
    }),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    scopes: text('scopes'),
    createdAt: timestamp('created_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  (t) => [
    index('oauth_access_token_client_id_idx').on(t.clientId),
    index('oauth_access_token_user_id_idx').on(t.userId),
  ],
)

// Remembered per-user consent for a client's scopes (skips re-prompting on
// subsequent authorizations).
export const oauthConsent = pgTable(
  'oauth_consent',
  {
    id: text('id').primaryKey(),
    clientId: text('client_id').references(() => oauthApplication.clientId, {
      onDelete: 'cascade',
    }),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    scopes: text('scopes'),
    createdAt: timestamp('created_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
    consentGiven: boolean('consent_given'),
  },
  (t) => [
    index('oauth_consent_client_id_idx').on(t.clientId),
    index('oauth_consent_user_id_idx').on(t.userId),
  ],
)

export type User = typeof user.$inferSelect
