import path from 'node:path';
import {spawn} from 'node:child_process';
import {executeProjectAction, parseActionArgument} from './project-action.js';

const CONFIG_SERVER_READY_TIMEOUT_MS = 15_000;

function waitForConfigServer(child, timeoutMs = CONFIG_SERVER_READY_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timeout);
      child.off('error', handleError);
      child.off('exit', handleExit);
      child.off('message', handleMessage);
    };
    const handleError = error => {
      cleanup();
      reject(error);
    };
    const handleExit = code => {
      cleanup();
      reject(new Error(`AnyCode settings service exited before opening the page (code ${code}).`));
    };
    const handleMessage = message => {
      if (message?.type !== 'anycode:config-ready') {
        return;
      }
      cleanup();
      child.unref();
      resolve();
    };
    const timeout = setTimeout(() => {
      cleanup();
      child.kill();
      reject(new Error('Timed out while opening AnyCode settings.'));
    }, timeoutMs);

    child.once('error', handleError);
    child.once('exit', handleExit);
    child.on('message', handleMessage);
  });
}

export async function executeWorkflowAction(
  rawArgument,
  {
    environment = process.env,
    projectAction = executeProjectAction,
    runner = spawn,
    workflowRoot = process.cwd(),
  } = {},
) {
  const payload = parseActionArgument(rawArgument);
  if (payload.action !== 'configure') {
    return projectAction(rawArgument);
  }

  const scriptPath = path.join(workflowRoot, 'scripts', 'config-server.js');
  const child = runner(process.execPath, [scriptPath], {
    cwd: workflowRoot,
    detached: true,
    env: environment,
    stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
  });
  await waitForConfigServer(child);
  return {action: 'configure', scriptPath};
}
