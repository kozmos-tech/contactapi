import { and, count, desc, eq, sql } from 'drizzle-orm'
import { db } from '../db/client.js'
import { contacts, type Contact } from '../db/schema.js'

// Contact persistence, shared by the REST routes (routes/contacts.ts) and the
// MCP tools (mcp/server.ts) so both speak the same upsert/patch/serialize logic.
// Every function takes `userId` and scopes its queries by it — that's the tenant
// boundary; callers must never pass an id/email without the owning userId.

// ISO 8601 UTC without milliseconds, e.g. "2026-07-04T10:00:00Z" — matches docs.
function iso(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

export type SerializedContact = {
  id: string
  email: string
  created_at: string
  updated_at: string
  [key: string]: unknown
}

// Flatten a row to the documented shape: { id, email, ...data, created_at,
// updated_at }. The structured columns are authoritative, so any stray reserved
// keys inside `data` are dropped in favour of them.
export function serializeContact(row: Contact): SerializedContact {
  const { id, email, created_at, updated_at, ...rest } = row.data as Record<
    string,
    unknown
  >
  return {
    id: row.id,
    email: row.email,
    ...rest,
    created_at: iso(row.createdAt),
    updated_at: iso(row.updatedAt),
  }
}

// Create or upsert-by-email. Unique (user_id, email) means an existing email
// updates in place rather than duplicating; a create replaces the stored fields
// with the new payload.
export async function upsertContact(
  userId: string,
  email: string,
  data: Record<string, unknown>,
): Promise<Contact> {
  const [row] = await db
    .insert(contacts)
    .values({ userId, email, data })
    .onConflictDoUpdate({
      target: [contacts.userId, contacts.email],
      set: { data, updatedAt: new Date() },
    })
    .returning()
  return row
}

// List a user's contacts, newest first, paginated. Returns the page rows plus
// the unpaginated total so callers can compute total_pages.
export async function listContacts(
  userId: string,
  { page, pageSize }: { page: number; pageSize: number },
): Promise<{ rows: Contact[]; total: number }> {
  const where = eq(contacts.userId, userId)
  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(contacts)
      .where(where)
      .orderBy(desc(contacts.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(contacts).where(where),
  ])
  return { rows, total }
}

// Fetch one contact owned by the user, or null if it doesn't exist / isn't theirs.
export async function getContact(userId: string, id: string): Promise<Contact | null> {
  const [row] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.userId, userId), eq(contacts.id, id)))
    .limit(1)
  return row ?? null
}

// Partial update: shallow-merge `patch` into the JSONB bag (`data || patch`) so
// omitted fields are left untouched; `email` (its own column) is updated only
// when supplied. Returns the updated row, or null if the user has no such contact.
export async function patchContact(
  userId: string,
  id: string,
  { email, patch }: { email?: string; patch: Record<string, unknown> },
): Promise<Contact | null> {
  const [row] = await db
    .update(contacts)
    .set({
      data: sql`${contacts.data} || ${JSON.stringify(patch)}::jsonb`,
      ...(email !== undefined ? { email } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(contacts.userId, userId), eq(contacts.id, id)))
    .returning()
  return row ?? null
}

// Delete one contact owned by the user. Returns true if a row was removed.
export async function deleteContact(userId: string, id: string): Promise<boolean> {
  const [row] = await db
    .delete(contacts)
    .where(and(eq(contacts.userId, userId), eq(contacts.id, id)))
    .returning({ id: contacts.id })
  return Boolean(row)
}
