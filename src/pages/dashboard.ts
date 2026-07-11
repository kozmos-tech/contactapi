import { baseStyle, analyticsScript, fontLinks, brandMark } from '../styles.js'
import type { ApiKey } from '../db/schema.js'

// Minimal HTML escaping for any value that originates from user input
// (names, emails, contact fields) before it lands in markup.
function esc(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function iso(date: Date | null): string {
  return date ? date.toISOString().replace(/\.\d{3}Z$/, 'Z') : '—'
}

const dashStyle = /* css */ `
  ${baseStyle}
  body { max-width: none; margin: 0; padding: 0; min-height: 100vh; }

  .sidebar {
    position: fixed; top: 0; left: 0; bottom: 0; width: 250px; z-index: 20;
    display: flex; flex-direction: column; padding: 22px 16px;
    background: #fbfbfc; border-right: 1px solid var(--border);
  }
  .side-brand { padding: 4px 8px 0; }
  .side-nav { display: flex; flex-direction: column; gap: 3px; margin-top: 28px; }
  .side-nav a {
    display: flex; align-items: center; gap: 11px; padding: 9px 12px;
    border-radius: var(--radius-md); font-size: 14px; font-weight: 600;
    color: var(--muted); text-decoration: none; border: 1px solid transparent;
    transition: background .12s ease, color .12s ease;
  }
  .side-nav a svg { width: 18px; height: 18px; flex: none; }
  .side-nav a:hover { background: rgba(17, 18, 20, .04); color: var(--ink); text-decoration: none; }
  .side-nav a.active { background: var(--bg); color: var(--ink); border-color: var(--border); box-shadow: var(--shadow-sm); }

  .side-foot { margin-top: auto; padding-top: 14px; border-top: 1px solid var(--border); }
  .user-chip { display: flex; align-items: center; gap: 10px; padding: 8px 6px; }
  .avatar { width: 34px; height: 34px; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center;
    background: var(--brand); color: #5e1c0a; font-weight: 800; font-size: 14px; }
  .who { min-width: 0; flex: 1; }
  .who .nm { display: block; font-size: 13px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .who .em { display: block; font-size: 12px; color: var(--muted); }
  .logout-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; flex: none;
    border-radius: var(--radius-sm); color: var(--faint); transition: background .12s ease, color .12s ease; }
  .logout-btn:hover { background: rgba(17, 18, 20, .05); color: var(--ink); text-decoration: none; }
  .logout-btn svg { width: 17px; height: 17px; }

  .main { margin-left: 250px; padding: 48px 56px 96px; }
  .content { max-width: none; }
  .lead { color: var(--muted); font-size: 15px; margin: 10px 0 0; }

  .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 30px 0 8px; }
  .stat { border: 1px solid var(--border); border-radius: var(--radius); padding: 22px 24px; display: flex; flex-direction: column; gap: 3px;
    transition: box-shadow .15s ease, border-color .15s ease; }
  .stat:hover { box-shadow: var(--shadow-sm); border-color: var(--border-2); }
  .stat-label { font-size: 13px; font-weight: 600; color: var(--muted); }
  .stat-value { font-size: 42px; font-weight: 800; letter-spacing: -.035em; color: var(--ink); line-height: 1.1; }
  .stat-link { font-size: 13px; font-weight: 600; color: var(--link); margin-top: 10px; }

  table { width: 100%; border-collapse: collapse; margin: 22px 0 6px; font-size: 14px; }
  thead th { text-align: left; padding: 0 14px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: .07em; color: var(--faint); font-weight: 700; border-bottom: 1px solid var(--border); }
  tbody td { text-align: left; padding: 15px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  tbody tr:last-child td { border-bottom: 0; }
  td code { background: var(--panel); border: 1px solid var(--border); padding: 3px 7px; border-radius: 6px; }

  .pill { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: #eef1fe; color: #4356c9; }
  .pill.pub { background: var(--brand-tint); color: var(--link); }
  .pill.revoked { background: #fdecec; color: #c23a3a; }

  form.inline { display: inline; }
  button, .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    font-size: 14px; font-weight: 600; font-family: inherit; padding: 10px 16px; border: 0; border-radius: 999px;
    background: var(--ink); color: #fff; cursor: pointer; text-decoration: none;
    transition: background .12s ease, transform .12s ease;
  }
  button:hover, .btn:hover { background: #2a2b2e; text-decoration: none; }
  button:active, .btn:active { transform: translateY(1px); }
  button.ghost { background: var(--bg); color: var(--text); border: 1px solid var(--border-2); }
  button.ghost:hover { background: var(--panel); }
  #drawerDelete.ghost { color: #c23a3a; }
  #drawerDelete.ghost:hover { background: #fdf0f0; border-color: #f3caca; }
  button.link { background: none; color: var(--link); border: 0; padding: 2px 4px; font-size: 13px; font-weight: 600; }
  button.link:hover { background: none; text-decoration: underline; transform: none; }
  code.keyval { display: inline-block; max-width: 320px; overflow-x: auto; vertical-align: middle; white-space: nowrap; }
  tr.flash td { background: var(--brand-tint); }
  .ok { background: var(--brand-tint); border: 1px solid #ffd6c7; border-radius: var(--radius-md); padding: 13px 16px; font-size: 14px; margin: 4px 0 18px; }

  fieldset { border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 22px; margin: 8px 0 24px; }
  legend { font-size: 13px; font-weight: 700; color: var(--ink); padding: 0 8px; }
  .row { display: flex; gap: 14px; align-items: flex-end; flex-wrap: wrap; }
  .row label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: var(--ink); }
  input[type=text], select {
    padding: 10px 12px; font-size: 14px; font-family: inherit; color: var(--ink);
    border: 1px solid var(--border-2); border-radius: var(--radius-md); background: var(--bg);
    transition: border-color .12s ease, box-shadow .12s ease;
  }
  input[type=text]:focus, select:focus { outline: none; border-color: var(--brand); box-shadow: var(--ring); }
  .empty { color: var(--muted); font-size: 14px; padding: 28px 0; text-align: center; }

  .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 22px 0 4px; flex-wrap: wrap; }
  .search { display: flex; gap: 8px; align-items: center; }
  .search input[type=search] {
    padding: 10px 14px; font-size: 14px; font-family: inherit; color: var(--ink); width: 260px;
    border: 1px solid var(--border-2); border-radius: 999px; background: var(--bg);
    transition: border-color .12s ease, box-shadow .12s ease;
  }
  .search input[type=search]:focus { outline: none; border-color: var(--brand); box-shadow: var(--ring); }
  .search button.ghost { color: var(--text); }
  .search .clear { font-size: 13px; font-weight: 600; }
  tr.contact { cursor: pointer; }
  tr.contact:hover td { background: var(--panel); }
  .pagination { display: flex; align-items: center; gap: 14px; font-size: 13px; color: var(--muted); margin: 6px 0 24px; }
  .pagination a { padding: 8px 14px; border: 1px solid var(--border-2); border-radius: 999px; text-decoration: none; color: var(--ink); font-weight: 600; }
  .pagination a:hover { background: var(--panel); }
  .pagination .disabled { padding: 8px 14px; border: 1px solid var(--border); border-radius: 999px; color: var(--faint); }

  .overlay { position: fixed; inset: 0; background: rgba(17, 18, 20, .32); opacity: 0; pointer-events: none; transition: opacity .15s; z-index: 40; }
  .overlay.open { opacity: 1; pointer-events: auto; }
  .drawer { position: fixed; top: 0; right: 0; height: 100%; width: min(480px, 100%); background: var(--bg); box-shadow: -12px 0 40px rgba(17, 18, 20, .14);
    transform: translateX(100%); transition: transform .22s cubic-bezier(.22,.61,.36,1); z-index: 41; display: flex; flex-direction: column; }
  .drawer.open { transform: translateX(0); }
  .drawer .dhead { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 20px 22px; border-bottom: 1px solid var(--border); }
  .drawer .dhead h2 { font-size: 16px; margin: 0; word-break: break-all; }
  .drawer .dbody { padding: 20px 22px; overflow-y: auto; flex: 1; }
  .drawer .dfoot { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 16px 22px; border-top: 1px solid var(--border); }
  .drawer label.field { display: block; font-size: 13px; color: var(--ink); margin: 0 0 16px; }
  .drawer label.field span { display: block; margin-bottom: 7px; font-weight: 700; }
  .drawer input[type=email], .drawer input[type=text] { width: 100%; padding: 11px 13px; font-size: 14px; font-family: inherit; color: var(--ink); border: 1px solid var(--border-2); border-radius: var(--radius-md); transition: border-color .12s ease, box-shadow .12s ease; }
  .drawer textarea { width: 100%; min-height: 210px; padding: 12px; font-size: 13px; font-family: ui-monospace, Menlo, monospace; color: var(--ink); border: 1px solid var(--border-2); border-radius: var(--radius-md); resize: vertical; transition: border-color .12s ease, box-shadow .12s ease; }
  .drawer input:focus, .drawer textarea:focus { outline: none; border-color: var(--brand); box-shadow: var(--ring); }
  .drawer .meta { font-size: 12px; color: var(--muted); margin-top: 10px; line-height: 1.8; }
  .drawer .meta code { background: var(--panel); border: 1px solid var(--border); padding: 1px 6px; border-radius: 5px; }
  .drawer .err { color: #c23a3a; font-size: 13px; margin: 0 0 12px; min-height: 1px; }
  .close { display: inline-flex; align-items: center; justify-content: center; background: none; border: 0; font-size: 24px; line-height: 1; color: var(--faint); cursor: pointer; padding: 0 4px; width: auto; }
  .close:hover { color: var(--ink); background: none; transform: none; }

  @media (max-width: 860px) {
    .sidebar { position: static; inset: auto; width: auto; flex-direction: row; align-items: center; gap: 6px; padding: 12px 16px;
      border-right: 0; border-bottom: 1px solid var(--border); overflow-x: auto; }
    .side-brand { padding: 0; margin-right: 6px; }
    .side-nav { flex-direction: row; margin: 0; gap: 4px; }
    .side-nav a span.lbl { display: none; }
    .side-foot { margin: 0 0 0 auto; padding: 0; border-top: 0; }
    .side-foot .who { display: none; }
    .main { margin-left: 0; padding: 32px 22px 72px; }
  }
`

const ICONS = {
  home: /* html */ `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.4 12 3l9 7.4"/><path d="M5.5 9.2V20h13V9.2"/></svg>`,
  key: /* html */ `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15.5" r="4"/><path d="m10.9 12.7 8.1-8.1"/><path d="m15.5 6.6 2.4 2.4"/></svg>`,
  contacts: /* html */ `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.4 20a5.6 5.6 0 0 1 11.2 0"/><path d="M16 5.3a3.2 3.2 0 0 1 0 5.8"/><path d="M17.6 14.4A5.6 5.6 0 0 1 20.6 20"/></svg>`,
  logout: /* html */ `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>`,
}

function shell(title: string, active: string, name: string, inner: string): string {
  const link = (href: string, label: string, icon: string) =>
    `<a href="${href}" class="${active === href ? 'active' : ''}">${icon}<span class="lbl">${label}</span></a>`
  const initial = esc((name.trim()[0] ?? 'U').toUpperCase())
  return /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" href="/favicon.ico?v=3" sizes="any" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
<title>${esc(title)}</title>
${fontLinks}
<style>${dashStyle}</style>
${analyticsScript}
</head>
<body>
  <aside class="sidebar">
    <div class="side-brand">${brandMark}</div>
    <nav class="side-nav">
      ${link('/dashboard', 'Overview', ICONS.home)}
      ${link('/dashboard/keys', 'API keys', ICONS.key)}
      ${link('/dashboard/contacts', 'Contacts', ICONS.contacts)}
    </nav>
    <div class="side-foot">
      <div class="user-chip">
        <span class="avatar">${initial}</span>
        <span class="who"><span class="nm">${esc(name)}</span></span>
        <a href="#" id="logout" class="logout-btn" aria-label="Log out" title="Log out">${ICONS.logout}</a>
      </div>
    </div>
  </aside>
  <main class="main">
    <div class="content">
      ${inner}
    </div>
  </main>
<script type="module">
  document.getElementById('logout')?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' });
    } finally {
      location.replace('/login');
    }
  });
