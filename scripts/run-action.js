#!/usr/bin/env node

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {executeWorkflowAction} from '../src/actions/workflow-action.js';

const workflowRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

try {
  await executeWorkflowAction(process.argv[2], {workflowRoot});
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
