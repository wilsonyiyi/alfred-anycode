#!/usr/bin/env node

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  assertUnprivilegedInstall,
  linkWorkflow,
  resolveAlfredPreferences,
} from '../src/install/workflow-link.js';

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

console.log(result.created
  ? `Linked Alfred workflow at ${result.destination}`
  : `Alfred workflow is already installed at ${result.destination}`);
