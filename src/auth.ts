import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { mcp } from 'better-auth/plugins'
import { db } from './db/client.js'
import {
  user,
  session,
  account,
  verification,
  oauthApplication,
  oauthAccessToken,
  oauthConsent,
} from './db/auth-schema.js'
import { newId, type IdPrefix } from './db/ids.js'
import { mintApiKey } from './api-keys.js'

// Prefix the id of each auth table to match the rest of the codebase
// (usr_… / ses_… / acc_… / ver_…), instead of Better Auth's opaque default.
const ID_PREFIX: Record<string, IdPrefix> = {
  user: 'usr',
  session: 'ses',
  account: 'acc',
  verification: 'ver',
}

// Dashboard authentication (human accounts + cookie sessions). This is separate
// from the customer-facing Bearer API keys, which stay in `middleware/auth.ts`.
export const auth = betterAuth({
  // Falls back to request-derived URL when unset; set BETTER_AUTH_URL in prod.
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    // The mcp plugin (below) reads/writes the three oauth* tables, so they must
    // be registered here alongside the core auth tables.
    schema: { user, session, account, verification, oauthApplication, oauthAccessToken, oauthConsent },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // start a session immediately after signup
    minPasswordLength: 8,
  },
  advanced: {
    database: {
      generateId: ({ model }) => newId(ID_PREFIX[model] ?? 'usr'),
    },
  },
  plugins: [
    // Makes contactapi an OAuth 2.1 authorization server for MCP clients:
    // dynamic client registration, /authorize, /token, all under /api/auth/*.
    // MCP clients (Claude Desktop, claude.ai connectors, MCP Inspector) discover
    // it via the /.well-known routes wired in index.ts and hit the /mcp endpoint
    // with the access token. Consent reuses the dashboard session; an unauthed
    // user is sent to the existing login page.
    mcp({ loginPage: '/login' }),
  ],
  databaseHooks: {
    user: {
      create: {
        // Seed every new account with a working pair out of the box: a secret
        // key for server-side use and an (unrestricted) publishable key for the
        // browser. Both are revealable from the dashboard; users can mint more
        // later, e.g. publishable keys locked to specific domains.
        after: async (createdUser) => {
          await mintApiKey({ userId: createdUser.id, type: 'secret' })
          await mintApiKey({ userId: createdUser.id, type: 'publishable' })
        },
      },
    },
  },
})
