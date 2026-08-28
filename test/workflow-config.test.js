import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  DEFAULT_PROJECT_PATTERNS,
  DEFAULT_EDITOR_TYPES,
  createDefaultEditorConfig,
  normalizeEditorConfig,
  parseProjectPatterns,
} from '../src/config/editor-config.js';
import {createConfigStore} from '../src/config/config-store.js';
import {readWorkflowConfig} from '../src/config/workflow-config.js';

test('createDefaultEditorConfig starts with VS Code and Cursor', () => {
  const config = createDefaultEditorConfig({HOME: '/Users/example'});

  assert.deepEqual(config.projectPatterns, [...DEFAULT_PROJECT_PATTERNS]);
  assert.deepEqual(DEFAULT_EDITOR_TYPES, ['vscode', 'cursor']);
  assert.deepEqual(
    config.editors.map(editor => [editor.type, editor.keywordExpression]),
    [
      ['vscode', 'code'],
      ['cursor', 'cursor'],
    ],
  );
});

test('default configuration migrates Alfred variables without losing user choices', () => {
  const config = createDefaultEditorConfig({
    cursor_keyword: 'c',
    custom_editor_application: 'Nova',
    custom_editor_icon: '/tmp/nova.png',
    custom_editor_keyword: 'nova||nv',
    projects: '~/Work/*,~/Lab/*',
    zed_keyword: 'z',
  });

  assert.deepEqual(config.projectPatterns, ['~/Work/*', '~/Lab/*']);
  assert.equal(config.editors.find(editor => editor.type === 'cursor').keywordExpression, 'c');
  assert.equal(config.editors.find(editor => editor.type === 'zed').keywordExpression, 'z');
  assert.deepEqual(config.editors.at(-1), {
    applicationName: 'Nova',
    iconPath: '/tmp/nova.png',
    id: 'custom-migrated',
    keywordExpression: 'nova',
    type: 'custom',
  });
});

test('normalizeEditorConfig supports multiple dynamic custom editors', () => {
  const config = normalizeEditorConfig({
    editors: [
      {applicationName: 'Nova', id: 'nova', keywordExpression: 'nova', type: 'custom'},
      {applicationName: 'Xcode', id: 'xcode', keywordExpression: 'xc', type: 'custom'},
    ],
    projectPatterns: ['~/Code/*'],
  });

  assert.equal(config.editors.length, 2);
  assert.throws(
    () => normalizeEditorConfig({...config, editors: [...config.editors, {...config.editors[0], id: 'copy'}]}),
    /Duplicate IDE keyword "nova"/,
  );
  assert.throws(
    () => normalizeEditorConfig({editors: [{applicationName: 'Nova', keywordExpression: 'anycode', type: 'custom'}]}),
    /reserved for configuration/,
  );
});

test('normalizeEditorConfig migrates legacy aliases to the first keyword', () => {
  const config = normalizeEditorConfig({
    editors: [{applicationName: 'Visual Studio Code', keywordExpression: 'code||vsc', type: 'vscode'}],
    version: 1,
  });

  assert.equal(config.version, 2);
  assert.equal(config.editors[0].keywordExpression, 'code');
  assert.throws(
    () => normalizeEditorConfig({...config, editors: [{...config.editors[0], keywordExpression: 'code||vsc'}]}),
    /Invalid IDE keyword/,
  );
});

test('configuration store persists JSON and readWorkflowConfig consumes it', async t => {
  const dataDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'anycode-config-'));
  t.after(() => fs.rm(dataDirectory, {force: true, recursive: true}));
  const store = createConfigStore({dataDirectory, environment: {HOME: '/Users/example'}});
  await store.save({
    editors: [{applicationName: 'Cursor', id: 'cursor', keywordExpression: 'c', type: 'cursor'}],
    projectPatterns: ['~/Source/*'],
  });

  const config = await readWorkflowConfig({ANYCODE_DATA_DIR: dataDirectory, HOME: '/Users/example'});
  assert.deepEqual(config.projectPatterns, ['~/Source/*']);
  assert.equal(config.editorDefinitions[0].keywordExpression, 'c');
});

test('parseProjectPatterns accepts comma, semicolon, and newline separators', () => {
  assert.deepEqual(
    parseProjectPatterns('~/Code/*, ~/Work/*;~/Lab/*\n~/Code/*'),
    ['~/Code/*', '~/Work/*', '~/Lab/*'],
  );
});
