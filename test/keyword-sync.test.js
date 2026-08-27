import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  EDITOR_SCRIPT_FILTER_UID,
  collectEditorKeywords,
  syncWorkflowKeywords,
} from '../src/config/keyword-sync.js';

const config = {
  editors: [
    {keywordExpression: 'c||cursor'},
    {keywordExpression: 'code'},
    {keywordExpression: ''},
  ],
};

function scriptFilter({keyword, uid}) {
  return `<dict>
<key>config</key><dict><key>keyword</key><string>${keyword}</string></dict>
<key>uid</key><string>${uid}</string>
</dict>`;
}

test('collectEditorKeywords keeps all enabled aliases separate from the manager keyword', () => {
  assert.deepEqual(collectEditorKeywords(config), ['c', 'cursor', 'code']);
});

test('syncWorkflowKeywords updates only the editor Script Filter keyword field', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'anycode-plist-'));
  t.after(() => fs.rm(directory, {force: true, recursive: true}));
  const plistPath = path.join(directory, 'info.plist');
  await fs.writeFile(plistPath, [
    '<array>',
    scriptFilter({keyword: 'anycode', uid: 'MANAGER-FILTER'}),
    scriptFilter({keyword: 'old', uid: EDITOR_SCRIPT_FILTER_UID}),
    '</array>\n',
  ].join('\n'));

  const result = await syncWorkflowKeywords({config, plistPath});
  const plist = await fs.readFile(plistPath, 'utf8');
  assert.deepEqual(result, {changed: true, expression: 'c||cursor||code'});
  assert.match(plist, /<key>keyword<\/key><string>anycode<\/string>/u);
  assert.match(plist, /<key>keyword<\/key><string>c\|\|cursor\|\|code<\/string>/u);
});

test('syncWorkflowKeywords remains atomic across concurrent settings pages', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'anycode-plist-concurrent-'));
  t.after(() => fs.rm(directory, {force: true, recursive: true}));
  const plistPath = path.join(directory, 'info.plist');
  await fs.writeFile(
    plistPath,
    scriptFilter({keyword: 'old', uid: EDITOR_SCRIPT_FILTER_UID}),
  );

  await Promise.all(Array.from({length: 6}, () => syncWorkflowKeywords({config, plistPath})));

  assert.match(
    await fs.readFile(plistPath, 'utf8'),
    /<string>c\|\|cursor\|\|code<\/string>/u,
  );
});
