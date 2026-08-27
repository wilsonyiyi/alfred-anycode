import path from 'node:path';
import {spawn} from 'node:child_process';
import {executeProjectAction, parseActionArgument} from './project-action.js';

export function executeWorkflowAction(
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
    stdio: 'ignore',
  });
  child.unref();
  return {action: 'configure', scriptPath};
}
