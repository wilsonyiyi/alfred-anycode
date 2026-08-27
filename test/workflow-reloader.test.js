import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createWorkflowReloadScript,
  reloadAlfredWorkflow,
} from '../src/alfred/workflow-reloader.js';

test('createWorkflowReloadScript safely targets Alfred and the workflow bundle ID', () => {
  assert.equal(
    createWorkflowReloadScript('com.example.anycode'),
    'Application("com.runningwithcrayons.Alfred").reloadWorkflow("com.example.anycode");',
  );
  assert.match(
    createWorkflowReloadScript('bundle";dangerous()//'),
    /reloadWorkflow\("bundle\\";dangerous\(\)\/\/"\)/u,
  );
});

test('reloadAlfredWorkflow invokes osascript without shell interpolation', async () => {
  const calls = [];
  await reloadAlfredWorkflow({
    bundleId: 'com.example.anycode',
    execute: async (...args) => calls.push(args),
  });

  assert.deepEqual(calls, [[
    '/usr/bin/osascript',
    [
      '-l',
      'JavaScript',
      '-e',
      'Application("com.runningwithcrayons.Alfred").reloadWorkflow("com.example.anycode");',
    ],
    {encoding: 'utf8'},
  ]]);
});
