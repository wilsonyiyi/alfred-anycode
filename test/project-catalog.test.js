import assert from 'node:assert/strict';
import test from 'node:test';
import {createProjectCatalog} from '../src/projects/project-catalog.js';

function createMemoryCache() {
  const values = new Map();
  return {
    get: key => values.get(key),
    set: (key, value) => values.set(key, value),
  };
}

test('project catalog reuses a fresh cache for the same patterns', async () => {
  let discoveryCount = 0;
  const catalog = createProjectCatalog({
    cache: createMemoryCache(),
    cacheTtlMs: 1000,
    clock: () => 100,
    discover: async () => {
      discoveryCount += 1;
      return [{absolutePath: '/Code/demo', name: 'demo'}];
    },
  });

  await catalog.list(['/Code/*']);
  await catalog.list(['/Code/*']);
  assert.equal(discoveryCount, 1);
});

test('project catalog refreshes immediately when patterns change', async () => {
  let discoveryCount = 0;
  const catalog = createProjectCatalog({
    cache: createMemoryCache(),
    cacheTtlMs: 1000,
    clock: () => 100,
    discover: async () => {
      discoveryCount += 1;
      return [];
    },
  });

  await catalog.list(['/Code/*']);
  await catalog.list(['/Work/*']);
  assert.equal(discoveryCount, 2);
});
