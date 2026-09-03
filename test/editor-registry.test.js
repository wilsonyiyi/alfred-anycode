import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createEditorRegistry,
  parseEditorKeyword,
} from '../src/ides/editor-registry.js';

function definition(overrides = {}) {
  return {
    applicationName: 'Visual Studio Code',
    iconPath: '',
    id: 'editor-1',
    keywordExpression: 'code',
    ...overrides,
  };
}

test('parseEditorKeyword normalizes one Alfred keyword and rejects aliases', () => {
  assert.equal(parseEditorKeyword(' VSC '), 'vsc');
  assert.throws(() => parseEditorKeyword('code||vsc'), /Invalid IDE keyword/);
});

test('createEditorRegistry resolves each IDE independently by used keyword', () => {
  const registry = createEditorRegistry([
    definition(),
    definition({
      applicationName: 'Cursor',
      id: 'editor-2',
      keywordExpression: 'cursor',
    }),
  ]);

  assert.equal(registry.resolve('code').applicationName, 'Visual Studio Code');
  assert.equal(registry.resolve('CURSOR').applicationName, 'Cursor');
  assert.equal(registry.resolve('cursor').windowMode, undefined);
});

test('createEditorRegistry preserves Cursor window mode', () => {
  const registry = createEditorRegistry([
    definition({
      applicationName: 'Cursor',
      id: 'cursor',
      keywordExpression: 'cursor',
      windowMode: 'agents',
    }),
  ]);

  assert.equal(registry.resolve('cursor').windowMode, 'agents');
});

test('createEditorRegistry rejects ambiguous duplicate keywords', () => {
  assert.throws(
    () => createEditorRegistry([
      definition(),
      definition({id: 'editor-2', keywordExpression: 'code'}),
    ]),
    /Duplicate IDE keyword "code"/,
  );
});

test('createEditorRegistry rejects invalid keyword and application settings', () => {
  assert.throws(
    () => createEditorRegistry([definition({keywordExpression: 'bad keyword'})]),
    /Invalid IDE keyword/,
  );
  assert.throws(
    () => createEditorRegistry([definition({applicationName: ''})]),
    /application name is required/,
  );
});

test('createEditorRegistry ignores disabled editors with an empty keyword', () => {
  const registry = createEditorRegistry([
    definition(),
    definition({applicationName: '', id: 'custom', keywordExpression: ''}),
  ]);

  assert.equal(registry.editors.length, 1);
  assert.equal(registry.resolve('code').applicationName, 'Visual Studio Code');
});