</script>
</body>
</html>`
}

export function dashboardHome(name: string, contactCount: number, keyCount: number): string {
  return shell('Dashboard · contactapi', '/dashboard', name, /* html */ `
    <h1>Welcome, ${esc(name)}</h1>
    <p class="lead">Your account at a glance.</p>
    <div class="stat-grid">
      <div class="stat">
        <span class="stat-label">Contacts</span>
        <span class="stat-value">${contactCount}</span>
        <a class="stat-link" href="/dashboard/contacts">View contacts →</a>
      </div>
      <div class="stat">
        <span class="stat-label">Active API keys</span>
        <span class="stat-value">${keyCount}</span>
        <a class="stat-link" href="/dashboard/keys">Manage keys →</a>
      </div>
    </div>
  `)
}

export function keysPage(name: string, keys: ApiKey[], createdId: string | null = null): string {
  const rows = keys.length
    ? keys
        .map((k) => {
          const revoked = k.revokedAt !== null
          const typePill = k.type === 'secret'
            ? '<span class="pill">secret</span>'
            : '<span class="pill pub">publishable</span>'
          const status = revoked
            ? '<span class="pill revoked">revoked</span>'
            : typePill
          // Reveal/Copy fetch the raw value on demand; revoked or legacy
          // (hash-only) keys can only show their masked prefix.
          const revealable = !revoked && k.keyEncrypted !== null
          const controls = revealable
            ? `<button type="button" class="link reveal" data-id="${esc(k.id)}">Reveal</button>
               <button type="button" class="link copy" data-id="${esc(k.id)}">Copy</button>`
            : ''
          const action = revoked
            ? '—'
            : `<form class="inline" method="post" action="/dashboard/keys/${esc(k.id)}/revoke" onsubmit="return confirm('Revoke this key? Apps using it will stop working.')"><button class="ghost" type="submit">Revoke</button></form>`
          const flash = createdId && k.id === createdId ? ' class="flash"' : ''
          return `<tr${flash} data-row="${esc(k.id)}">
            <td><code class="keyval" data-masked="${esc(k.keyPrefix)}">${esc(k.keyPrefix)}</code> ${controls}</td>
            <td>${status}</td>
            <td>${esc(k.allowedDomains.join(', ') || '—')}</td>
            <td>${iso(k.lastUsedAt)}</td>
            <td>${iso(k.createdAt)}</td>
            <td>${action}</td>
          </tr>`
        })
        .join('')
    : `<tr><td colspan="6" class="empty">No API keys yet — create one below.</td></tr>`

  const createdBanner = createdId
    ? `<div class="ok">New key created — it's highlighted below. You can reveal or copy any key here whenever you need it.</div>`
    : ''

  return shell('API keys · contactapi', '/dashboard/keys', name, /* html */ `
    <h1>API keys</h1>
    <p class="muted">Authenticate requests with <code>Authorization: Bearer &lt;key&gt;</code>. Secret keys have full access; publishable keys can only create contacts and are locked to your domains. Keys are stored encrypted — reveal or copy them here anytime.</p>
    ${createdBanner}
    <table>
      <thead><tr><th>Key</th><th>Type</th><th>Domains</th><th>Last used</th><th>Created</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <fieldset>
      <legend>Create another key</legend>
      <form method="post" action="/dashboard/keys">
        <div class="row">
          <label>Type
            <select name="type" id="keyType">
              <option value="secret">Secret (full access)</option>
              <option value="publishable">Publishable (create-only)</option>
            </select>
          </label>
          <label id="domainsWrap" style="display:none">Allowed domains
            <input type="text" name="allowed_domains" placeholder="app.example.com, example.com" size="34" />
          </label>
          <button type="submit">Create key</button>
        </div>
      </form>
    </fieldset>
    <script type="module">
      const sel = document.getElementById('keyType');
      const wrap = document.getElementById('domainsWrap');
      sel.addEventListener('change', () => { wrap.style.display = sel.value === 'publishable' ? '' : 'none'; });

      // Cache revealed values so Reveal-then-Copy doesn't refetch.
      const cache = new Map();
      async function fetchKey(id) {
        if (cache.has(id)) return cache.get(id);
        const res = await fetch('/dashboard/keys/' + id + '/reveal', { method: 'POST' });
        if (!res.ok) throw new Error('reveal failed');
        const { key } = await res.json();
        cache.set(id, key);
        return key;
      }

      document.querySelectorAll('button.reveal').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const code = document.querySelector('[data-row="' + id + '"] code.keyval');
          if (btn.textContent === 'Hide') {
            code.textContent = code.dataset.masked;
            btn.textContent = 'Reveal';
            return;
          }
          btn.disabled = true;
          try { code.textContent = await fetchKey(id); btn.textContent = 'Hide'; }
          catch { btn.textContent = 'Error'; }
          finally { btn.disabled = false; }
        });
      });

      document.querySelectorAll('button.copy').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const original = btn.textContent;
          btn.disabled = true;
          try {
            await navigator.clipboard.writeText(await fetchKey(id));
            btn.textContent = 'Copied!';
          } catch { btn.textContent = 'Error'; }
          finally {
            btn.disabled = false;
            setTimeout(() => { btn.textContent = original; }, 1500);
          }
        });
      });
    </script>
  `)
}

