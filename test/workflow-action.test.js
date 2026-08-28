import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import test from 'node:test';
import {executeWorkflowAction} from '../src/actions/workflow-action.js';

test('executeWorkflowAction waits for the detached configuration service to open the page', async () => {
  const calls = [];
  let unrefCalled = false;
  const resultPromise = executeWorkflowAction(JSON.stringify({action: 'configure'}), {
    environment: {ANYCODE_DATA_DIR: '/tmp/data'},
    runner(command, arguments_, options) {
      calls.push({arguments_, command, options});
      const child = new EventEmitter();
      child.kill = () => {};
      child.unref = () => { unrefCalled = true; };
      queueMicrotask(() => child.emit('message', {type: 'anycode:config-ready'}));
      return child;
    },
    workflowRoot: '/tmp/workflow',
  });
  const result = await resultPromise;

  assert.equal(result.action, 'configure');
  assert.equal(unrefCalled, true);
  assert.equal(calls[0].command, process.execPath);
  assert.deepEqual(calls[0].arguments_, ['/tmp/workflow/scripts/config-server.js']);
  assert.equal(calls[0].options.detached, true);
  assert.deepEqual(calls[0].options.stdio, ['ignore', 'ignore', 'ignore', 'ipc']);
});

test('executeWorkflowAction delegates project actions unchanged', async () => {
  const raw = JSON.stringify({action: 'open'});
  const result = await executeWorkflowAction(raw, {projectAction: value => ({value})});
  assert.deepEqual(result, {value: raw});
});
