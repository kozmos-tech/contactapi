import { baseStyle, analyticsScript, fontLinks, brandMark } from '../styles.js'

export const signupPage = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" href="/favicon.ico?v=3" sizes="any" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
<title>Sign up for ContactAPI</title>
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
  .hint { font-size: 12px; color: var(--faint); margin: 6px 0 0; }
  .alt { font-size: 14px; color: var(--muted); margin-top: 22px; text-align: center; }
  .alt a { font-weight: 600; }
</style>
${analyticsScript}
</head>
<body>
  ${brandMark}
  <div class="card">
    <h1>Sign up</h1>
    <p class="sub">Create an account to get your API key.</p>
    <form id="signupForm">
      <label for="name">Name</label>
      <input id="name" type="text" required placeholder="Ada Lovelace" autocomplete="name" />
      <label for="email">Email</label>
      <input id="email" type="email" required placeholder="you@example.com" autocomplete="email" />
      <label for="password">Password</label>
      <input id="password" type="password" required minlength="8" placeholder="••••••••" autocomplete="new-password" />
      <p class="hint">At least 8 characters.</p>
      <button type="submit">Create account</button>
    </form>
    <p id="error" style="color:#d64545;font-size:13px;margin-top:14px;display:none"></p>
    <p class="alt">Already have an account? <a href="/login">Log in</a></p>
  </div>
<script type="module">
  const form = document.getElementById('signupForm');
  const errEl = document.getElementById('error');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.style.display = 'none';
    const res = await fetch('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
      }),
    });
    if (res.ok) {
      location.href = '/dashboard';
    } else {
      const body = await res.json().catch(() => ({}));
      errEl.textContent = body?.message || 'Could not create account.';
      errEl.style.display = 'block';
    }
  });
</script>
</body>
</html>`
