import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import {
  serializeContact,
  upsertContact,
  listContacts,
  getContact,
  patchContact,
  deleteContact,
} from '../services/contacts.js'

// Build an MCP server bound to a single authenticated user. `userId` comes from
// the OAuth access token (resolved in index.ts) and is closed over by every
// tool, so tools can never reach another account's contacts — the same tenant
// boundary the REST API enforces. A fresh server is built per request, which
// keeps it stateless and safe on serverless.
export function buildMcpServer(userId: string): McpServer {
  const server = new McpServer({ name: 'contactapi', version: '0.1.0' })

  // MCP tool results are text content; we return the same JSON the REST API does.
  const ok = (data: unknown) => ({
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  })
  const fail = (message: string) => ({
    content: [{ type: 'text' as const, text: message }],
    isError: true,
  })

  server.registerTool(
    'list_contacts',
    {
      title: 'List contacts',
      description: 'List your contacts, newest first, paginated.',
      inputSchema: {
        page: z.number().int().min(1).default(1).describe('1-based page number.'),
        page_size: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20)
          .describe('Contacts per page (1–100).'),
      },
    },
    async ({ page, page_size }) => {
      const { rows, total } = await listContacts(userId, { page, pageSize: page_size })
      return ok({
        data: rows.map(serializeContact),
        page,
        page_size,
        total,
        total_pages: Math.ceil(total / page_size),
      })
    },
  )

  server.registerTool(
    'get_contact',
    {
      title: 'Get contact',
      description: 'Fetch a single contact by its id (con_…).',
      inputSchema: { id: z.string().describe('The contact id, e.g. con_….') },
    },
    async ({ id }) => {
      const row = await getContact(userId, id)
      if (!row) return fail(`No contact with id ${id}.`)
      return ok(serializeContact(row))
    },
  )

  server.registerTool(
    'create_contact',
    {
      title: 'Create or update contact',
      description:
        'Create a contact, or update it in place if one already exists with the ' +
        'same email (upsert-by-email). `fields` is any JSON of extra attributes.',
      inputSchema: {
        email: z.string().min(1).describe('The contact email (the upsert key).'),
        fields: z
          .record(z.string(), z.unknown())
          .optional()
          .describe('Arbitrary extra fields, e.g. { "name": "Ada", "plan": "pro" }.'),
      },
    },
    async ({ email, fields }) => {
      const row = await upsertContact(userId, email, fields ?? {})
      return ok(serializeContact(row))
    },
  )

  server.registerTool(
    'update_contact',
    {
      title: 'Update contact',
      description:
        'Partially update a contact by id. `fields` is shallow-merged into the ' +
        'existing data (omitted keys are left untouched); pass `email` to change it.',
      inputSchema: {
        id: z.string().describe('The contact id, e.g. con_….'),
        email: z.string().min(1).optional().describe('New email, if changing it.'),
        fields: z
          .record(z.string(), z.unknown())
          .optional()
          .describe('Fields to merge into the contact.'),
      },
    },
    async ({ id, email, fields }) => {
      const row = await patchContact(userId, id, { email, patch: fields ?? {} })
      if (!row) return fail(`No contact with id ${id}.`)
      return ok(serializeContact(row))
    },
  )

  server.registerTool(
    'delete_contact',
    {
      title: 'Delete contact',
      description: 'Delete a contact by its id (con_…).',
      inputSchema: { id: z.string().describe('The contact id, e.g. con_….') },
    },
    async ({ id }) => {
      const deleted = await deleteContact(userId, id)
      if (!deleted) return fail(`No contact with id ${id}.`)
      return ok({ id, deleted: true })
    },
  )

  return server
}
