import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('release workflow runs semantic-release automatically on main through OIDC', async () => {
  const [workflow, releaseConfig] = await Promise.all([
    fs.readFile('.github/workflows/release.yml', 'utf8'),
    fs.readFile('release.config.mjs', 'utf8'),
  ]);

  assert.match(workflow, /pull_request:/u);
  assert.match(workflow, /github\.event_name == 'push'/u);
  assert.match(workflow, /id-token: write/u);
  assert.match(workflow, /Initialize the published-version baseline/u);
  assert.match(workflow, /npm run release/u);
  assert.doesNotMatch(workflow, /NPM_TOKEN/u);
  assert.doesNotMatch(workflow, /workflow_dispatch:/u);

  assert.match(releaseConfig, /@semantic-release\/commit-analyzer/u);
  assert.match(releaseConfig, /node scripts\/bump-version\.js \$\{nextRelease\.version\}/u);
  assert.match(releaseConfig, /npm run build:release/u);
  assert.match(releaseConfig, /pkgRoot: '\.release\/package'/u);
  assert.match(releaseConfig, /@semantic-release\/git/u);
});