// Shape the contacts route serializes each row into for the dashboard.
export type ContactView = {
  id: string
  email: string
  fields: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type ContactsView = {
  contacts: ContactView[]
  page: number
  total: number
  totalPages: number
  pageSize: number
  q: string
}

// One-line preview of a contact's non-reserved fields for the table.
function fieldsSummary(fields: Record<string, unknown>): string {
  const parts = Object.entries(fields).map(([k, v]) => {
    const val = v === null || typeof v === 'object' ? JSON.stringify(v) : String(v)
    return `${k}=${val}`
  })
  const joined = parts.join(', ')
  return joined.length > 80 ? `${joined.slice(0, 79)}…` : joined
}

export function contactsPage(name: string, view: ContactsView): string {
  const { contacts, page, total, totalPages, pageSize, q } = view

  const rows = contacts.length
    ? contacts
        .map(
          (row) => `<tr class="contact" data-id="${esc(row.id)}">
            <td>${esc(row.email)}</td>
            <td class="muted">${esc(fieldsSummary(row.fields)) || '—'}</td>
            <td>${esc(row.created_at)}</td>
          </tr>`,
        )
        .join('')
    : `<tr><td colspan="3" class="empty">${
        q ? `No contacts match “${esc(q)}”.` : 'No contacts yet — create one, or POST to <code>/v1/contacts</code>.'
      }</td></tr>`

  // Preserve the active search term across page links.
  const qs = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (p > 1) params.set('page', String(p))
    const s = params.toString()
    return s ? `/dashboard/contacts?${s}` : '/dashboard/contacts'
  }
  const prev = page > 1
    ? `<a href="${qs(page - 1)}">← Prev</a>`
    : `<span class="disabled">← Prev</span>`
  const next = page < totalPages
    ? `<a href="${qs(page + 1)}">Next →</a>`
    : `<span class="disabled">Next →</span>`

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  const clear = q
    ? `<a class="clear muted" href="/dashboard/contacts">Clear</a>`
    : ''

  // Embed the current page's contacts so the drawer can open instantly. Escape
  // "<" so the payload can't break out of the <script> element.
  const payload = JSON.stringify(contacts).replaceAll('<', '\\u003c')

  return shell('Contacts · contactapi', '/dashboard/contacts', name, /* html */ `
    <h1>Contacts</h1>
    <p class="muted">${total} contact${total === 1 ? '' : 's'} on your account. Click a row to view, edit, or delete it.</p>

    <div class="toolbar">
      <form class="search" method="get" action="/dashboard/contacts">
        <input type="search" name="q" value="${esc(q)}" placeholder="Search by email…" />
        <button class="ghost" type="submit">Search</button>
        ${clear}
      </form>
      <button type="button" id="newContact">+ New contact</button>
    </div>

    <table>
      <thead><tr><th>Email</th><th>Fields</th><th>Created</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="pagination">
      ${prev}
      <span>${total === 0 ? '0 of 0' : `${rangeStart}–${rangeEnd} of ${total}`}</span>
      ${next}
    </div>

    <div class="overlay" id="overlay"></div>
    <aside class="drawer" id="drawer" aria-hidden="true">
      <div class="dhead">
        <h2 id="drawerTitle">Contact</h2>
        <button type="button" class="close" id="drawerClose" aria-label="Close">×</button>
      </div>
      <div class="dbody">
        <p class="err" id="drawerErr"></p>
        <label class="field"><span>Email</span>
          <input type="email" id="fEmail" placeholder="jane@example.com" />
        </label>
        <label class="field"><span>Fields (JSON)</span>
          <textarea id="fFields" spellcheck="false">{}</textarea>
        </label>
        <div class="meta" id="drawerMeta"></div>
      </div>
      <div class="dfoot">
        <button type="button" class="ghost" id="drawerDelete">Delete</button>
        <button type="button" id="drawerSave">Save</button>
      </div>
    </aside>

    <script type="application/json" id="contactsData">${payload}</script>
    <script type="module">
      const rows = JSON.parse(document.getElementById('contactsData').textContent);
      const byId = new Map(rows.map((r) => [r.id, r]));

      const overlay = document.getElementById('overlay');
      const drawer = document.getElementById('drawer');
      const title = document.getElementById('drawerTitle');
      const err = document.getElementById('drawerErr');
      const emailEl = document.getElementById('fEmail');
      const fieldsEl = document.getElementById('fFields');
      const metaEl = document.getElementById('drawerMeta');
      const delBtn = document.getElementById('drawerDelete');
      const saveBtn = document.getElementById('drawerSave');

      let currentId = null; // null = create mode

      function esc(s) { return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

      function open(id) {
        currentId = id;
        err.textContent = '';
        const c = id ? byId.get(id) : null;
        if (c) {
          title.textContent = c.email;
          emailEl.value = c.email;
          fieldsEl.value = JSON.stringify(c.fields ?? {}, null, 2);
          metaEl.innerHTML = 'ID <code>' + esc(c.id) + '</code><br>Created ' + esc(c.created_at) + '<br>Updated ' + esc(c.updated_at);
          delBtn.style.display = '';
        } else {
          title.textContent = 'New contact';
          emailEl.value = '';
          fieldsEl.value = '{}';
          metaEl.innerHTML = '';
          delBtn.style.display = 'none';
        }
        overlay.classList.add('open');
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        emailEl.focus();
      }

      function close() {
        overlay.classList.remove('open');
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
      }

      document.querySelectorAll('tr.contact').forEach((tr) => {
        tr.addEventListener('click', () => open(tr.dataset.id));
      });
      document.getElementById('newContact').addEventListener('click', () => open(null));
      document.getElementById('drawerClose').addEventListener('click', close);
      overlay.addEventListener('click', close);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

      saveBtn.addEventListener('click', async () => {
        err.textContent = '';
        const email = emailEl.value.trim();
        if (!email) { err.textContent = 'Email is required.'; return; }
        let fields;
        try { fields = fieldsEl.value.trim() ? JSON.parse(fieldsEl.value) : {}; }
        catch { err.textContent = 'Fields must be valid JSON.'; return; }
        if (typeof fields !== 'object' || fields === null || Array.isArray(fields)) {
          err.textContent = 'Fields must be a JSON object.'; return;
        }
        saveBtn.disabled = true;
        try {
          const url = currentId ? '/dashboard/contacts/' + currentId : '/dashboard/contacts';
          const res = await fetch(url, {
            method: currentId ? 'PATCH' : 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, fields }),
          });
          if (res.ok) { location.reload(); return; }
          const body = await res.json().catch(() => ({}));
          err.textContent = body.error || 'Could not save contact.';
        } catch { err.textContent = 'Network error — try again.'; }
        finally { saveBtn.disabled = false; }
      });

      delBtn.addEventListener('click', async () => {
        if (!currentId) return;
        if (!confirm('Delete this contact? This cannot be undone.')) return;
        delBtn.disabled = true;
        try {
          const res = await fetch('/dashboard/contacts/' + currentId, { method: 'DELETE' });
          if (res.ok) { location.reload(); return; }
          err.textContent = 'Could not delete contact.';
        } catch { err.textContent = 'Network error — try again.'; }
        finally { delBtn.disabled = false; }
      });
    </script>
  `)
}
