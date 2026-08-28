import fs from 'node:fs/promises';
import path from 'node:path';

const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u;
const RELEASE_TYPES = new Set(['major', 'minor', 'patch']);

export function parseVersion(value) {
  const match = String(value).match(VERSION_PATTERN);
  if (!match) {
    throw new Error(`Version must use the X.Y.Z format: ${value}`);
  }
  return match.slice(1).map(Number);
}

export function resolveReleaseVersion(currentVersion, release) {
  const current = parseVersion(currentVersion);
  if (!RELEASE_TYPES.has(release)) {
    parseVersion(release);
    return release;
  }

  const [major, minor, patch] = current;
  if (release === 'major') {
    return `${major + 1}.0.0`;
  }
  if (release === 'minor') {
    return `${major}.${minor + 1}.0`;
  }
  return `${major}.${minor}.${patch + 1}`;
}

function updateWorkflowVersion(plist, version) {
  const pattern = /(<key>version<\/key>\s*<string>)([^<]*)(<\/string>)/gu;
  const matches = [...plist.matchAll(pattern)];
  const match = matches.at(-1);
  if (!match) {
    throw new Error('Unable to locate the workflow version in info.plist.');
  }

  const replacement = `${match[1]}${version}${match[3]}`;
  return `${plist.slice(0, match.index)}${replacement}${plist.slice(match.index + match[0].length)}`;
}

export async function bumpPackageVersion({
  fileSystem = fs,
  release,
  root,
}) {
  const packagePath = path.join(root, 'package.json');
  const lockPath = path.join(root, 'package-lock.json');
  const plistPath = path.join(root, 'info.plist');
  const [packageSource, lockSource, plistSource] = await Promise.all([
    fileSystem.readFile(packagePath, 'utf8'),
    fileSystem.readFile(lockPath, 'utf8'),
    fileSystem.readFile(plistPath, 'utf8'),
  ]);
  const packageJson = JSON.parse(packageSource);
  const packageLock = JSON.parse(lockSource);
  const previousVersion = packageJson.version;
  const version = resolveReleaseVersion(previousVersion, release);

  packageJson.version = version;
  packageLock.version = version;
  if (!packageLock.packages?.['']) {
    throw new Error('package-lock.json is missing the root package metadata.');
  }
  packageLock.packages[''].version = version;

  const nextPackageSource = `${JSON.stringify(packageJson, null, 2)}\n`;
  const nextLockSource = `${JSON.stringify(packageLock, null, 2)}\n`;
  const nextPlistSource = updateWorkflowVersion(plistSource, version);
  await Promise.all([
    fileSystem.writeFile(packagePath, nextPackageSource, 'utf8'),
    fileSystem.writeFile(lockPath, nextLockSource, 'utf8'),
    fileSystem.writeFile(plistPath, nextPlistSource, 'utf8'),
  ]);

  return {
    changed: packageSource !== nextPackageSource
      || lockSource !== nextLockSource
      || plistSource !== nextPlistSource,
    previousVersion,
    version,
  };
}
