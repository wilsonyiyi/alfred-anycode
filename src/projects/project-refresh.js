import {spawn} from 'node:child_process';
import path from 'node:path';

export const PROJECT_REFRESH_STATE_KEY = 'project-refresh-v1';
export const PROJECT_REFRESH_SESSION_VARIABLE = 'anycode_refresh_id';
export const PROJECT_REFRESH_WORKER_VARIABLE = 'ANYCODE_REFRESH_ID';
export const PROJECT_REFRESH_TIMEOUT_MS = 30_000;

export function getProjectRefreshPollInterval({clock = Date.now, startedAt}) {
  const elapsedMs = Math.max(0, clock() - startedAt);
  if (elapsedMs < 1_000) {
    return 0.2;
  }

  if (elapsedMs < 5_000) {
    return 0.5;
  }

  return 1;
}

export function createProjectRefreshId({clock = Date.now, processId = process.pid} = {}) {
  return `${clock()}-${processId}`;
}

export function beginProjectRefresh({
  cache,
  clock = Date.now,
  environment = process.env,
  refreshId,
  runner = spawn,
  workflowRoot,
}) {
  const resolvedRefreshId = refreshId ?? createProjectRefreshId({clock});
  const state = {
    id: resolvedRefreshId,
    startedAt: clock(),
    status: 'running',
  };
  cache.set(PROJECT_REFRESH_STATE_KEY, state);

  const workerPath = path.join(workflowRoot, 'scripts', 'refresh-projects.js');
  const child = runner(process.execPath, [workerPath], {
    cwd: workflowRoot,
    detached: true,
    env: {
      ...environment,
      [PROJECT_REFRESH_WORKER_VARIABLE]: resolvedRefreshId,
    },
    stdio: 'ignore',
  });
  child.unref();
  return state;
}

export function readProjectRefreshState({
  cache,
  clock = Date.now,
  refreshId,
  timeoutMs = PROJECT_REFRESH_TIMEOUT_MS,
}) {
  const state = cache.get(PROJECT_REFRESH_STATE_KEY);
  if (!state || state.id !== refreshId) {
    return {
      id: refreshId,
      message: 'Project refresh state was lost. Remove and add :refresh to try again.',
      status: 'error',
    };
  }

  if (state.status === 'running' && clock() - state.startedAt > timeoutMs) {
    return {
      ...state,
      message: 'Project refresh timed out. Remove and add :refresh to try again.',
      status: 'error',
    };
  }

  return state;
}
