import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  assertPublishablePackage,
  createProductionPlist,
  DEVELOPMENT_WORKFLOW_BUNDLE_ID,
  PRODUCTION_WORKFLOW_BUNDLE_ID,
  readWorkflowBundleId,
} from '../src/release/release-package.js';

const PACKAGE_JSON = Object.freeze({
  description: 'Search and open any project in any IDE.',
  version: '9.8.7',
});

function workflowPlist(bundleId = DEVELOPMENT_WORKFLOW_BUNDLE_ID) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
<key>bundleid</key><string>${bundleId}</string>
<key>description</key><string>Old description v1.2.3</string>
<key>disabled</key><true/>
<key>version</key><string>object-version</string>
<key>version</key><string>1.2.3</string>
</dict></plist>`;
}

test('createProductionPlist normalizes release-only workflow metadata', () => {
  const result = createProductionPlist(workflowPlist(), PACKAGE_JSON);

  assert.equal(readWorkflowBundleId(result), PRODUCTION_WORKFLOW_BUNDLE_ID);
  assert.match(result, /<key>description<\/key><string>Search and open any project in any IDE\.<\/string>/u);
  assert.match(result, /<key>disabled<\/key><false\/>/u);
  assert.match(result, /<key>version<\/key><string>object-version<\/string>/u);
  assert.match(result, /<key>version<\/key><string>9\.8\.7<\/string>/u);
  assert.doesNotMatch(result, /v1\.2\.3/u);
});

test('assertPublishablePackage rejects the development Bundle ID', async t => {
  const packageRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'anycode-dev-'));
  t.after(() => fs.rm(packageRoot, {force: true, recursive: true}));
  await fs.writeFile(path.join(packageRoot, 'info.plist'), workflowPlist(), 'utf8');

  await assert.rejects(
    assertPublishablePackage(packageRoot),
    /Run npm run build:release/u,
  );
});

test('assertPublishablePackage accepts the production Bundle ID', async t => {
  const packageRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'anycode-prod-'));
  t.after(() => fs.rm(packageRoot, {force: true, recursive: true}));
  await fs.writeFile(
    path.join(packageRoot, 'info.plist'),
    workflowPlist(PRODUCTION_WORKFLOW_BUNDLE_ID),
    'utf8',
  );

  assert.equal(
    await assertPublishablePackage(packageRoot),
    PRODUCTION_WORKFLOW_BUNDLE_ID,
  );
});
