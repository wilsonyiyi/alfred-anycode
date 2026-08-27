import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {discoverProjects, expandHomeDirectory} from '../src/projects/project-discovery.js';

test('expandHomeDirectory expands only a leading home marker', () => {
  assert.equal(expandHomeDirectory('~/Code/*', '/Users/example'), '/Users/example/Code/*');
  assert.equal(expandHomeDirectory('/tmp/~project', '/Users/example'), '/tmp/~project');
});

test('discoverProjects returns unique, sorted project directories', async t => {
  const temporaryHome = fs.mkdtempSync(path.join(os.tmpdir(), 'alfred-anycode-'));
  t.after(() => fs.rmSync(temporaryHome, {force: true, recursive: true}));

  fs.mkdirSync(path.join(temporaryHome, 'Code', 'zeta'), {recursive: true});
  fs.mkdirSync(path.join(temporaryHome, 'Code', 'Alpha'), {recursive: true});

  const projects = await discoverProjects(['~/Code/*', '~/Code/Alpha'], {
    homeDirectory: temporaryHome,
  });

  assert.deepEqual(projects.map(project => project.name), ['Alpha', 'zeta']);
});
