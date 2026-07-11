export const fontLinks = /* html */ `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
`

export const brandMark = /* html */ `
  <a class="brand" href="/">
    <span class="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9.3" r="3.5" fill="#fff"/><path d="M5 19c0-3.6 3.1-6 7-6s7 2.4 7 6v.7H5V19Z" fill="#fff"/></svg>
    </span>
    <span class="brand-name">contactapi</span>
  </a>
`

export const baseStyle = /* css */ `
  :root {
    --brand: #ff5a2e;
    --brand-600: #e6481d;
    --brand-tint: #fff1eb;
    --bg: #ffffff;
    --panel: #fafafa;
    --border: #ececec;
    --border-2: #e3e3e4;
    --ink: #0f1012;
    --text: #1c1d1f;
    --muted: #8b8d93;
    --faint: #a9abb1;
    --link: #c9431d;
    --radius: 20px;
    --radius-md: 12px;
    --radius-sm: 9px;
    --ring: 0 0 0 3px rgba(255, 90, 46, .22);
    --shadow-sm: 0 1px 2px rgba(17, 18, 20, .04);
    --shadow: 0 6px 28px rgba(17, 18, 20, .06);
  }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    font-family: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: var(--text);
    background: var(--bg);
    line-height: 1.6;
    max-width: 748px;
    margin: 0 auto;
    padding: 72px 24px 104px;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  h1 { font-size: 34px; letter-spacing: -.03em; line-height: 1.1; margin: 0; color: var(--ink); font-weight: 800; }
  h2 { font-size: 19px; letter-spacing: -.01em; margin: 44px 0 10px; color: var(--ink); font-weight: 700; }
  p { margin: 0 0 16px; }
  a { color: var(--link); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .muted { color: var(--muted); }
  ::selection { background: var(--brand-tint); }
  :focus-visible { outline: none; box-shadow: var(--ring); }

  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
  pre {
    background: #fbfbfc;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 16px 18px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.55;
    margin: 0 0 12px;
  }
  pre code { font-size: 13px; }

  .brand { display: inline-flex; align-items: center; gap: 9px; text-decoration: none; }
  .brand:hover { text-decoration: none; }
  .brand-mark {
    width: 28px; height: 28px; border-radius: 9px; background: var(--brand);
    display: inline-flex; align-items: center; justify-content: center; flex: none;
    box-shadow: 0 2px 8px rgba(255, 90, 46, .32);
  }
  .brand-mark svg { width: 18px; height: 18px; }
  .brand-name { font-size: 19px; font-weight: 800; letter-spacing: -.03em; color: var(--ink); }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px 17px; font-size: 14px; font-weight: 600; font-family: inherit;
    background: var(--ink); color: #fff; border: 0; border-radius: 999px;
    text-decoration: none; white-space: nowrap; cursor: pointer;
    transition: transform .12s ease, background .12s ease, box-shadow .12s ease;
  }
  .btn:hover { background: #2a2b2e; text-decoration: none; }
  .btn:active { transform: translateY(1px); }
`

export const analyticsScript = /* html */ `
  <script defer src="https://yourtraffic.dev/script.js"></script>
`
