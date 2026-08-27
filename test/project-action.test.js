import assert from 'node:assert/strict';
import test from 'node:test';
import {executeProjectAction, parseActionArgument} from '../src/actions/project-action.js';

test('parseActionArgument requires a structured action payload', () => {
  assert.throws(() => parseActionArgument('/Code/demo'), SyntaxError);
});

test('executeProjectAction passes arguments without shell interpolation', () => {
  const calls = [];
  const payload = JSON.stringify({
    action: 'open',
    editor: {applicationName: 'Cursor', id: 'cursor', label: 'Cursor'},
    path: '/Code/project with spaces',
  });

  const result = executeProjectAction(payload, {
    exists: () => true,
    runner(command, arguments_, options) {
      calls.push({arguments_, command, options});
      return {status: 0, stderr: ''};
    },
  });

  assert.deepEqual(calls[0].arguments_, [
    '-a',
    'Cursor',
    '/Code/project with spaces',
  ]);
  assert.equal(result.editor.id, 'cursor');
});

test('executeProjectAction reveals a project without resolving an IDE', () => {
  const result = executeProjectAction(
    JSON.stringify({action: 'reveal', path: '/Code/demo'}),
    {exists: () => true, runner: () => ({status: 0, stderr: ''})},
  );

  assert.deepEqual(result.arguments, ['-R', '/Code/demo']);
});
