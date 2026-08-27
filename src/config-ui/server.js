import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {createConfigStore} from '../config/config-store.js';
import {EDITOR_TYPES} from '../config/editor-config.js';
import {syncWorkflowKeywords} from '../config/keyword-sync.js';
import {renderConfigPage} from './page.js';

const BODY_LIMIT_BYTES = 6 * 1024 * 1024;
const ICON_LIMIT_BYTES = 4 * 1024 * 1024;
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const BUILT_IN_EDITOR_ICONS = Object.freeze({
  codex: 'assets/editor-icons/codex.png',
  cursor: 'assets/editor-icons/cursor.png',
  vscode: 'assets/editor-icons/vscode.png',
  webstorm: 'assets/editor-icons/webstorm.png',
  zed: 'assets/editor-icons/zed.png',
});
const ALLOWED_IMAGE_TYPES = new Set([
  'image/gif',
  'image/icns',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/x-icns',
  'application/octet-stream',
]);

const MIME_BY_EXTENSION = {
  '.gif': 'image/gif',
  '.icns': 'image/icns',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function json(response, status, value) {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(value));
}

function page(response, value) {
  response.writeHead(200, {
    'cache-control': 'no-store',
    'content-security-policy': "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'",
    'content-type': 'text/html; charset=utf-8',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
  });
  response.end(value);
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > BODY_LIMIT_BYTES) {
      throw new Error('Configuration payload is too large.');
    }
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function safeIconExtension(name, mimeType) {
  const requested = path.extname(String(name ?? '')).toLocaleLowerCase();
  if (Object.hasOwn(MIME_BY_EXTENSION, requested)) {
    return requested;
  }
  return Object.entries(MIME_BY_EXTENSION).find(([, mime]) => mime === mimeType)?.[0] || '.png';
}

async function persistUploadedIcons({dataDirectory, editors}) {
  const iconsDirectory = path.join(dataDirectory, 'icons');
  const result = [];
  for (const source of editors) {
    const editor = {...source};
    delete editor.iconPreview;
    delete editor.iconUrl;

    if (editor.iconUpload?.dataUrl) {
      const match = /^data:([^;]+);base64,([a-z0-9+/=]+)$/iu.exec(editor.iconUpload.dataUrl);
      if (!match || !ALLOWED_IMAGE_TYPES.has(match[1])) {
        throw new Error(`Unsupported icon image for ${editor.applicationName || 'custom editor'}.`);
      }
      const bytes = Buffer.from(match[2], 'base64');
      if (bytes.length === 0 || bytes.length > ICON_LIMIT_BYTES) {
        throw new Error('Each editor icon must be between 1 byte and 4 MB.');
      }
      const extension = safeIconExtension(editor.iconUpload.name, match[1]);
      const safeId = String(editor.id).replace(/[^a-z0-9_-]/giu, '-');
      await fs.mkdir(iconsDirectory, {recursive: true});
      const iconPath = path.join(iconsDirectory, `${safeId}-${Date.now()}${extension}`);
      const temporaryPath = `${iconPath}.${process.pid}.${crypto.randomUUID()}.tmp`;
      await fs.writeFile(temporaryPath, bytes);
      await fs.rename(temporaryPath, iconPath);
      editor.iconPath = iconPath;
    }
    delete editor.iconUpload;
    result.push(editor);
  }
  return result;
}

async function serveBuiltInEditorIcon({editorType, response, workflowRoot}) {
  const relativePath = BUILT_IN_EDITOR_ICONS[editorType];
  if (!relativePath) {
    json(response, 404, {error: 'Editor icon not found.'});
    return;
  }
  try {
    const bytes = await fs.readFile(path.join(workflowRoot, relativePath));
    response.writeHead(200, {
      'cache-control': 'public, max-age=86400',
      'content-type': 'image/png',
      'x-content-type-options': 'nosniff',
    });
    response.end(bytes);
  } catch {
    json(response, 404, {error: 'Editor icon not found.'});
  }
}

function publicConfig(config, token) {
  return {
    ...config,
    editors: config.editors.map(editor => ({
      ...editor,
      iconUrl: editor.iconPath
        ? `/api/icon/${encodeURIComponent(editor.id)}?token=${encodeURIComponent(token)}`
        : '',
    })),
  };
}

async function serveIcon({config, editorId, response}) {
  const editor = config.editors.find(candidate => candidate.id === editorId);
  if (!editor?.iconPath) {
    json(response, 404, {error: 'Icon not found.'});
    return;
  }
  try {
    const bytes = await fs.readFile(editor.iconPath);
    const mimeType = MIME_BY_EXTENSION[path.extname(editor.iconPath).toLocaleLowerCase()]
      || 'application/octet-stream';
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': mimeType,
      'x-content-type-options': 'nosniff',
    });
    response.end(bytes);
  } catch {
    json(response, 404, {error: 'Icon not found.'});
  }
}

export async function startConfigServer({
  dataDirectory,
  environment = process.env,
  host = '127.0.0.1',
  workflowRoot,
}) {
  const token = crypto.randomBytes(24).toString('hex');
  const store = createConfigStore({dataDirectory, environment});
  let idleTimer;
  let server;

  const resetIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => server.close(), IDLE_TIMEOUT_MS);
    idleTimer.unref();
  };

  server = http.createServer(async (request, response) => {
    resetIdleTimer();
    const requestUrl = new URL(request.url, `http://${host}`);
    if (requestUrl.searchParams.get('token') !== token) {
      json(response, 403, {error: 'Invalid configuration session.'});
      return;
    }

    try {
      if (request.method === 'GET' && requestUrl.pathname === '/') {
        page(response, renderConfigPage({token}));
        return;
      }

      if (request.method === 'GET' && requestUrl.pathname === '/api/config') {
        const config = await store.load();
        await syncWorkflowKeywords({
          config,
          plistPath: path.join(workflowRoot, 'info.plist'),
        });
        json(response, 200, {
          config: publicConfig(config, token),
          editorTypes: EDITOR_TYPES,
        });
        return;
      }

      if (request.method === 'GET' && requestUrl.pathname.startsWith('/api/icon/')) {
        const config = await store.load();
        await serveIcon({
          config,
          editorId: decodeURIComponent(requestUrl.pathname.slice('/api/icon/'.length)),
          response,
        });
        return;
      }

      if (request.method === 'GET' && requestUrl.pathname.startsWith('/assets/editor-icon/')) {
        await serveBuiltInEditorIcon({
          editorType: decodeURIComponent(requestUrl.pathname.slice('/assets/editor-icon/'.length)),
          response,
          workflowRoot,
        });
        return;
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/config') {
        const payload = await readJsonBody(request);
        const editors = await persistUploadedIcons({
          dataDirectory,
          editors: Array.isArray(payload.editors) ? payload.editors : [],
        });
        const config = await store.save({...payload, editors});
        const sync = await syncWorkflowKeywords({
          config,
          plistPath: path.join(workflowRoot, 'info.plist'),
        });
        json(response, 200, {config: publicConfig(config, token), keywordExpression: sync.expression});
        return;
      }

      json(response, 404, {error: 'Not found.'});
    } catch (error) {
      json(response, 400, {error: error instanceof Error ? error.message : String(error)});
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, host, resolve);
  });
  resetIdleTimer();
  const address = server.address();
  return {
    server,
    token,
    url: `http://${host}:${address.port}/?token=${token}`,
  };
}
