#!/usr/bin/env node

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildAlfredWorkflow} from '../src/release/alfred-workflow.js';

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseRoot = path.join(sourceRoot, '.release');
const {archivePath} = await buildAlfredWorkflow({releaseRoot});

console.log(`Installable Alfred workflow created at ${archivePath}`);
