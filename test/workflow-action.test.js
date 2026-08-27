import assert from 'node:assert/strict';
import test from 'node:test';
import {executeWorkflowAction} from '../src/actions/workflow-action.js';

test('executeWorkflowAction starts the detached configuration service', () => {
  const calls = [];
  let unrefCalled = false;
  const result = executeWorkflowAction(JSON.stringify({action: 'configure'}), {
    environment: {ANYCODE_DATA_DIR: '/tmp/data'},
    runner(command, arguments_, options) {
      calls.push({arguments_, command, options});
      return {unref() { unrefCalled = true; }};
    },
    workflowRoot: '/tmp/workflow',
  });

  assert.equal(result.action, 'configure');
  assert.equal(unrefCalled, true);
  assert.equal(calls[0].command, process.execPath);
  assert.deepEqual(calls[0].arguments_, ['/tmp/workflow/scripts/config-server.js']);
  assert.equal(calls[0].options.detached, true);
  assert.equal(calls[0].options.stdio, 'ignore');
});

test('executeWorkflowAction delegates project actions unchanged', () => {
  const raw = JSON.stringify({action: 'open'});
  const result = executeWorkflowAction(raw, {projectAction: value => ({value})});
  assert.deepEqual(result, {value: raw});
});
