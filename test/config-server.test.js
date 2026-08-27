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

test('configuration page is bilingual, uses a two-column card grid, and ships valid JavaScript', () => {
  const page = renderConfigPage({token: 'test-token'});
  const script = /<script>([\s\S]+)<\/script>/u.exec(page)?.[1];

  assert.match(page, /Project discovery/u);
  assert.match(page, /Editors/u);
  assert.match(page, /Add editor/u);
  assert.match(page, /添加编辑器/u);
  assert.match(page, /id="language"/u);
  assert.match(page, /grid-template-columns: repeat\(2/u);
  assert.match(page, /<svg/u);
  assert.match(page, /document\.cookie = 'anycode\.locale='/u);
  assert.match(page, /function updateDirtyState\(\)/u);
  assert.match(page, /class="button primary" id="save" type="button" disabled/u);
  assert.equal(TRANSLATIONS.en.save, 'Save changes');
  assert.equal(TRANSLATIONS.zh.save, '保存更改');
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
  await fs.writeFile(plistPath, `<dict>
<key>config</key><dict><key>keyword</key><string>old</string></dict>
<key>uid</key><string>${EDITOR_SCRIPT_FILTER_UID}</string>
</dict>`);
  const reloadCalls = [];
  const session = await startConfigServer({
    dataDirectory,
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
  assert.deepEqual(reloadCalls, [{bundleId: 'com.example.anycode'}]);

  const unchangedResponse = await fetch(new URL(`/api/config?token=${session.token}`, base), {
    body: JSON.stringify(body.config),
    headers: {'content-type': 'application/json'},
    method: 'POST',
  });
  assert.equal(unchangedResponse.status, 200);
  assert.equal(reloadCalls.length, 1);

  const saved = JSON.parse(await fs.readFile(path.join(dataDirectory, 'config.json'), 'utf8'));
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
