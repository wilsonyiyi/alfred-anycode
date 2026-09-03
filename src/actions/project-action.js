import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {CURSOR_WINDOW_FLAGS} from '../config/editor-config.js';
import {validateApplicationName} from '../ides/editor-registry.js';

const SUPPORTED_ACTIONS = new Set(['open', 'reveal']);

export function parseActionArgument(rawArgument) {
  const value = String(rawArgument ?? '').trim();
  if (!value) {
    throw new Error('Project action is missing its path.');
  }

  const payload = JSON.parse(value);
  if (!payload || typeof payload !== 'object') {
    throw new TypeError('Action payload must be an object.');
  }

  return payload;
}

function resolvePayloadEditor(payload) {
  if (!payload.editor) {
    throw new Error('Project action is missing its IDE.');
  }

  const applicationName = validateApplicationName(payload.editor.applicationName);
  return {
    applicationName,
    id: String(payload.editor.id || 'custom'),
    label: String(payload.editor.label || applicationName),
    windowMode: payload.editor.windowMode,
  };
}

function resolveCursorCli(applicationName, exists, homeDirectory) {
  const bundleName = applicationName.endsWith('.app')
    ? applicationName
    : `${applicationName}.app`;
  return [
    path.join('/Applications', bundleName, 'Contents/Resources/app/bin/cursor'),
    path.join(homeDirectory, 'Applications', bundleName, 'Contents/Resources/app/bin/cursor'),
  ].find(candidate => exists(candidate));
}

export function buildOpenInvocation(
  editor,
  projectPath,
  {
    exists = fs.existsSync,
    homeDirectory = os.homedir(),
  } = {},
) {
  if (editor.applicationName !== 'Cursor' || !editor.windowMode || editor.windowMode === 'default') {
    return {
      command: '/usr/bin/open',
      arguments: ['-a', editor.applicationName, projectPath],
    };
  }

  const cli = resolveCursorCli(editor.applicationName, exists, homeDirectory);
  if (editor.windowMode === 'agents') {
    if (!cli) {
      throw new Error(
        "Cursor Agents Window requires Cursor's bundled CLI. Install Cursor in /Applications or ~/Applications.",
      );
    }

    return {
      command: cli,
      arguments: ['--glass', projectPath],
    };
  }

  const flag = CURSOR_WINDOW_FLAGS[editor.windowMode];
  if (!flag) {
    return {
      command: '/usr/bin/open',
      arguments: ['-a', editor.applicationName, projectPath],
    };
  }

  if (cli) {
    return {command: cli, arguments: [flag, projectPath]};
  }

  return {
    command: '/usr/bin/open',
    arguments: ['-a', editor.applicationName, projectPath, '--args', flag],
  };
}

function runOpenCommand(runner, invocation, action) {
  const result = runner(invocation.command, invocation.arguments, {encoding: 'utf8'});
  if (result.error || result.status !== 0) {
    const detail = result.error?.message || result.stderr?.trim() || 'Unknown open error';
    throw new Error(`Unable to ${action} project: ${detail}`);
  }
  return result;
}

export function executeProjectAction(
  rawArgument,
  {
    exists = fs.existsSync,
    homeDirectory = os.homedir(),
    runner = spawnSync,
  } = {},
) {
  const payload = parseActionArgument(rawArgument);
  const action = String(payload.action || 'open');
  if (!SUPPORTED_ACTIONS.has(action)) {
    throw new Error(`Unsupported project action "${action}".`);
  }

  const projectPath = path.resolve(String(payload.path ?? ''));
  if (!payload.path || !exists(projectPath)) {
    throw new Error(`Project path does not exist: ${projectPath}`);
  }

  const editor = action === 'open' ? resolvePayloadEditor(payload) : undefined;
  const invocation = action === 'reveal'
    ? {command: '/usr/bin/open', arguments: ['-R', projectPath]}
    : buildOpenInvocation(editor, projectPath, {
      exists,
      homeDirectory,
    });

  runOpenCommand(runner, invocation, action);

  return {action, arguments: invocation.arguments, command: invocation.command, editor, projectPath};
}
