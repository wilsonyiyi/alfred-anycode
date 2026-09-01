import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  assertUnprivilegedInstall,
  isGlobalNpmInstall,
  linkWorkflow,
  resolveAlfredPreferences,
  unlinkWorkflow,
  workflowLinkName,
} from '../src/install/workflow-link.js';

async function createSandbox(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'alfred-anycode-link-'));
  t.after(() => fs.rm(directory, {recursive: true, force: true}));
  return directory;
}

test('workflowLinkName creates a filesystem-safe name for scoped packages', () => {
  assert.equal(workflowLinkName('@scope/alfred-anycode'), '@scope-alfred-anycode');
  assert.throws(() => workflowLinkName(''));
});

test('assertUnprivilegedInstall rejects root and sudo installs', () => {
  assert.throws(
    () => assertUnprivilegedInstall({environment: {}, userId: 0}),
    /Do not install Alfred workflows with sudo/,
  );
  assert.throws(
    () => assertUnprivilegedInstall({environment: {SUDO_USER: 'example'}, userId: 501}),
    /Do not install Alfred workflows with sudo/,
  );
  assert.doesNotThrow(
    () => assertUnprivilegedInstall({environment: {}, userId: 501}),
  );
});

test('isGlobalNpmInstall only enables automatic linking for global npm installs', () => {
  assert.equal(isGlobalNpmInstall({environment: {npm_config_global: 'true'}}), true);
  assert.equal(isGlobalNpmInstall({environment: {npm_config_global: 'false'}}), false);
  assert.equal(isGlobalNpmInstall({environment: {}}), false);
});

test('resolveAlfredPreferences prefers explicit Alfred environment configuration', async () => {
  const resolved = await resolveAlfredPreferences({
    fileSystem: fs,
    environment: {alfred_preferences: '~/Synced Alfred/Alfred.alfredpreferences'},
    homeDirectory: '/Users/example',
  });

  assert.equal(resolved, '/Users/example/Synced Alfred/Alfred.alfredpreferences');
});

test('resolveAlfredPreferences reads the active modern Alfred preferences path', async t => {
  const homeDirectory = await createSandbox(t);
  const alfredDirectory = path.join(homeDirectory, 'Library', 'Application Support', 'Alfred');
  await fs.mkdir(alfredDirectory, {recursive: true});
  await fs.writeFile(
    path.join(alfredDirectory, 'prefs.json'),
    JSON.stringify({current: '~/Dropbox/Alfred/Alfred.alfredpreferences'}),
  );

  const resolved = await resolveAlfredPreferences({
    fileSystem: fs,
    environment: {},
    homeDirectory,
  });

  assert.equal(resolved, path.join(homeDirectory, 'Dropbox', 'Alfred', 'Alfred.alfredpreferences'));
});

test('linkWorkflow is idempotent and unlinkWorkflow only removes its own link', async t => {
  const sandbox = await createSandbox(t);
  const packageRoot = path.join(sandbox, 'package');
  const preferencesRoot = path.join(sandbox, 'preferences');
  await fs.mkdir(packageRoot);

  const first = await linkWorkflow({
    fileSystem: fs,
    packageName: 'alfred-anycode',
    packageRoot,
    preferencesRoot,
  });
  const second = await linkWorkflow({
    fileSystem: fs,
    packageName: 'alfred-anycode',
    packageRoot,
    preferencesRoot,
  });

  assert.equal(first.created, true);
  assert.equal(second.created, false);
  assert.equal(await fs.realpath(first.destination), await fs.realpath(packageRoot));

  const unlinked = await unlinkWorkflow({
    fileSystem: fs,
    packageName: 'alfred-anycode',
    packageRoot,
    preferencesRoot,
  });
  assert.equal(unlinked.removed, true);
  await assert.rejects(fs.lstat(first.destination), {code: 'ENOENT'});
});

test('linkWorkflow does not duplicate a package already inside Alfred workflows', async t => {
  const sandbox = await createSandbox(t);
  const preferencesRoot = path.join(sandbox, 'preferences');
  const packageRoot = path.join(preferencesRoot, 'workflows', 'user.workflow.example');
  await fs.mkdir(packageRoot, {recursive: true});

  const result = await linkWorkflow({
    fileSystem: fs,
    packageName: 'alfred-anycode',
    packageRoot,
    preferencesRoot,
  });

  assert.equal(result.alreadyInstalled, true);
  assert.equal(result.destination, await fs.realpath(packageRoot));
  await assert.rejects(
    fs.lstat(path.join(preferencesRoot, 'workflows', 'alfred-anycode')),
    {code: 'ENOENT'},
  );
});

test('linkWorkflow refuses to replace an existing workflow directory', async t => {
  const sandbox = await createSandbox(t);
  const packageRoot = path.join(sandbox, 'package');
  const preferencesRoot = path.join(sandbox, 'preferences');
  const destination = path.join(preferencesRoot, 'workflows', 'alfred-anycode');
  await fs.mkdir(packageRoot);
  await fs.mkdir(destination, {recursive: true});

  await assert.rejects(
    linkWorkflow({
      fileSystem: fs,
      packageName: 'alfred-anycode',
      packageRoot,
      preferencesRoot,
    }),
    /Refusing to replace existing workflow/,
  );
});
