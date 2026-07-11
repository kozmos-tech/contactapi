import { baseStyle, analyticsScript, fontLinks, brandMark } from '../styles.js'

export const loginPage = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" href="/favicon.ico?v=3" sizes="any" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
<title>Log in to ContactAPI</title>
${fontLinks}
<style>
  ${baseStyle}
  body { max-width: 452px; padding-top: 88px; }
  .card { border: 1px solid var(--border); border-radius: var(--radius); padding: 34px 30px; box-shadow: var(--shadow); margin-top: 30px; }
  h1 { font-size: 25px; margin: 22px 0 6px; }
  .sub { font-size: 14px; color: var(--muted); margin: 0; }
  form { display: flex; flex-direction: column; gap: 5px; margin-top: 26px; }
  label { font-size: 13px; font-weight: 600; color: var(--ink); margin: 12px 0 0; }
  label:first-of-type { margin-top: 0; }
  input {
    width: 100%;
    padding: 12px 14px;
    font-size: 15px;
    font-family: inherit;
    color: var(--ink);
    border: 1px solid var(--border-2);
    border-radius: var(--radius-md);
    background: var(--bg);
    transition: border-color .12s ease, box-shadow .12s ease;
  }
  input:focus { outline: none; border-color: var(--brand); box-shadow: var(--ring); }
  button {
    padding: 13px;
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    border: 0;
    border-radius: 999px;
    background: var(--ink);
    color: #fff;
    cursor: pointer;
    margin-top: 18px;
    transition: background .12s ease, transform .12s ease;
  }
  button:hover { background: #2a2b2e; }
  button:active { transform: translateY(1px); }
  .alt { font-size: 14px; color: var(--muted); margin-top: 22px; text-align: center; }
  .alt a { font-weight: 600; }
</style>
${analyticsScript}
</head>
<body>
  ${brandMark}
  <div class="card">
    <h1>Log in</h1>
    <p class="sub">Log in to get your API key.</p>
    <form id="loginForm">
      <label for="email">Email</label>
      <input id="email" type="email" required placeholder="you@example.com" autocomplete="email" />
      <label for="password">Password</label>
      <input id="password" type="password" required placeholder="••••••••" autocomplete="current-password" />
      <button type="submit">Log in</button>
    </form>
    <p id="error" style="color:#d64545;font-size:13px;margin-top:14px;display:none"></p>
    <p class="alt">Don't have an account? <a href="/signup">Sign up</a></p>
  </div>
<script type="module">
  const form = document.getElementById('loginForm');
  const errEl = document.getElementById('error');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.style.display = 'none';
    const res = await fetch('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
      }),
    });
    if (res.ok) {
      location.href = '/dashboard';
    } else {
      const body = await res.json().catch(() => ({}));
      errEl.textContent = body?.message || 'Invalid email or password.';
      errEl.style.display = 'block';
    }
  });
</script>
</body>
</html>`
