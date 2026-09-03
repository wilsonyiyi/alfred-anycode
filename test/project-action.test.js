import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildOpenInvocation,
  executeProjectAction,
  parseActionArgument,
} from '../src/actions/project-action.js';

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

  assert.equal(calls[0].command, '/usr/bin/open');
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

test('buildOpenInvocation uses the Cursor CLI for IDE mode', () => {
  const cli = '/Applications/Cursor.app/Contents/Resources/app/bin/cursor';
  const exists = value => value === cli;

  assert.deepEqual(
    buildOpenInvocation(
      {applicationName: 'Cursor', windowMode: 'ide'},
      '/Code/demo',
      {exists, homeDirectory: '/Users/example'},
    ),
    {command: cli, arguments: ['--classic', '/Code/demo']},
  );
});

test('buildOpenInvocation creates a new Agent scoped to the project in one CLI call', () => {
  const cli = '/Applications/Cursor.app/Contents/Resources/app/bin/cursor';

  assert.deepEqual(
    buildOpenInvocation(
      {applicationName: 'Cursor', windowMode: 'agents'},
      '/Code/project with spaces',
      {exists: value => value === cli, homeDirectory: '/Users/example'},
    ),
    {command: cli, arguments: ['--glass', '/Code/project with spaces']},
  );
});

test('buildOpenInvocation falls back to open --args for IDE mode when the Cursor CLI is missing', () => {
  assert.deepEqual(
    buildOpenInvocation(
      {applicationName: 'Cursor', windowMode: 'ide'},
      '/Code/demo',
      {exists: () => false, homeDirectory: '/Users/example'},
    ),
    {
      command: '/usr/bin/open',
      arguments: ['-a', 'Cursor', '/Code/demo', '--args', '--classic'],
    },
  );
  assert.throws(
    () => buildOpenInvocation(
      {applicationName: 'Cursor', windowMode: 'agents'},
      '/Code/demo',
      {exists: () => false, homeDirectory: '/Users/example'},
    ),
    /requires Cursor's bundled CLI/,
  );
});

test('executeProjectAction creates one project-scoped Cursor Agent through one CLI invocation', () => {
  const calls = [];
  const cli = '/Applications/Cursor.app/Contents/Resources/app/bin/cursor';
  const result = executeProjectAction(
    JSON.stringify({
      action: 'open',
      editor: {applicationName: 'Cursor', id: 'cursor', label: 'Cursor', windowMode: 'agents'},
      path: '/Code/demo',
    }),
    {
      exists: value => value === '/Code/demo' || value === cli,
      homeDirectory: '/Users/example',
      runner(command, arguments_) {
        calls.push({arguments_, command});
        return {status: 0, stderr: ''};
      },
    },
  );

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], {command: cli, arguments_: ['--glass', '/Code/demo']});
  assert.deepEqual(result.arguments, ['--glass', '/Code/demo']);
});
