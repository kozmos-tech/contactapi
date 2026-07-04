import { Hono } from 'hono'
import { randomUUID } from 'node:crypto'

const app = new Hono()

const page = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>contactapi — open-source API to save emails &amp; contacts</title>
<meta name="description" content="An open-source API to save emails and contacts. Request an API key to get started." />
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1a1a1a;
    line-height: 1.6;
    max-width: 640px;
    margin: 0 auto;
    padding: 64px 24px;
  }
  h1 { font-size: 32px; margin: 0 0 8px; }
  h2 { font-size: 18px; margin: 40px 0 8px; }
  p { margin: 0 0 16px; }
  a { color: #2563eb; }
  .muted { color: #666; }
  pre {
    background: #f5f5f5;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    padding: 14px 16px;
    overflow-x: auto;
    font-size: 13px;
  }
  form { display: flex; gap: 8px; margin: 8px 0; flex-wrap: wrap; }
  input {
    flex: 1;
    min-width: 220px;
    padding: 10px 12px;
    font-size: 15px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
  button {
    padding: 10px 18px;
    font-size: 15px;
    border: 0;
    border-radius: 6px;
    background: #1a1a1a;
    color: #fff;
    cursor: pointer;
  }
  button:disabled { opacity: .6; cursor: default; }
  .msg { font-size: 14px; min-height: 20px; }
  .msg.err { color: #c0392b; }
  #keyout { display: none; }
  #keyout code { word-break: break-all; }
  footer { margin-top: 48px; font-size: 13px; color: #888; }
</style>
</head>
<body>
  <h1>contactapi</h1>
  <p class="muted">An open-source API to save emails and contacts. Request an API key below to get started.</p>

  <h2>Save a contact</h2>
  <pre>curl https://contactapi.dev/v1/contacts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"ada@example.com","name":"Ada Lovelace"}'</pre>

  <h2>Request an API key</h2>
  <form id="keyForm">
    <input id="email" type="email" required placeholder="you@example.com" autocomplete="email" />
    <button type="submit" id="submitBtn">Get a key</button>
  </form>
  <p class="msg" id="msg"></p>
  <p id="keyout">Your API key: <code id="keyval"></code></p>

  <footer>Open source · MIT licensed · <a href="https://github.com">GitHub</a></footer>

<script>
  const form = document.getElementById('keyForm');
  const msg = document.getElementById('msg');
  const keyout = document.getElementById('keyout');
  const keyval = document.getElementById('keyval');
  const btn = document.getElementById('submitBtn');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    msg.className = 'msg'; msg.textContent = 'Generating…';
    btn.disabled = true;
    try {
      const res = await fetch('/api/request-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      msg.textContent = 'Key created for ' + data.email;
      keyval.textContent = data.api_key;
      keyout.style.display = 'block';
      document.getElementById('email').value = '';
    } catch (err) {
      msg.className = 'msg err';
      msg.textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  });
</script>
</body>
</html>`

app.get('/', (c) => c.html(page))

// Issue a demo API key for a given email.
app.post('/api/request-key', async (c) => {
  let body: { email?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const email = (body.email ?? '').trim().toLowerCase()
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!valid) return c.json({ error: 'Please enter a valid email address' }, 400)

  const api_key = 'ck_live_' + randomUUID().replace(/-/g, '')
  return c.json({ email, api_key }, 201)
})

export default app
