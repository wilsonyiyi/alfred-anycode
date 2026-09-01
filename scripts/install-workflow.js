#!/usr/bin/env node

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  assertUnprivilegedInstall,
  isGlobalNpmInstall,
  linkWorkflow,
  resolveAlfredPreferences,
} from '../src/install/workflow-link.js';
import {logger, paint} from './logger.js';

if (!isGlobalNpmInstall()) {
  logger.info(`Installed local dependencies. Run ${paint.command('npm run dev')} to use this source in Alfred.`);
} else {
  assertUnprivilegedInstall();
  const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const packageJson = JSON.parse(await fs.readFile(path.join(packageRoot, 'package.json'), 'utf8'));
  const preferencesRoot = await resolveAlfredPreferences({
    fileSystem: fs,
    homeDirectory: os.homedir(),
  });
  const result = await linkWorkflow({
    fileSystem: fs,
    packageName: packageJson.name,
    packageRoot,
    preferencesRoot,
  });

  if (result.created) {
    logger.success(`Linked Alfred workflow at ${paint.path(result.destination)}`);
  } else {
    logger.info(`Alfred workflow is already installed at ${paint.path(result.destination)}`);
  }
}
