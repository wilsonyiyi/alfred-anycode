export default {
  branches: ['main'],
  tagFormat: 'v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'node scripts/bump-version.js ${nextRelease.version} && npm run build:release',
        publishCmd: 'npm publish .release/package --access public',
      },
    ],
    [
      '@semantic-release/github',
      {
        failComment: false,
        successComment: false,
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json', 'info.plist'],
        message: 'chore(release): ${nextRelease.version} [skip ci]',
      },
    ],
  ],
};
