#!/usr/bin/env node

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bumpPackageVersion} from '../src/release/version.js';

const release = process.argv[2];
if (!release) {
  throw new Error('Usage: npm run version:bump -- <patch|minor|major|X.Y.Z>');
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = await bumpPackageVersion({release, root});
console.log(`version=${result.version}`);
console.log(`changed=${result.changed}`);
