#!/usr/bin/env node

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildAlfredWorkflow} from '../src/release/alfred-workflow.js';
import {logger, paint} from './logger.js';

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseRoot = path.join(sourceRoot, '.release');
const {archivePath} = await buildAlfredWorkflow({releaseRoot});

logger.success(`Installable Alfred workflow created at ${paint.path(archivePath)}`);
