import assert from 'node:assert/strict';
import test from 'node:test';
import {resolveEditorIcon} from '../src/ides/editor-icon.js';

const editor = {
  applicationName: 'Cursor',
  iconPath: '',
};

test('resolveEditorIcon prefers the configured icon path', () => {
  const icon = resolveEditorIcon(
    {...editor, iconPath: '~/Icons/cursor.icns'},
    {exists: path => path === '/Users/example/Icons/cursor.icns', homeDirectory: '/Users/example'},
  );

  assert.deepEqual(icon, {path: '/Users/example/Icons/cursor.icns'});
});

test('resolveEditorIcon automatically uses the installed application icon', () => {
  const icon = resolveEditorIcon(editor, {
    exists: path => path === '/Applications/Cursor.app',
    homeDirectory: '/Users/example',
  });

  assert.deepEqual(icon, {path: '/Applications/Cursor.app', type: 'fileicon'});
});

test('resolveEditorIcon returns undefined when no icon source exists', () => {
  assert.equal(resolveEditorIcon(editor, {
    exists: () => false,
    homeDirectory: '/Users/example',
  }), undefined);
});
