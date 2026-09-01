#!/usr/bin/env node

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bumpPackageVersion} from '../src/release/version.js';
import {logger, paint} from './logger.js';

const release = process.argv[2];
if (!release) {
  throw new Error('Usage: npm run version:bump -- <patch|minor|major|X.Y.Z>');
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = await bumpPackageVersion({release, root});
logger.success(result.changed
  ? `Version updated to ${paint.version(result.version)}`
  : `Version is already ${paint.version(result.version)}`);
