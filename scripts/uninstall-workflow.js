#!/usr/bin/env node

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveAlfredPreferences, unlinkWorkflow} from '../src/install/workflow-link.js';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(await fs.readFile(path.join(packageRoot, 'package.json'), 'utf8'));
const preferencesRoot = await resolveAlfredPreferences({
  fileSystem: fs,
  homeDirectory: os.homedir(),
});
const result = await unlinkWorkflow({
  fileSystem: fs,
  packageName: packageJson.name,
  packageRoot,
  preferencesRoot,
});

console.log(result.removed
  ? `Unlinked Alfred workflow at ${result.destination}`
  : `No matching Alfred workflow link was removed (${result.reason}).`);
