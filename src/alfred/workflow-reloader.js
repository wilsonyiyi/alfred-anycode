import {execFile as execFileCallback} from 'node:child_process';
import {promisify} from 'node:util';

const execFile = promisify(execFileCallback);

export const DEFAULT_WORKFLOW_BUNDLE_ID = 'com.wilsonyiyi.alfred-anycode';
const ALFRED_APPLICATION_ID = 'com.runningwithcrayons.Alfred';

export function createWorkflowReloadScript(bundleId) {
  const normalizedBundleId = String(bundleId ?? '').trim();
  if (!normalizedBundleId) {
    throw new Error('An Alfred workflow bundle ID is required to reload the workflow.');
  }

  return `Application(${JSON.stringify(ALFRED_APPLICATION_ID)}).reloadWorkflow(${JSON.stringify(normalizedBundleId)});`;
}

export async function reloadAlfredWorkflow({
  bundleId = DEFAULT_WORKFLOW_BUNDLE_ID,
  execute = execFile,
} = {}) {
  const script = createWorkflowReloadScript(bundleId);
  await execute('/usr/bin/osascript', ['-l', 'JavaScript', '-e', script], {
    encoding: 'utf8',
  });
}
