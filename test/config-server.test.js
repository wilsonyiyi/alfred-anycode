import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {startConfigServer} from '../src/config-ui/server.js';
import {renderConfigPage} from '../src/config-ui/page.js';
import {TRANSLATIONS} from '../src/config-ui/translations.js';
import {EDITOR_SCRIPT_FILTER_UID} from '../src/config/keyword-sync.js';

test('configuration page is bilingual, uses workflow branding, and ships valid JavaScript', () => {
  const page = renderConfigPage({token: 'test-token'});
  const script = /<script>([\s\S]+)<\/script>/u.exec(page)?.[1];

  assert.match(page, /Project discovery/u);
  assert.match(page, /Editors/u);
  assert.match(page, /Add editor/u);
  assert.match(page, /添加编辑器/u);
  assert.match(page, /id="language"/u);
  assert.match(page, /class="brand-mark" src="\/assets\/workflow-icon\?token=test-token"/u);
  assert.doesNotMatch(page, /class="setup-flow"/u);
  assert.match(page, /id="add-directory"/u);
  assert.match(page, /id="editor-picker"/u);
  assert.match(page, /className = 'keyword-control'/u);
  assert.match(page, /className = 'keyword-fields'/u);
  assert.match(page, /className = 'editor-window-mode'/u);
  assert.match(page, /className = 'editor-action danger'/u);
  assert.match(page, /className = 'keyword-example'/u);
  assert.match(page, /addEventListener\('drop'/u);
  assert.match(page, /selection\.iconDataUrl/u);
  assert.doesNotMatch(page, /className = 'usage-help'/u);
  assert.doesNotMatch(page, /row-menu/u);
  assert.match(page, /\/api\/choose-directory/u);
  assert.doesNotMatch(page, /Use \|\| to add aliases/u);
  assert.match(page, /<svg/u);
  assert.match(page, /document\.cookie = 'anycode\.locale='/u);
  assert.match(page, /function updateDirtyState\(\)/u);
  assert.match(page, /\/\^\[\\p\{Letter\}\\p\{Number\}\]/u);
  assert.match(page, /class="button primary" id="save" type="button" disabled/u);
  assert.equal(TRANSLATIONS.en.save, 'Save changes');
  assert.equal(TRANSLATIONS.zh.save, '保存更改');
  assert.equal(TRANSLATIONS.en.cursorWindowAgents, 'Agents Window');
  assert.equal(TRANSLATIONS.zh.cursorWindowAgents, 'Agents 窗口');
  assert.equal(TRANSLATIONS.zh.iconUnsupported, '请使用 PNG、JPEG、WebP、GIF 或 ICNS 图片。');
  assert.ok(script);
  assert.doesNotThrow(() => new vm.Script(script));
});

test('configuration server saves dynamic editors, icon images, and Alfred keywords', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'anycode-server-'));
  const dataDirectory = path.join(root, 'data');
  const plistPath = path.join(root, 'info.plist');
  const builtInIconsDirectory = path.join(root, 'assets', 'editor-icons');
  const builtInEditorTypes = ['codex', 'cursor', 'vscode', 'webstorm', 'zed'];
  await fs.mkdir(builtInIconsDirectory, {recursive: true});
  await Promise.all(builtInEditorTypes.map(type => (
    fs.writeFile(path.join(builtInIconsDirectory, `${type}.png`), Buffer.from(`built-in-${type}-icon`))
  )));
  await fs.writeFile(path.join(root, 'icon.png'), Buffer.from('workflow-icon'));
  await fs.writeFile(plistPath, `<dict>
<key>config</key><dict><key>keyword</key><string>old</string></dict>
<key>uid</key><string>${EDITOR_SCRIPT_FILTER_UID}</string>
</dict>`);
  const reloadCalls = [];
  const session = await startConfigServer({
    chooseApplication: async () => ({
      applicationName: 'Nova',
      applicationPath: '/Applications/Nova.app',
      iconDataUrl: 'data:image/png;base64,aWNvbg==',
    }),
    chooseDirectory: async () => '/Users/example/Work',
    dataDirectory,
    detectEnvironment: async () => ({
      existingProjectPatterns: ['~/Work/*'],
      installedEditorTypes: ['cursor'],
    }),
    environment: {
      HOME: '/Users/example',
      alfred_workflow_bundleid: 'com.example.anycode',
    },
    reloadWorkflow: async options => reloadCalls.push(options),
    workflowRoot: root,
  });
  t.after(async () => {
    session.server.close();
    await fs.rm(root, {force: true, recursive: true});
  });

  const base = new URL(session.url);
  const unauthorized = await fetch(new URL('/api/config?token=wrong', base));
  assert.equal(unauthorized.status, 403);

  const initialResponse = await fetch(new URL(`/api/config?token=${session.token}`, base));
  assert.equal(initialResponse.status, 200);
  const initial = await initialResponse.json();
  assert.equal(initial.isFirstRun, true);
  assert.deepEqual(initial.localEnvironment, {
    existingProjectPatterns: ['~/Work/*'],
    installedEditorTypes: ['cursor'],
  });
  assert.deepEqual(reloadCalls, [{bundleId: 'com.example.anycode'}]);

  const workflowIconResponse = await fetch(new URL(`/assets/workflow-icon?token=${session.token}`, base));
  assert.equal(workflowIconResponse.status, 200);
  assert.equal(workflowIconResponse.headers.get('content-type'), 'image/png');
  assert.equal(await workflowIconResponse.text(), 'workflow-icon');

  const directoryResponse = await fetch(new URL(`/api/choose-directory?token=${session.token}`, base), {
    method: 'POST',
  });
  assert.deepEqual(await directoryResponse.json(), {canceled: false, pattern: '~/Work/*'});

  const applicationResponse = await fetch(new URL(`/api/choose-application?token=${session.token}`, base), {
    method: 'POST',
  });
  assert.deepEqual(await applicationResponse.json(), {
    applicationName: 'Nova',
    applicationPath: '/Applications/Nova.app',
    canceled: false,
    iconDataUrl: 'data:image/png;base64,aWNvbg==',
  });

  const response = await fetch(new URL(`/api/config?token=${session.token}`, base), {
    body: JSON.stringify({
      editors: [
        {
          applicationName: 'Cursor',
          iconUpload: {dataUrl: 'data:image/png;base64,iVBORw0KGgo=', name: 'cursor.png'},
          id: 'cursor',
          keywordExpression: 'c',
          type: 'cursor',
        },
        {
          applicationName: 'Nova',
          iconUpload: {dataUrl: 'data:image/png;base64,iVBORw0KGgo=', name: 'nova.png'},
          id: 'nova',
          keywordExpression: 'nova',
          type: 'custom',
        },
        {applicationName: 'Xcode', id: 'xcode', keywordExpression: 'xc', type: 'custom'},
      ],
      projectPatterns: ['~/Code/*'],
    }),
    headers: {'content-type': 'application/json'},
    method: 'POST',
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.config.editors.length, 3);
  assert.match(body.config.editors[1].iconUrl, /token=/u);
  assert.equal(body.keywordExpression, 'c||nova||xc');
  assert.deepEqual(reloadCalls, [
    {bundleId: 'com.example.anycode'},
    {bundleId: 'com.example.anycode'},
  ]);

  const unchangedResponse = await fetch(new URL(`/api/config?token=${session.token}`, base), {
    body: JSON.stringify(body.config),
    headers: {'content-type': 'application/json'},
    method: 'POST',
  });
  assert.equal(unchangedResponse.status, 200);
  assert.equal(reloadCalls.length, 2);

  const saved = JSON.parse(await fs.readFile(path.join(dataDirectory, 'config.json'), 'utf8'));
  assert.equal(saved.editors[0].windowMode, 'default');
  assert.equal(saved.editors[1].windowMode, undefined);
  assert.equal(saved.editors[1].iconUpload, undefined);
  assert.match(saved.editors[0].iconPath, /cursor-\d+\.png$/u);
  assert.match(saved.editors[1].iconPath, /nova-\d+\.png$/u);
  assert.match(await fs.readFile(plistPath, 'utf8'), /c\|\|nova\|\|xc/u);

  const iconResponse = await fetch(new URL(body.config.editors[1].iconUrl, base));
  assert.equal(iconResponse.status, 200);
  for (const editorType of builtInEditorTypes) {
    const builtInIconResponse = await fetch(new URL(`/assets/editor-icon/${editorType}?token=${session.token}`, base));
    assert.equal(builtInIconResponse.status, 200);
    assert.equal(await builtInIconResponse.text(), `built-in-${editorType}-icon`);
  }
});
