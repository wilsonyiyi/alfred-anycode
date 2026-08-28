import {serializeTranslations} from './translations.js';

export function renderConfigPage({token}) {
  const safeToken = JSON.stringify(token);
  const safeTranslations = serializeTranslations();
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>AnyCode Settings</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #f6f7f9;
      --surface: #ffffff;
      --surface-subtle: #f8f9fb;
      --control: #f3f4f6;
      --text: #111827;
      --muted: #667085;
      --border: #e4e7ec;
      --border-strong: #d0d5dd;
      --accent: #2563eb;
      --accent-hover: #1d4ed8;
      --accent-soft: #eff6ff;
      --danger: #d92d20;
      --danger-soft: #fff1f0;
      --focus: rgba(37, 99, 235, .22);
      --shadow: 0 1px 2px rgba(16, 24, 40, .04), 0 8px 24px rgba(16, 24, 40, .04);
      --radius-lg: 18px;
      --radius-md: 12px;
      --radius-sm: 9px;
      --icon-size: 18px;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0f1115;
        --surface: #181b21;
        --surface-subtle: #1d2128;
        --control: #22262e;
        --text: #f5f7fa;
        --muted: #a7b0be;
        --border: #2d333d;
        --border-strong: #424a57;
        --accent: #7aa2ff;
        --accent-hover: #9ab8ff;
        --accent-soft: #202b43;
        --danger: #ff8b82;
        --danger-soft: #3a2022;
        --focus: rgba(122, 162, 255, .28);
        --shadow: 0 1px 2px rgba(0, 0, 0, .2), 0 10px 30px rgba(0, 0, 0, .16);
      }
    }
    * { box-sizing: border-box; }
    html { scroll-padding-bottom: 104px; }
    body {
      margin: 0;
      min-height: 100vh;
      overflow-x: hidden;
      background: var(--bg);
      color: var(--text);
      font: 14px/1.5 -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    button, input, select, textarea { font: inherit; }
    button { cursor: pointer; }
    button, input, select, textarea { color: inherit; }
    svg { display: block; }
    h1, h2, p { margin: 0; }
    .shell {
      width: min(1080px, calc(100% - 40px));
      margin: 0 auto;
      padding: 36px 0 112px;
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 28px;
    }
    .brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
    .brand > div:last-child { min-width: 0; }
    .brand-mark {
      width: 46px;
      height: 46px;
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      color: #fff;
      background: #111827;
      border-radius: 13px;
      box-shadow: var(--shadow);
    }
    @media (prefers-color-scheme: dark) {
      .brand-mark { color: #111827; background: #f8fafc; }
    }
    h1 { font-size: clamp(22px, 3vw, 28px); line-height: 1.2; letter-spacing: -.025em; font-weight: 700; }
    .lead { margin-top: 3px; color: var(--muted); font-size: 13px; }
    .language-button {
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      color: var(--muted);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 999px;
      font-weight: 600;
      transition: color .16s ease, border-color .16s ease, background .16s ease;
    }
    .language-button:hover { color: var(--text); border-color: var(--border-strong); }
    .stack { display: grid; gap: 20px; }
    .section {
      overflow: hidden;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
    }
    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 20px 22px;
      border-bottom: 1px solid var(--border);
    }
    .section-heading { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .section-heading > div:last-child { min-width: 0; }
    .section-icon {
      width: 36px;
      height: 36px;
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      color: var(--accent);
      background: var(--accent-soft);
      border-radius: 10px;
    }
    .section-head h2 { font-size: 16px; line-height: 1.3; letter-spacing: -.01em; }
    .section-head p { margin-top: 2px; color: var(--muted); font-size: 12px; }
    .section-body { padding: 22px; }
    .field { display: block; min-width: 0; }
    .field-label {
      display: block;
      margin-bottom: 6px;
      color: var(--muted);
      font-size: 11px;
      font-weight: 650;
      letter-spacing: .02em;
    }
    input, select, textarea {
      width: 100%;
      border: 1px solid transparent;
      outline: none;
      background: var(--control);
      border-radius: var(--radius-sm);
      transition: border-color .16s ease, box-shadow .16s ease, background .16s ease;
    }
    input, select { min-height: 40px; padding: 8px 10px; }
    textarea {
      min-height: 104px;
      padding: 12px;
      resize: vertical;
      font: 13px/1.55 ui-monospace, "SFMono-Regular", Menlo, monospace;
    }
    input:hover, select:hover, textarea:hover { border-color: var(--border-strong); }
    input:focus, select:focus, textarea:focus {
      border-color: var(--accent);
      background: var(--surface);
      box-shadow: 0 0 0 3px var(--focus);
    }
    .project-hint { margin-top: 8px; color: var(--muted); font-size: 11px; }
    .button {
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 13px;
      border: 1px solid transparent;
      border-radius: 10px;
      font-weight: 650;
      white-space: nowrap;
      transition: color .16s ease, background .16s ease, border-color .16s ease, opacity .16s ease;
    }
    .button.primary { color: #fff; background: var(--accent); }
    .button.primary:hover { background: var(--accent-hover); }
    .button.quiet { color: var(--text); background: var(--surface); border-color: var(--border); }
    .button.quiet:hover { background: var(--surface-subtle); border-color: var(--border-strong); }
    .button:disabled { opacity: .5; cursor: not-allowed; }
    .button.primary:disabled {
      color: var(--muted);
      background: var(--control);
      border-color: var(--border);
    }
    .icon-button {
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      padding: 0;
      color: var(--muted);
      background: transparent;
      border: 0;
      border-radius: 10px;
      transition: color .16s ease, background .16s ease;
    }
    .icon-button:hover { color: var(--danger); background: var(--danger-soft); }
    .editor-table {
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 14px;
    }
    .editor-table-head,
    .editor-card {
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(260px, 1fr) minmax(180px, .7fr) 40px;
      align-items: center;
      gap: 16px;
    }
    .editor-table-head {
      padding: 9px 14px;
      color: var(--muted);
      background: var(--surface-subtle);
      border-bottom: 1px solid var(--border);
      font-size: 11px;
      font-weight: 650;
      letter-spacing: .02em;
    }
    .editor-card {
      padding: 12px 14px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
    }
    .editor-card:last-child { border-bottom: 0; }
    .editor-identity {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    .editor-icon-control { position: relative; width: 44px; height: 44px; flex: 0 0 auto; }
    .editor-icon-upload {
      width: 44px;
      height: 44px;
      display: block;
      padding: 0;
      overflow: visible;
      background: transparent;
      border: 0;
      border-radius: 12px;
    }
    .editor-icon-control > input {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
    .editor-icon {
      width: 44px;
      height: 44px;
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      overflow: hidden;
      color: #fff;
      background: #475467;
      border-radius: 12px;
    }
    .editor-icon.type-vscode { background: #1677c5; }
    .editor-icon.type-cursor { background: #111827; }
    .editor-icon.type-zed { color: #111827; background: #f4c542; }
    .editor-icon.type-webstorm { background: #7c3aed; }
    .editor-icon.type-codex { background: #0f766e; }
    .editor-icon.type-custom { color: var(--muted); background: var(--control); }
    .editor-icon img { width: 100%; height: 100%; object-fit: cover; }
    .editor-icon.has-image { color: transparent; background: transparent; }
    .editor-icon-edit {
      position: absolute;
      right: -4px;
      bottom: -4px;
      width: 19px;
      height: 19px;
      display: grid;
      place-items: center;
      color: #fff;
      background: var(--accent);
      border: 2px solid var(--surface);
      border-radius: 999px;
      opacity: .72;
      transition: opacity .16s ease;
      pointer-events: none;
    }
    .editor-icon-upload:hover .editor-icon-edit,
    .editor-icon-upload:focus-visible .editor-icon-edit { opacity: 1; }
    .editor-icon-reset {
      position: absolute;
      top: -7px;
      left: -7px;
      width: 20px;
      height: 20px;
      display: grid;
      place-items: center;
      padding: 0;
      color: var(--danger);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 999px;
      box-shadow: var(--shadow);
    }
    .editor-controls { min-width: 0; flex: 1 1 auto; display: grid; gap: 7px; }
    .editor-controls select,
    .editor-controls input,
    .editor-keyword { min-height: 40px; }
    .editor-keyword { min-width: 0; }
    .empty {
      margin: 0;
      padding: 42px 24px;
      text-align: center;
      color: var(--muted);
      background: var(--surface-subtle);
      border: 1px dashed var(--border-strong);
      border-radius: 14px;
    }
    .empty-icon {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      margin: 0 auto 10px;
      color: var(--accent);
      background: var(--accent-soft);
      border-radius: 12px;
    }
    .empty strong { display: block; color: var(--text); font-size: 14px; }
    .empty span { display: block; margin-top: 3px; font-size: 12px; }
    .footer {
      position: fixed;
      inset: auto 0 0;
      z-index: 10;
      padding: 12px 20px;
      background: rgba(246, 247, 249, .92);
      border-top: 1px solid var(--border);
      backdrop-filter: blur(14px);
    }
    @media (prefers-color-scheme: dark) {
      .footer { background: rgba(15, 17, 21, .92); }
    }
    .footer-inner {
      width: min(1080px, 100%);
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin: 0 auto;
    }
    .status { min-height: 21px; color: var(--muted); font-size: 12px; }
    .status.error { color: var(--danger); }
    .actions { display: flex; gap: 8px; }
    :focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus); }
    @media (max-width: 760px) {
      .shell { width: min(100% - 16px, 1080px); padding-top: 20px; }
      .topbar { position: relative; align-items: flex-start; padding-right: 48px; }
      .brand { width: 100%; }
      .lead { max-width: 220px; }
      .language-button { position: absolute; top: 0; right: 0; }
      .section-head { position: relative; align-items: flex-start; padding-right: 62px; }
      .section-heading { width: 100%; }
      .section-head, .section-body { padding: 14px; }
      .section-head { padding-right: 62px; }
      .editor-table { overflow: visible; border: 0; }
      .editor-table-head { display: none; }
      .editor-list { display: grid; gap: 10px; }
      .editor-card {
        grid-template-columns: minmax(0, 1fr) 40px;
        gap: 10px;
        padding: 12px;
        border: 1px solid var(--border);
        border-radius: 12px;
      }
      .editor-card:last-child { border-bottom: 1px solid var(--border); }
      .editor-keyword { grid-column: 1 / -1; grid-row: 2; }
      .brand-mark { width: 42px; height: 42px; }
      .language-button { width: 40px; padding: 0; justify-content: center; }
      .language-button span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
      .section-head > .button { position: absolute; top: 14px; right: 14px; width: 40px; padding: 0; }
      .section-head .button span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
      .footer-inner { align-items: stretch; flex-direction: column; gap: 6px; }
      .actions { width: 100%; min-width: 0; }
      .actions .button { min-width: 0; flex: 1 1 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 7 4 12l5 5M15 7l5 5-5 5"/>
          </svg>
        </div>
        <div>
          <h1 data-i18n="appTitle">AnyCode Settings</h1>
          <p class="lead" data-i18n="appSubtitle">Choose where your projects live and how each editor opens them.</p>
        </div>
      </div>
      <button class="language-button" id="language" type="button">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/><circle cx="12" cy="12" r="9"/>
        </svg>
        <span id="language-label">中文</span>
      </button>
    </header>
    <div class="stack">
      <section class="section" aria-labelledby="projects-title">
        <div class="section-head">
          <div class="section-heading">
            <div class="section-icon" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6.5h7l2 2h9v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5Z"/>
              </svg>
            </div>
            <div><h2 id="projects-title" data-i18n="projectTitle">Project discovery</h2><p data-i18n="projectSubtitle">Shared by every configured editor.</p></div>
          </div>
        </div>
        <div class="section-body">
          <label class="field" for="project-patterns">
            <span class="field-label" data-i18n="projectLabel">Project directory patterns</span>
            <textarea id="project-patterns" spellcheck="false" placeholder="~/Developer/*&#10;~/Projects/*"></textarea>
          </label>
          <p class="project-hint" data-i18n="projectHint">One glob per line. Commas and semicolons also work.</p>
        </div>
      </section>
      <section class="section" aria-labelledby="editors-title">
        <div class="section-head">
          <div class="section-heading">
            <div class="section-icon" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 9 5 12l3 3M16 9l3 3-3 3M14 5l-4 14"/>
              </svg>
            </div>
            <div><h2 id="editors-title" data-i18n="editorsTitle">Editors</h2><p data-i18n="editorsSubtitle">Each editor owns its Alfred keyword. Add as many as you need.</p></div>
          </div>
          <button class="button quiet" id="add-editor" type="button">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            <span data-i18n="addEditor">Add editor</span>
          </button>
        </div>
        <div class="section-body">
          <div class="editor-table">
            <div class="editor-table-head" aria-hidden="true">
              <span data-i18n="editorType">Editor</span>
              <span data-i18n="keyword">Keyword</span>
              <span></span>
            </div>
            <div id="editor-list" class="editor-list" aria-live="polite"></div>
          </div>
        </div>
      </section>
    </div>
  </main>
  <footer class="footer">
    <div class="footer-inner">
      <div id="status" class="status" role="status"></div>
      <div class="actions">
        <button class="button quiet" id="reload" type="button" disabled>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4v6h6M20 20v-6h-6M5.2 15a7.5 7.5 0 0 0 12.6 2.2M18.8 9A7.5 7.5 0 0 0 6.2 6.8"/></svg>
          <span data-i18n="discard">Discard</span>
        </button>
        <button class="button primary" id="save" type="button" disabled>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>
          <span data-i18n="save">Save changes</span>
        </button>
      </div>
    </div>
  </footer>
  <script>
    const TOKEN = ${safeToken};
    const TRANSLATIONS = ${safeTranslations};
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const ICON_PATHS = {
      app: ['M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z', 'M4 8h16'],
      code: ['M8 9 5 12l3 3', 'M16 9l3 3-3 3', 'M14 5l-4 14'],
      cursor: ['M5 3l13 9-6 2-3 6L5 3Z'],
      image: ['M4 5h16v14H4Z', 'm4 16 4-4 3 3 3-4 6 6', 'M8.5 9h.01'],
      sparkle: ['M12 3l1.4 4.1L17.5 9l-4.1 1.4L12 15l-1.4-4.6L6.5 9l4.1-1.9L12 3Z', 'M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z'],
      terminal: ['M5 7l4 4-4 4', 'M11 16h8'],
      trash: ['M4 7h16', 'M9 7V4h6v3', 'M7 7l1 13h8l1-13', 'M10 11v5', 'M14 11v5'],
      webstorm: ['M5 5h14v14H5Z', 'M8 9l2 6 2-4 2 4 2-6'],
      x: ['M6 6l12 12', 'M18 6 6 18'],
      zed: ['M6 6h12L6 18h12', 'M10 12h4'],
    };
    const EDITOR_ICON_NAMES = {
      codex: 'sparkle',
      cursor: 'cursor',
      custom: 'app',
      vscode: 'code',
      webstorm: 'webstorm',
      zed: 'zed',
    };
    const EDITOR_LABEL_KEYS = {
      codex: 'editorCodex',
      cursor: 'editorCursor',
      custom: 'editorCustom',
      vscode: 'editorVscode',
      webstorm: 'editorWebstorm',
      zed: 'editorZed',
    };
    const BUILT_IN_EDITOR_ICONS = {
      codex: '/assets/editor-icon/codex?token=' + encodeURIComponent(TOKEN),
      cursor: '/assets/editor-icon/cursor?token=' + encodeURIComponent(TOKEN),
      vscode: '/assets/editor-icon/vscode?token=' + encodeURIComponent(TOKEN),
      webstorm: '/assets/editor-icon/webstorm?token=' + encodeURIComponent(TOKEN),
      zed: '/assets/editor-icon/zed?token=' + encodeURIComponent(TOKEN),
    };

    function cookieLocale() {
      const match = document.cookie.split('; ').find(value => value.startsWith('anycode.locale='));
      const value = match ? decodeURIComponent(match.slice('anycode.locale='.length)) : '';
      return value === 'en' || value === 'zh' ? value : '';
    }

    function savedLocale() {
      const requested = new URLSearchParams(location.search).get('lang');
      if (requested === 'en' || requested === 'zh') return requested;
      const cookie = cookieLocale();
      if (cookie) return cookie;
      try {
        const value = localStorage.getItem('anycode.locale');
        if (value === 'en' || value === 'zh') return value;
      } catch {}
      return String(navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
    }

    function persistLocale() {
      try { localStorage.setItem('anycode.locale', state.locale); } catch {}
      document.cookie = 'anycode.locale=' + encodeURIComponent(state.locale)
        + '; Max-Age=31536000; Path=/; SameSite=Strict';
    }

    const state = {
      config: null,
      dirty: false,
      editors: [],
      locale: savedLocale(),
      savedConfig: null,
      savedDraft: null,
      status: null,
      types: {},
    };
    const list = document.querySelector('#editor-list');
    const status = document.querySelector('#status');
    const saveButton = document.querySelector('#save');
    const discardButton = document.querySelector('#reload');

    function t(key, parameters = {}) {
      let value = TRANSLATIONS[state.locale][key] || TRANSLATIONS.en[key] || key;
      for (const [name, replacement] of Object.entries(parameters)) {
        value = value.replaceAll('{' + name + '}', String(replacement));
      }
      return value;
    }

    function createIcon(name, size = 19) {
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('width', String(size));
      svg.setAttribute('height', String(size));
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '1.8');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.setAttribute('aria-hidden', 'true');
      for (const definition of ICON_PATHS[name] || ICON_PATHS.app) {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', definition);
        svg.append(path);
      }
      return svg;
    }

    function updateStatus() {
      if (!state.status) {
        status.textContent = '';
        status.className = 'status';
        return;
      }
      status.textContent = state.status.raw || t(state.status.key, state.status.parameters);
      status.className = state.status.error ? 'status error' : 'status';
    }

    function setStatus(key, error = false, parameters = {}) {
      state.status = {error, key, parameters, raw: ''};
      updateStatus();
    }

    function setRawStatus(message, error = false) {
      state.status = {error, key: '', parameters: {}, raw: message};
      updateStatus();
    }

    function clone(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function editorPayload(editor) {
      const value = {
        applicationName: editor.applicationName,
        iconPath: editor.iconPath || '',
        id: editor.id,
        keywordExpression: editor.keywordExpression,
        type: editor.type,
      };
      if (editor.iconUpload) value.iconUpload = editor.iconUpload;
      return value;
    }

    function currentDraft() {
      return {
        editors: state.editors.map(editorPayload),
        projectPatterns: document.querySelector('#project-patterns').value,
      };
    }

    function updateDirtyState() {
      state.dirty = state.savedDraft !== null
        && JSON.stringify(currentDraft()) !== state.savedDraft;
      saveButton.disabled = !state.dirty;
      discardButton.disabled = !state.dirty;
      if (state.dirty && state.status?.key === 'saved') {
        state.status = null;
        updateStatus();
      }
    }

    function setFormFromConfig(config, {remember = false} = {}) {
      state.config = clone(config);
      state.editors = config.editors.map(editor => ({
        ...editor,
        iconPreview: editor.iconUrl || '',
      }));
      document.querySelector('#project-patterns').value = config.projectPatterns.join('\\n');
      render();
      if (remember) {
        state.savedConfig = clone(config);
        state.savedDraft = JSON.stringify(currentDraft());
      }
      updateDirtyState();
    }

    function applyTranslations() {
      document.documentElement.lang = state.locale === 'zh' ? 'zh-CN' : 'en';
      document.title = t('appTitle');
      for (const element of document.querySelectorAll('[data-i18n]')) {
        element.textContent = t(element.dataset.i18n);
      }
      const languageButton = document.querySelector('#language');
      languageButton.setAttribute('aria-label', t('switchLanguage'));
      languageButton.setAttribute('title', t('switchLanguage'));
      document.querySelector('#language-label').textContent = state.locale === 'en' ? '中文' : 'EN';
      updateStatus();
    }

    function api(path, options = {}) {
      const separator = path.includes('?') ? '&' : '?';
      return fetch(path + separator + 'token=' + encodeURIComponent(TOKEN), options).then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Request failed');
        return body;
      });
    }

    function editorLabel(editor) {
      return editor.type === 'custom'
        ? (editor.applicationName || t('customApplication'))
        : t(EDITOR_LABEL_KEYS[editor.type]);
    }

    function renderEditorIcon(container, editor) {
      container.replaceChildren();
      container.className = 'editor-icon type-' + editor.type;
      const iconSource = editor.iconPreview || BUILT_IN_EDITOR_ICONS[editor.type];
      if (iconSource) {
        const image = document.createElement('img');
        image.src = iconSource;
        image.alt = '';
        container.append(image);
        container.classList.add('has-image');
        return;
      }
      container.append(createIcon(EDITOR_ICON_NAMES[editor.type], 23));
    }

    function readEditorIcon(fileInput, editor) {
      const selectedFile = fileInput.files[0];
      if (!selectedFile) return;
      if (selectedFile.size > 4 * 1024 * 1024) {
        setStatus('iconTooLarge', true);
        fileInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        editor.iconUpload = {dataUrl: reader.result, name: selectedFile.name};
        editor.iconPreview = reader.result;
        render();
      };
      reader.readAsDataURL(selectedFile);
    }

    function typeOptions(selected) {
      return Object.keys(state.types).map(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = t(EDITOR_LABEL_KEYS[value]);
        option.selected = value === selected;
        return option;
      });
    }

    function renderEmptyState() {
      const empty = document.createElement('div');
      empty.className = 'empty';
      const emptyIcon = document.createElement('div');
      emptyIcon.className = 'empty-icon';
      emptyIcon.append(createIcon('code', 21));
      const title = document.createElement('strong');
      title.textContent = t('emptyEditors');
      const hint = document.createElement('span');
      hint.textContent = t('emptyEditorsHint');
      empty.append(emptyIcon, title, hint);
      list.append(empty);
    }

    function render() {
      list.replaceChildren();
      if (state.editors.length === 0) {
        renderEmptyState();
        updateDirtyState();
        return;
      }

      state.editors.forEach((editor, index) => {
        const card = document.createElement('article');
        card.className = 'editor-card';
        card.dataset.editorId = editor.id;

        const identity = document.createElement('div');
        identity.className = 'editor-identity';
        const iconControl = document.createElement('div');
        iconControl.className = 'editor-icon-control';
        const iconUpload = document.createElement('button');
        iconUpload.type = 'button';
        iconUpload.className = 'editor-icon-upload';
        const iconActionLabel = editor.iconPath || editor.iconUpload ? t('replaceImage') : t('chooseImage');
        iconUpload.setAttribute('aria-label', iconActionLabel);
        iconUpload.setAttribute('title', iconActionLabel);
        const editorIcon = document.createElement('div');
        renderEditorIcon(editorIcon, editor);
        const editBadge = document.createElement('span');
        editBadge.className = 'editor-icon-edit';
        editBadge.append(createIcon('image', 11));
        iconUpload.append(editorIcon, editBadge);
        const iconFile = document.createElement('input');
        iconFile.type = 'file';
        iconFile.accept = 'image/png,image/jpeg,image/webp,image/gif,.icns';
        iconFile.tabIndex = -1;
        iconFile.setAttribute('aria-hidden', 'true');
        iconFile.addEventListener('change', () => readEditorIcon(iconFile, editor));
        iconUpload.addEventListener('click', () => iconFile.click());
        iconControl.append(iconUpload, iconFile);
        if (editor.iconPath || editor.iconUpload) {
          const resetIcon = document.createElement('button');
          resetIcon.type = 'button';
          resetIcon.className = 'editor-icon-reset';
          resetIcon.append(createIcon('x', 11));
          resetIcon.setAttribute('aria-label', t('removeImage'));
          resetIcon.setAttribute('title', t('removeImage'));
          resetIcon.addEventListener('click', () => {
            editor.iconPath = '';
            editor.iconPreview = '';
            delete editor.iconUpload;
            render();
          });
          iconControl.append(resetIcon);
        }
        const controls = document.createElement('div');
        controls.className = 'editor-controls';
        const select = document.createElement('select');
        select.setAttribute('aria-label', t('editorType'));
        typeOptions(editor.type).forEach(option => select.append(option));
        select.addEventListener('change', () => {
          const previousType = editor.type;
          editor.type = select.value;
          const preset = state.types[editor.type];
          if (editor.type !== 'custom') editor.applicationName = preset.applicationName;
          else if (previousType !== 'custom') editor.applicationName = '';
          render();
        });
        controls.append(select);

        if (editor.type === 'custom') {
          const app = document.createElement('input');
          app.value = editor.applicationName;
          app.placeholder = t('applicationPlaceholder');
          app.autocomplete = 'off';
          app.setAttribute('aria-label', t('applicationName'));
          app.addEventListener('input', () => {
            editor.applicationName = app.value;
            remove.setAttribute('aria-label', t('removeEditor', {name: editorLabel(editor)}));
            remove.setAttribute('title', t('removeEditor', {name: editorLabel(editor)}));
            updateDirtyState();
          });
          controls.append(app);
        }
        identity.append(iconControl, controls);

        const keyword = document.createElement('input');
        keyword.className = 'editor-keyword';
        keyword.value = editor.keywordExpression;
        keyword.placeholder = t('keywordPlaceholder');
        keyword.autocomplete = 'off';
        keyword.maxLength = 32;
        keyword.spellcheck = false;
        keyword.setAttribute('aria-label', t('keyword'));
        keyword.addEventListener('input', () => {
          editor.keywordExpression = keyword.value;
          updateDirtyState();
        });

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'icon-button';
        remove.append(createIcon('trash', 18));
        remove.setAttribute('aria-label', t('removeEditor', {name: editorLabel(editor)}));
        remove.setAttribute('title', t('removeEditor', {name: editorLabel(editor)}));
        remove.addEventListener('click', () => {
          state.editors.splice(index, 1);
          render();
          document.querySelector('#add-editor').focus();
        });
        card.append(identity, keyword, remove);
        list.append(card);
      });
      updateDirtyState();
    }

    async function load() {
      setStatus('loading');
      try {
        const body = await api('/api/config');
        state.types = body.editorTypes;
        setFormFromConfig(body.config, {remember: true});
        state.status = null;
        updateStatus();
      } catch (error) {
        setRawStatus(error.message, true);
      }
    }

    document.querySelector('#language').addEventListener('click', () => {
      state.locale = state.locale === 'en' ? 'zh' : 'en';
      persistLocale();
      const url = new URL(location.href);
      url.searchParams.set('lang', state.locale);
      history.replaceState(null, '', url);
      applyTranslations();
      render();
    });

    document.querySelector('#add-editor').addEventListener('click', () => {
      const id = crypto.randomUUID();
      state.editors.push({id, type: 'custom', applicationName: '', keywordExpression: '', iconPath: ''});
      render();
      list.querySelector('[data-editor-id="' + id + '"] select').focus();
    });

    document.querySelector('#project-patterns').addEventListener('input', updateDirtyState);
    discardButton.addEventListener('click', () => {
      if (!state.savedConfig || !state.dirty) return;
      setFormFromConfig(state.savedConfig);
      state.status = null;
      updateStatus();
    });
    saveButton.addEventListener('click', async () => {
      if (!state.dirty) return;
      saveButton.disabled = true;
      discardButton.disabled = true;
      setStatus('saving');
      try {
        const body = await api('/api/config', {
          method: 'POST',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify({
            editors: state.editors.map(editorPayload),
            projectPatterns: document.querySelector('#project-patterns').value.split(/[\\n,;]/),
            version: state.config.version,
          }),
        });
        setFormFromConfig(body.config, {remember: true});
        setStatus('saved');
      } catch (error) {
        setRawStatus(error.message, true);
      } finally {
        updateDirtyState();
      }
    });

    persistLocale();
    applyTranslations();
    load();
  </script>
</body>
</html>`;
}
