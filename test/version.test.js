import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {bumpPackageVersion, resolveReleaseVersion} from '../src/release/version.js';

test('resolveReleaseVersion increments stable semantic versions', () => {
  assert.equal(resolveReleaseVersion('1.2.3', 'patch'), '1.2.4');
  assert.equal(resolveReleaseVersion('1.2.3', 'minor'), '1.3.0');
  assert.equal(resolveReleaseVersion('1.2.3', 'major'), '2.0.0');
  assert.equal(resolveReleaseVersion('1.2.3', '4.5.6'), '4.5.6');
  assert.throws(() => resolveReleaseVersion('1.2.3', 'next'), /X\.Y\.Z/u);
});

test('bumpPackageVersion updates npm and Alfred metadata together', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'anycode-version-'));
  t.after(() => fs.rm(root, {force: true, recursive: true}));
  await Promise.all([
    fs.writeFile(
      path.join(root, 'package.json'),
      `${JSON.stringify({name: 'alfred-anycode', version: '1.2.3'}, null, 2)}\n`,
    ),
    fs.writeFile(
      path.join(root, 'package-lock.json'),
      `${JSON.stringify({packages: {'': {version: '1.2.3'}}, version: '1.2.3'}, null, 2)}\n`,
    ),
    fs.writeFile(
      path.join(root, 'info.plist'),
      '<key>version</key><string>object</string>\n<key>version</key><string>1.2.3</string>',
    ),
  ]);

  const result = await bumpPackageVersion({release: 'minor', root});
  const packageJson = JSON.parse(await fs.readFile(path.join(root, 'package.json')));
  const packageLock = JSON.parse(await fs.readFile(path.join(root, 'package-lock.json')));
  const plist = await fs.readFile(path.join(root, 'info.plist'), 'utf8');

  assert.equal(result.version, '1.3.0');
  assert.equal(result.previousVersion, '1.2.3');
  assert.equal(packageJson.version, '1.3.0');
  assert.equal(packageLock.version, '1.3.0');
  assert.equal(packageLock.packages[''].version, '1.3.0');
  assert.match(plist, /<string>object<\/string>[\s\S]*<string>1\.3\.0<\/string>/u);
});
