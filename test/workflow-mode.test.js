import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  inspectWorkflowMode,
  switchToDevelopment,
  switchToProduction,
} from '../src/install/workflow-mode.js';

async function createSandbox(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'alfred-anycode-mode-'));
  t.after(() => fs.rm(directory, {recursive: true, force: true}));
  return directory;
}

async function createFixture(t) {
  const sandbox = await createSandbox(t);
  const packageRoot = path.join(sandbox, 'package');
  const preferencesRoot = path.join(sandbox, 'preferences');
  const backupRoot = path.join(sandbox, 'backups');
  const destination = path.join(preferencesRoot, 'workflows', 'alfred-anycode');
  await fs.mkdir(packageRoot);
  await fs.mkdir(destination, {recursive: true});
  await fs.writeFile(path.join(destination, 'release-marker'), 'release');
  return {
    backupRoot,
    destination,
    fileSystem: fs,
    packageName: 'alfred-anycode',
    packageRoot,
    preferencesRoot,
  };
}

test('switches between one release directory and one development link', async t => {
  const options = await createFixture(t);

  const development = await switchToDevelopment(options);
  assert.equal(development.mode, 'development');
  assert.equal(await fs.realpath(options.destination), await fs.realpath(options.packageRoot));
  assert.equal(
    await fs.readFile(path.join(development.releaseBackup, 'release-marker'), 'utf8'),
    'release',
  );

  const unchanged = await switchToDevelopment(options);
  assert.equal(unchanged.changed, false);

  const production = await switchToProduction(options);
  assert.equal(production.mode, 'production');
  assert.equal(await fs.readFile(path.join(options.destination, 'release-marker'), 'utf8'), 'release');
  await assert.rejects(fs.lstat(production.releaseBackup), {code: 'ENOENT'});

  const productionAgain = await switchToProduction(options);
  assert.equal(productionAgain.changed, false);
});

test('recovers when a switch was interrupted after preserving the release', async t => {
  const options = await createFixture(t);
  const initial = await inspectWorkflowMode(options);
  await fs.mkdir(path.dirname(initial.releaseBackup), {recursive: true});
  await fs.rename(initial.destination, initial.releaseBackup);

  const interrupted = await inspectWorkflowMode(options);
  assert.equal(interrupted.mode, 'development-interrupted');

  await switchToDevelopment(options);
  assert.equal(await fs.realpath(options.destination), await fs.realpath(options.packageRoot));
  await switchToProduction(options);
  assert.equal(await fs.readFile(path.join(options.destination, 'release-marker'), 'utf8'), 'release');
});

test('refuses foreign links and development links without a release backup', async t => {
  const options = await createFixture(t);
  const foreignRoot = path.join(path.dirname(options.packageRoot), 'foreign');
  await fs.mkdir(foreignRoot);
  await fs.rm(options.destination, {recursive: true});
  await fs.symlink(foreignRoot, options.destination, 'dir');

  await assert.rejects(switchToDevelopment(options), /Refusing to replace workflow link/u);

  await fs.unlink(options.destination);
  await fs.symlink(options.packageRoot, options.destination, 'dir');
  await assert.rejects(switchToProduction(options), /No preserved release exists/u);
});
