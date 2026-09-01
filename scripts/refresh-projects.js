#!/usr/bin/env node

import alfred from '../src/alfred/runtime.js';
import {readWorkflowConfig} from '../src/config/workflow-config.js';
import {createProjectCatalog} from '../src/projects/project-catalog.js';
import {discoverProjects} from '../src/projects/project-discovery.js';
import {
  PROJECT_REFRESH_STATE_KEY,
  PROJECT_REFRESH_WORKER_VARIABLE,
} from '../src/projects/project-refresh.js';

const refreshId = process.env[PROJECT_REFRESH_WORKER_VARIABLE];
if (!refreshId) {
  throw new Error(`Missing ${PROJECT_REFRESH_WORKER_VARIABLE}.`);
}

const startedAt = alfred.cache.get(PROJECT_REFRESH_STATE_KEY)?.startedAt ?? Date.now();
const updateRefreshState = state => {
  if (alfred.cache.get(PROJECT_REFRESH_STATE_KEY)?.id === refreshId) {
    alfred.cache.set(PROJECT_REFRESH_STATE_KEY, state);
  }
};

try {
  const config = await readWorkflowConfig();
  const catalog = createProjectCatalog({
    cache: alfred.cache,
    cacheTtlMs: config.cacheTtlMs,
    discover: patterns => discoverProjects(patterns, {
      homeDirectory: config.homeDirectory,
    }),
  });
  const projects = await catalog.list(config.projectPatterns, {refresh: true});
  updateRefreshState({
    completedAt: Date.now(),
    id: refreshId,
    projectCount: projects.length,
    startedAt,
    status: 'success',
  });
} catch (error) {
  updateRefreshState({
    completedAt: Date.now(),
    id: refreshId,
    message: error instanceof Error ? error.message : String(error),
    startedAt,
    status: 'error',
  });
}
