#!/usr/bin/env node

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildReleasePackage} from '../src/release/release-package.js';
import {logger, paint} from './logger.js';

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destinationRoot = path.join(sourceRoot, '.release', 'package');

await buildReleasePackage({destinationRoot, sourceRoot});
logger.success(`Release package created at ${paint.path(destinationRoot)}`);
