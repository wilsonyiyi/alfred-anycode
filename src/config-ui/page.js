import {serializeTranslations} from './translations.js';

export function renderConfigPage({token}) {
  const encodedToken = encodeURIComponent(token);
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
      border-radius: 13px;
      box-shadow: var(--shadow);
      object-fit: cover;
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
    .editor-section { position: relative; z-index: 2; overflow: visible; }
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
    .project-hint { margin-bottom: 14px; color: var(--muted); font-size: 12px; }
    .directory-list { display: grid; gap: 8px; }
    .directory-row {
      min-height: 48px;
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 7px 8px 7px 12px;
      background: var(--surface-subtle);
      border: 1px solid var(--border);
      border-radius: 10px;
    }
    .directory-row svg { color: var(--accent); flex: 0 0 auto; }
    .directory-path { min-width: 0; flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
    .project-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; }
    .text-button {
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 0 9px;
      color: var(--accent);
      background: transparent;
      border: 0;
      border-radius: 9px;
      font-weight: 650;
    }
    .text-button:hover { background: var(--accent-soft); }
    .advanced-panel { margin-top: 10px; padding-top: 12px; border-top: 1px solid var(--border); }
    .advanced-panel[hidden] { display: none; }
    .advanced-panel textarea { min-height: 96px; }
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
    .icon-button:hover { color: var(--text); background: var(--surface-subtle); }
    .directory-row .icon-button:hover { color: var(--danger); background: var(--danger-soft); }
    .editor-add { position: relative; z-index: 3; flex: 0 0 auto; }
    .editor-picker {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      z-index: 40;
      width: min(300px, calc(100vw - 32px));
      padding: 8px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 13px;
      box-shadow: 0 16px 40px rgba(16, 24, 40, .16);
    }
    .editor-picker[hidden] { display: none; }
    .editor-picker.opens-up { top: auto; bottom: calc(100% + 8px); }
    .picker-label { padding: 7px 9px 5px; color: var(--muted); font-size: 11px; font-weight: 650; }
    .picker-list { display: grid; gap: 3px; }
    .picker-option {
      width: 100%;
      min-height: 48px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 9px;
      color: var(--text);
      text-align: left;
      background: transparent;
      border: 0;
      border-radius: 9px;
      font-weight: 650;
    }
    .picker-option:hover { background: var(--surface-subtle); }
    .picker-option:disabled { cursor: default; opacity: .72; }
    .picker-option:disabled:hover { background: transparent; }
    .picker-option img { width: 32px; height: 32px; object-fit: cover; border-radius: 8px; }
    .picker-option-status {
      margin-left: auto;
      color: var(--muted);
      font-size: 11px;
      font-weight: 600;
    }
    .picker-empty { padding: 10px 9px; color: var(--muted); font-size: 12px; }
    .picker-divider { height: 1px; margin: 7px 4px; background: var(--border); }
    .editor-table {
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 14px;
    }
    .editor-card {
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(180px, .72fr) minmax(440px, 1fr) auto;
      align-items: center;
      gap: 14px;
    }
    .editor-card {
      padding: 9px 12px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
    }
    .editor-card:last-child { border-bottom: 0; }
    .editor-card.is-disabled .editor-identity,
    .editor-card.is-disabled .keyword-control { opacity: .52; }
    .editor-identity {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .editor-icon-control { position: relative; width: 38px; height: 38px; flex: 0 0 auto; }
    .editor-icon-upload {
      width: 38px;
      height: 38px;
      display: block;
      padding: 0;
      overflow: visible;
      background: transparent;
      border: 0;
      border-radius: 10px;
    }
    .editor-icon-control > input {
      display: none;
    }
    .editor-icon {
      width: 38px;
      height: 38px;
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      overflow: hidden;
      color: #fff;
      background: #475467;
      border-radius: 10px;
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
      opacity: 0;
      transition: opacity .16s ease;
      pointer-events: none;
    }
    .editor-icon-upload:hover .editor-icon-edit,
    .editor-icon-upload:focus-visible .editor-icon-edit { opacity: 1; }
    .editor-meta { min-width: 0; }
    .editor-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 700; }
    .editor-state { margin-top: 1px; color: var(--muted); font-size: 10px; }
    .editor-state.warning { color: var(--danger); }
    .keyword-control {
      min-width: 0;
      display: grid;
      grid-template-columns: auto minmax(100px, 160px) minmax(160px, 1fr);
      align-items: center;
      gap: 6px 10px;
    }
    .keyword-heading { display: inline-flex; align-items: center; white-space: nowrap; }
    .keyword-label { color: var(--muted); font-size: 11px; font-weight: 650; }
    .editor-keyword { min-width: 0; min-height: 36px; padding-block: 7px; }
    .editor-keyword[aria-invalid="true"] { border-color: var(--danger); background: var(--danger-soft); }
    .keyword-example { min-width: 0; overflow: hidden; color: var(--muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
    .editor-error { grid-column: 2 / 4; color: var(--danger); font-size: 11px; }
    .editor-error:empty { display: none; }
    .editor-actions { display: flex; align-items: center; justify-content: flex-end; gap: 5px; }
    .editor-action {
      min-height: 32px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 0 8px;
      color: var(--muted);
      background: transparent;
      border: 1px solid transparent;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 650;
      white-space: nowrap;
    }
    .editor-action:hover { color: var(--text); background: var(--surface-subtle); border-color: var(--border); }
    .editor-action.danger:hover { color: var(--danger); background: var(--danger-soft); border-color: transparent; }
    .switch {
      width: 38px;
      height: 22px;
      position: relative;
      padding: 0;
      background: var(--border-strong);
      border: 0;
      border-radius: 999px;
      transition: background .16s ease;
    }
    .switch::after {
      content: "";
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,.2);
      transition: transform .16s ease;
    }
    .switch[aria-pressed="true"] { background: var(--accent); }
    .switch[aria-pressed="true"]::after { transform: translateX(16px); }
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
      .shell { width: min(calc(100% - 16px), 1080px); padding-top: 20px; }
      .topbar { position: relative; align-items: flex-start; padding-right: 48px; }
      .brand { width: 100%; }
      .lead { max-width: 220px; }
      .language-button { position: absolute; top: 0; right: 0; }
      .section-head { position: relative; align-items: flex-start; padding-right: 62px; }
      .section-heading { width: 100%; }
      .section-head, .section-body { padding: 14px; }
      .section-head { padding-right: 62px; }
      .editor-table { overflow: visible; border: 0; }
      .editor-list { display: grid; gap: 10px; }
      .editor-card {
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 10px;
        padding: 12px;
        border: 1px solid var(--border);
        border-radius: 12px;
      }
      .editor-card:last-child { border-bottom: 1px solid var(--border); }
      .keyword-control { grid-column: 1 / -1; grid-row: 2; }
      .keyword-control { grid-template-columns: auto minmax(100px, 1fr); }
      .keyword-example { grid-column: 2; }
      .editor-error { grid-column: 2; }
      .editor-actions { gap: 2px; }
      .editor-action span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
      .editor-action { width: 34px; padding: 0; justify-content: center; }
      .brand-mark { width: 42px; height: 42px; }
      .language-button { width: 40px; padding: 0; justify-content: center; }
      .language-button span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
      .section-head > .editor-add { position: absolute; top: 14px; right: 14px; }
      .editor-add > .button { width: 40px; padding: 0; }
      .editor-add > .button span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
      .project-actions { align-items: stretch; flex-direction: column; }
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
        <img class="brand-mark" src="/assets/workflow-icon?token=${encodedToken}" alt="" width="46" height="46">
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
          <p class="project-hint" data-i18n="projectHint">AnyCode searches for projects inside these directories.</p>
          <div id="directory-list" class="directory-list" aria-live="polite"></div>
          <div class="project-actions">
            <button class="button quiet" id="add-directory" type="button">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
              <span data-i18n="addDirectory">Add directory</span>
            </button>
            <button class="text-button" id="advanced-toggle" type="button" aria-expanded="false">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
              <span data-i18n="advancedRules">Advanced rules</span>
            </button>
          </div>
          <div class="advanced-panel" id="advanced-panel" hidden>
            <label class="field" for="project-patterns">
              <span class="field-label" data-i18n="projectLabel">Project directory patterns</span>
              <textarea id="project-patterns" spellcheck="false" placeholder="~/Developer/*&#10;~/Projects/*"></textarea>
            </label>
          </div>
        </div>
      </section>
      <section class="section editor-section" aria-labelledby="editors-title">
        <div class="section-head">
          <div class="section-heading">
            <div class="section-icon" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 9 5 12l3 3M16 9l3 3-3 3M14 5l-4 14"/>
              </svg>
            </div>
            <div><h2 id="editors-title" data-i18n="editorsTitle">Editors</h2><p data-i18n="editorsSubtitle">Each editor owns its Alfred keyword. Add as many as you need.</p></div>
          </div>
          <div class="editor-add">
            <button class="button quiet" id="add-editor" type="button" aria-expanded="false" aria-controls="editor-picker">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
              <span data-i18n="addEditor">Add editor</span>
            </button>
            <div class="editor-picker" id="editor-picker" role="dialog" aria-labelledby="editor-picker-label" hidden>
              <div class="picker-label" id="editor-picker-label" data-i18n="installedEditors">Installed on this Mac</div>
              <div class="picker-list" id="installed-editor-list"></div>
              <div class="picker-divider"></div>
              <button class="picker-option" id="choose-application" type="button">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h14v16H5zM5 8h14"/></svg>
                <span data-i18n="chooseOtherApplication">Choose another application…</span>
              </button>
            </div>
          </div>
        </div>
        <div class="section-body">
          <div class="editor-table">
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
      folder: ['M3 6.5h7l2 2h9v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5Z'],
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
      localEnvironment: {existingProjectPatterns: [], installedEditorTypes: []},
      locale: savedLocale(),
      projectPatterns: [],
      savedConfig: null,
      savedDraft: null,
      status: null,
      types: {},
      validationErrors: new Map(),
    };
    const list = document.querySelector('#editor-list');
    const directoryList = document.querySelector('#directory-list');
    const projectPatternsInput = document.querySelector('#project-patterns');
    const editorPicker = document.querySelector('#editor-picker');
    const addEditorButton = document.querySelector('#add-editor');
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
      const validationError = state.validationErrors.values().next().value;
      const visibleStatus = state.status
        || (validationError ? {error: true, key: validationError, parameters: {}, raw: ''} : null)
        || (state.dirty ? {error: false, key: 'unsaved', parameters: {}, raw: ''} : null)
        || (state.savedConfig ? {error: false, key: 'allSaved', parameters: {}, raw: ''} : null);
      status.textContent = visibleStatus
        ? (visibleStatus.raw || t(visibleStatus.key, visibleStatus.parameters))
        : '';
      status.className = visibleStatus?.error ? 'status error' : 'status';
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
        enabled: editor.enabled !== false,
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
        projectPatterns: state.projectPatterns,
      };
    }

    function validateEditors() {
      const errors = new Map();
      const counts = new Map();
      for (const editor of state.editors.filter(candidate => candidate.enabled !== false)) {
        const keyword = editor.keywordExpression.trim().toLocaleLowerCase();
        if (keyword) counts.set(keyword, (counts.get(keyword) || 0) + 1);
      }
      for (const editor of state.editors.filter(candidate => candidate.enabled !== false)) {
        const keyword = editor.keywordExpression.trim().toLocaleLowerCase();
        let key = '';
        if (!keyword) key = 'keywordRequired';
        else if (keyword === 'anycode') key = 'keywordReserved';
        else if (!/^[\\p{Letter}\\p{Number}][\\p{Letter}\\p{Number}._-]{0,31}$/u.test(keyword)) key = 'invalidKeyword';
        else if (counts.get(keyword) > 1) key = 'keywordDuplicate';
        if (key) errors.set(editor.id, key);
      }
      return errors;
    }

    function updateEditorValidation() {
      state.validationErrors = validateEditors();
      for (const editor of state.editors) {
        const card = list.querySelector('[data-editor-id="' + editor.id + '"]');
        if (!card) continue;
        const errorKey = state.validationErrors.get(editor.id) || '';
        const input = card.querySelector('.editor-keyword');
        const error = card.querySelector('.editor-error');
        const keywordExample = card.querySelector('.keyword-example');
        input.setAttribute('aria-invalid', String(Boolean(errorKey)));
        error.textContent = errorKey ? t(errorKey) : '';
        keywordExample.textContent = editor.keywordExpression.trim()
          ? t('usagePreview', {keyword: editor.keywordExpression.trim()})
          : t('keywordRequired');
      }
    }

    function updateDirtyState() {
      state.dirty = state.savedDraft !== null
        && JSON.stringify(currentDraft()) !== state.savedDraft;
      updateEditorValidation();
      saveButton.disabled = !state.dirty || state.validationErrors.size > 0;
      discardButton.disabled = !state.dirty;
      if (state.dirty && ['saved', 'savedReady'].includes(state.status?.key)) {
        state.status = null;
      }
      updateStatus();
    }

    function setFormFromConfig(config, {remember = false} = {}) {
      state.config = clone(config);
      state.editors = config.editors.map(editor => ({
        ...editor,
        enabled: editor.enabled !== false,
        iconPreview: editor.iconUrl || '',
      }));
      state.projectPatterns = [...config.projectPatterns];
      projectPatternsInput.value = state.projectPatterns.join('\\n');
      renderDirectories();
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
      for (const element of document.querySelectorAll('[data-i18n-aria-label]')) {
        element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
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

    function displayProjectPattern(pattern) {
      return pattern.endsWith('/*') ? pattern.slice(0, -2) : pattern;
    }

    function syncProjectPatternsInput() {
      projectPatternsInput.value = state.projectPatterns.join('\\n');
    }

    function renderDirectories() {
      directoryList.replaceChildren();
      if (state.projectPatterns.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'picker-empty';
        empty.textContent = t('noDirectories');
        directoryList.append(empty);
        return;
      }
      state.projectPatterns.forEach((pattern, index) => {
        const row = document.createElement('div');
        row.className = 'directory-row';
        row.append(createIcon('folder', 19));
        const label = document.createElement('span');
        label.className = 'directory-path';
        label.textContent = displayProjectPattern(pattern);
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'icon-button';
        remove.append(createIcon('x', 16));
        remove.setAttribute('aria-label', t('removeDirectory', {path: label.textContent}));
        remove.setAttribute('title', t('removeDirectory', {path: label.textContent}));
        remove.addEventListener('click', () => {
          state.projectPatterns.splice(index, 1);
          syncProjectPatternsInput();
          renderDirectories();
          updateDirtyState();
        });
        row.append(label, remove);
        directoryList.append(row);
      });
    }

    function uniqueKeyword(value) {
      const base = String(value || 'editor').toLocaleLowerCase().replace(/[^a-z0-9._-]+/gu, '-').replace(/^-|-$/gu, '') || 'editor';
      const used = new Set(state.editors.map(editor => editor.keywordExpression.toLocaleLowerCase()));
      if (!used.has(base)) return base;
      let suffix = 2;
      while (used.has(base + suffix)) suffix += 1;
      return base + suffix;
    }

    function addEditor(editor) {
      state.editors.push({
        enabled: true,
        iconPath: '',
        id: crypto.randomUUID(),
        ...editor,
      });
      closeEditorPicker();
      render();
      list.querySelector('[data-editor-id="' + state.editors.at(-1).id + '"] .editor-keyword').focus();
    }

    function renderEditorPicker() {
      const pickerList = document.querySelector('#installed-editor-list');
      pickerList.replaceChildren();
      const configuredTypes = new Set(state.editors.map(editor => editor.type));
      const installedTypes = state.localEnvironment.installedEditorTypes;
      if (installedTypes.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'picker-empty';
        empty.textContent = t('noInstalledEditors');
        pickerList.append(empty);
        return;
      }
      for (const type of installedTypes) {
        const configured = configuredTypes.has(type);
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'picker-option';
        option.disabled = configured;
        const image = document.createElement('img');
        image.src = BUILT_IN_EDITOR_ICONS[type];
        image.alt = '';
        const label = document.createElement('span');
        label.textContent = t(EDITOR_LABEL_KEYS[type]);
        option.append(image, label);
        if (configured) {
          const status = document.createElement('span');
          status.className = 'picker-option-status';
          status.textContent = t('alreadyAdded');
          option.append(status);
        } else {
          option.addEventListener('click', () => {
            const preset = state.types[type];
            addEditor({
              applicationName: preset.applicationName,
              keywordExpression: uniqueKeyword(preset.defaultKeyword),
              type,
            });
          });
        }
        pickerList.append(option);
      }
    }

    function closeEditorPicker() {
      editorPicker.hidden = true;
      editorPicker.classList.remove('opens-up');
      addEditorButton.setAttribute('aria-expanded', 'false');
    }

    function positionEditorPicker() {
      const footerTop = document.querySelector('.footer').getBoundingClientRect().top;
      const buttonBottom = addEditorButton.getBoundingClientRect().bottom;
      const availableBelow = footerTop - buttonBottom - 16;
      editorPicker.classList.toggle('opens-up', availableBelow < editorPicker.offsetHeight);
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
        renderEditorPicker();
        updateDirtyState();
        return;
      }

      state.editors.forEach((editor, index) => {
        const card = document.createElement('article');
        card.className = 'editor-card' + (editor.enabled === false ? ' is-disabled' : '');
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
        const meta = document.createElement('div');
        meta.className = 'editor-meta';
        const name = document.createElement('div');
        name.className = 'editor-name';
        name.textContent = editorLabel(editor);
        const editorState = document.createElement('div');
        editorState.className = 'editor-state';
        const appMissing = editor.type !== 'custom'
          && !state.localEnvironment.installedEditorTypes.includes(editor.type);
        if (appMissing) editorState.classList.add('warning');
        editorState.textContent = appMissing ? t('appNotInstalled') : t('editorDisabled');
        meta.append(name);
        if (appMissing || editor.enabled === false) meta.append(editorState);
        identity.append(iconControl, meta);

        const keywordControl = document.createElement('label');
        keywordControl.className = 'keyword-control';
        const keywordHeading = document.createElement('span');
        keywordHeading.className = 'keyword-heading';
        const keywordLabel = document.createElement('span');
        keywordLabel.className = 'keyword-label';
        keywordLabel.textContent = t('alfredKeyword');
        keywordHeading.append(keywordLabel);
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
        const keywordExample = document.createElement('span');
        keywordExample.className = 'keyword-example';
        const error = document.createElement('div');
        error.className = 'editor-error';
        error.id = 'editor-error-' + editor.id;
        keyword.setAttribute('aria-describedby', error.id);
        keywordControl.append(keywordHeading, keyword, keywordExample, error);

        const actions = document.createElement('div');
        actions.className = 'editor-actions';
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'switch';
        toggle.setAttribute('aria-pressed', String(editor.enabled !== false));
        toggle.setAttribute('aria-label', t('toggleEditor', {name: editorLabel(editor)}));
        toggle.setAttribute('title', t(editor.enabled === false ? 'editorDisabled' : 'editorEnabled'));
        toggle.addEventListener('click', () => {
          editor.enabled = editor.enabled === false;
          render();
          list.querySelector('[data-editor-id="' + editor.id + '"] .switch').focus();
        });
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'editor-action danger';
        remove.append(createIcon('trash', 15));
        const removeText = document.createElement('span');
        removeText.textContent = t('removeEditor');
        remove.append(removeText);
        remove.setAttribute('aria-label', t('removeEditorLabel', {name: editorLabel(editor)}));
        remove.setAttribute('title', t('removeEditorLabel', {name: editorLabel(editor)}));
        remove.addEventListener('click', () => {
          state.editors.splice(index, 1);
          render();
          addEditorButton.focus();
        });
        actions.append(toggle, remove);
        card.append(identity, keywordControl, actions);
        list.append(card);
      });
      renderEditorPicker();
      updateDirtyState();
    }

    async function load() {
      setStatus('loading');
      try {
        const body = await api('/api/config');
        state.types = body.editorTypes;
        state.localEnvironment = body.localEnvironment;
        setFormFromConfig(body.config, {remember: true});
        if (body.isFirstRun) {
          const recommended = clone(body.config);
          if (state.localEnvironment.existingProjectPatterns.length > 0) {
            recommended.projectPatterns = [...state.localEnvironment.existingProjectPatterns];
          }
          setFormFromConfig(recommended);
        }
        renderEditorPicker();
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
      renderDirectories();
      renderEditorPicker();
      render();
    });

    addEditorButton.addEventListener('click', () => {
      const opening = editorPicker.hidden;
      editorPicker.hidden = !opening;
      addEditorButton.setAttribute('aria-expanded', String(opening));
      if (opening) {
        renderEditorPicker();
        positionEditorPicker();
        editorPicker.querySelector('button')?.focus();
      }
    });

    document.querySelector('#choose-application').addEventListener('click', async () => {
      closeEditorPicker();
      try {
        const selection = await api('/api/choose-application', {method: 'POST'});
        if (selection.canceled) return;
        addEditor({
          applicationName: selection.applicationName,
          keywordExpression: uniqueKeyword(selection.applicationName),
          type: 'custom',
        });
      } catch (error) {
        setRawStatus(error.message, true);
      }
    });

    document.querySelector('#add-directory').addEventListener('click', async event => {
      const button = event.currentTarget;
      button.disabled = true;
      try {
        const selection = await api('/api/choose-directory', {method: 'POST'});
        if (selection.canceled || state.projectPatterns.includes(selection.pattern)) return;
        state.projectPatterns.push(selection.pattern);
        syncProjectPatternsInput();
        renderDirectories();
        updateDirtyState();
      } catch (error) {
        setRawStatus(error.message, true);
      } finally {
        button.disabled = false;
      }
    });

    document.querySelector('#advanced-toggle').addEventListener('click', event => {
      const expanded = event.currentTarget.getAttribute('aria-expanded') !== 'true';
      event.currentTarget.setAttribute('aria-expanded', String(expanded));
      document.querySelector('#advanced-panel').hidden = !expanded;
      event.currentTarget.querySelector('svg').style.transform = expanded ? 'rotate(90deg)' : '';
    });

    projectPatternsInput.addEventListener('input', () => {
      state.projectPatterns = projectPatternsInput.value
        .split(/[\\n,;]/)
        .map(value => value.trim())
        .filter(Boolean);
      updateDirtyState();
    });
    projectPatternsInput.addEventListener('blur', renderDirectories);
    document.addEventListener('click', event => {
      if (!event.target.closest('.editor-add')) closeEditorPicker();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !editorPicker.hidden) {
        closeEditorPicker();
        addEditorButton.focus();
      }
    });
    discardButton.addEventListener('click', () => {
      if (!state.savedConfig || !state.dirty) return;
      setFormFromConfig(state.savedConfig);
      state.status = null;
      updateStatus();
    });
    saveButton.addEventListener('click', async () => {
      if (!state.dirty || state.validationErrors.size > 0) return;
      saveButton.disabled = true;
      discardButton.disabled = true;
      setStatus('saving');
      try {
        const body = await api('/api/config', {
          method: 'POST',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify({
            editors: state.editors.map(editorPayload),
            projectPatterns: state.projectPatterns,
            version: state.config.version,
          }),
        });
        setFormFromConfig(body.config, {remember: true});
        const firstEditor = body.config.editors.find(editor => editor.enabled !== false);
        setStatus(firstEditor ? 'savedReady' : 'saved', false, {
          keyword: firstEditor?.keywordExpression || '',
        });
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
