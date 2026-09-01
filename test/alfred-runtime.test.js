import assert from 'node:assert/strict';
import test from 'node:test';
import {parseWorkflowInput} from '../src/alfred/runtime.js';

test('parseWorkflowInput recognizes refresh as a standalone command', () => {
  assert.deepEqual(parseWorkflowInput('  :refresh  '), {
    query: '',
    refresh: true,
  });
});

test('parseWorkflowInput recognizes refresh anywhere as an independent token', () => {
  assert.deepEqual(parseWorkflowInput('alfred anycode :REFRESH'), {
    query: 'alfred anycode',
    refresh: true,
  });
  assert.deepEqual(parseWorkflowInput('alfred :refresh anycode'), {
    query: 'alfred anycode',
    refresh: true,
  });
  assert.deepEqual(parseWorkflowInput(':refresh alfred anycode'), {
    query: 'alfred anycode',
    refresh: true,
  });
});

test('parseWorkflowInput does not consume refresh text inside a query', () => {
  assert.deepEqual(parseWorkflowInput('project:refresh'), {
    query: 'project:refresh',
    refresh: false,
  });
});
