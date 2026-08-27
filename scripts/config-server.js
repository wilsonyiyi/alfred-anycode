#!/usr/bin/env node

import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolveWorkflowDataDirectory} from '../src/config/config-store.js';
import {startConfigServer} from '../src/config-ui/server.js';

const workflowRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const session = await startConfigServer({
  dataDirectory: resolveWorkflowDataDirectory(process.env),
  environment: process.env,
  workflowRoot,
});
const result = spawnSync('/usr/bin/open', [session.url], {encoding: 'utf8'});
if (result.error || result.status !== 0) {
  session.server.close();
  throw result.error || new Error(result.stderr || 'Unable to open AnyCode settings.');
}
