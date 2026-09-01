#!/usr/bin/env node

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveAlfredPreferences} from '../src/install/workflow-link.js';
import {
  inspectWorkflowMode,
  switchToDevelopment,
  switchToProduction,
} from '../src/install/workflow-mode.js';
import {logger, paint} from './logger.js';

const requestedMode = process.argv[2];
if (!['dev', 'prod', 'status'].includes(requestedMode)) {
  throw new Error('Usage: node scripts/switch-workflow.js <dev|prod|status>');
}

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(await fs.readFile(path.join(packageRoot, 'package.json'), 'utf8'));
const homeDirectory = os.homedir();
const preferencesRoot = await resolveAlfredPreferences({
  fileSystem: fs,
  homeDirectory,
});
const backupRoot = path.join(
  homeDirectory,
  'Library',
  'Application Support',
  'AnyCode',
  'Workflow Release Backups',
);
const options = {
  backupRoot,
  fileSystem: fs,
  packageName: packageJson.name,
  packageRoot,
  preferencesRoot,
};

if (requestedMode === 'status') {
  const result = await inspectWorkflowMode(options);
  logger.info(`Mode: ${paint.mode(result.mode)}`);
} else if (requestedMode === 'dev') {
  const result = await switchToDevelopment(options);
  if (result.changed) {
    logger.success(`Using local source: ${paint.path(result.source)}`);
  } else {
    logger.info(`Already using local source: ${paint.path(result.source)}`);
  }
} else {
  const result = await switchToProduction(options);
  if (result.changed) {
    logger.success(`Release restored at ${paint.path(result.destination)}`);
  } else {
    logger.info(`Already using the release at ${paint.path(result.destination)}`);
  }
}
