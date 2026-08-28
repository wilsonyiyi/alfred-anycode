import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

export const WORKFLOW_ARCHIVE_NAME = 'Alfred-AnyCode.alfredworkflow';

export function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', code => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

export async function buildAlfredWorkflow({
  commandRunner = runCommand,
  fileSystem = fs,
  releaseRoot,
}) {
  const packageRoot = path.join(releaseRoot, 'package');
  const archivePath = path.join(releaseRoot, WORKFLOW_ARCHIVE_NAME);

  await fileSystem.access(path.join(packageRoot, 'info.plist'));
  await fileSystem.rm(archivePath, {force: true});
  await commandRunner(
    'npm',
    ['ci', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund'],
    {cwd: packageRoot},
  );
  await commandRunner(
    'zip',
    ['-q', '-r', archivePath, '.', '-x', '*.DS_Store'],
    {cwd: packageRoot},
  );

  const archive = await fileSystem.stat(archivePath);
  if (!archive.isFile() || archive.size === 0) {
    throw new Error('The Alfred workflow archive was not created.');
  }

  return {archivePath, packageRoot};
}
