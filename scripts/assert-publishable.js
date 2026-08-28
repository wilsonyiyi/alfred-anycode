#!/usr/bin/env node

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertPublishablePackage} from '../src/release/release-package.js';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await assertPublishablePackage(packageRoot);
