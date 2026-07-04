import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema.js'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

// Neon's HTTP driver is stateless and edge/serverless-safe, so a single
// module-level client is fine on Vercel — no connection pool to manage.
export const db = drizzle(neon(databaseUrl), { schema })

export { schema }
