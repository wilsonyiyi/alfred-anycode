import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  buildAlfredWorkflow,
  WORKFLOW_ARCHIVE_NAME,
} from '../src/release/alfred-workflow.js';

test('buildAlfredWorkflow bundles production dependencies into an installable archive', async t => {
  const releaseRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'anycode-release-'));
  const packageRoot = path.join(releaseRoot, 'package');
  await fs.mkdir(packageRoot, {recursive: true});
  await fs.writeFile(path.join(packageRoot, 'info.plist'), '<plist/>');
  t.after(() => fs.rm(releaseRoot, {force: true, recursive: true}));

  const commands = [];
  const commandRunner = async (command, args, options) => {
    commands.push({args, command, cwd: options.cwd});
    if (command === 'zip') {
      await fs.writeFile(path.join(releaseRoot, WORKFLOW_ARCHIVE_NAME), 'workflow');
    }
  };

  const result = await buildAlfredWorkflow({commandRunner, releaseRoot});

  assert.equal(result.packageRoot, packageRoot);
  assert.equal(result.archivePath, path.join(releaseRoot, WORKFLOW_ARCHIVE_NAME));
  assert.deepEqual(commands, [
    {
      args: ['ci', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund'],
      command: 'npm',
      cwd: packageRoot,
    },
    {
      args: [
        '-q',
        '-r',
        path.join(releaseRoot, WORKFLOW_ARCHIVE_NAME),
        '.',
        '-x',
        '*.DS_Store',
      ],
      command: 'zip',
      cwd: packageRoot,
    },
  ]);
});

test('buildAlfredWorkflow requires a production workflow package first', async t => {
  const releaseRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'anycode-release-'));
  t.after(() => fs.rm(releaseRoot, {force: true, recursive: true}));

  await assert.rejects(
    buildAlfredWorkflow({commandRunner: async () => {}, releaseRoot}),
    error => error?.code === 'ENOENT',
  );
});
