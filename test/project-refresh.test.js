import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import {
  beginProjectRefresh,
  getProjectRefreshPollInterval,
  PROJECT_REFRESH_STATE_KEY,
  PROJECT_REFRESH_WORKER_VARIABLE,
  readProjectRefreshState,
} from '../src/projects/project-refresh.js';

function createCache() {
  const values = new Map();
  return {
    get: key => values.get(key),
    set: (key, value) => values.set(key, value),
  };
}

test('beginProjectRefresh persists running state and detaches a worker', () => {
  const cache = createCache();
  const calls = [];
  let unrefCalled = false;
  const runner = (...arguments_) => {
    calls.push(arguments_);
    return {unref: () => { unrefCalled = true; }};
  };

  const state = beginProjectRefresh({
    cache,
    clock: () => 1_000,
    environment: {EXAMPLE: 'value'},
    refreshId: 'refresh-1',
    runner,
    workflowRoot: '/workflow',
  });

  assert.deepEqual(state, {id: 'refresh-1', startedAt: 1_000, status: 'running'});
  assert.deepEqual(cache.get(PROJECT_REFRESH_STATE_KEY), state);
  assert.equal(calls[0][0], process.execPath);
  assert.deepEqual(calls[0][1], [path.join('/workflow', 'scripts', 'refresh-projects.js')]);
  assert.equal(calls[0][2].env[PROJECT_REFRESH_WORKER_VARIABLE], 'refresh-1');
  assert.equal(calls[0][2].stdio, 'ignore');
  assert.equal(unrefCalled, true);
});

test('getProjectRefreshPollInterval backs off as refresh time increases', () => {
  const intervalAt = elapsedMs => getProjectRefreshPollInterval({
    clock: () => 10_000 + elapsedMs,
    startedAt: 10_000,
  });

  assert.equal(intervalAt(0), 0.2);
  assert.equal(intervalAt(999), 0.2);
  assert.equal(intervalAt(1_000), 0.5);
  assert.equal(intervalAt(4_999), 0.5);
  assert.equal(intervalAt(5_000), 1);
  assert.equal(intervalAt(30_000), 1);
});

test('readProjectRefreshState returns success and bounds stalled refreshes', () => {
  const cache = createCache();
  cache.set(PROJECT_REFRESH_STATE_KEY, {
    id: 'refresh-1',
    projectCount: 42,
    startedAt: 1_000,
    status: 'success',
  });
  assert.equal(readProjectRefreshState({cache, refreshId: 'refresh-1'}).projectCount, 42);

  cache.set(PROJECT_REFRESH_STATE_KEY, {
    id: 'refresh-2',
    startedAt: 1_000,
    status: 'running',
  });
  assert.deepEqual(readProjectRefreshState({
    cache,
    clock: () => 2_001,
    refreshId: 'refresh-2',
    timeoutMs: 1_000,
  }), {
    id: 'refresh-2',
    message: 'Project refresh timed out. Remove and add :refresh to try again.',
    startedAt: 1_000,
    status: 'error',
  });
});
