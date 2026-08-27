import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
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
  };
}

export function executeProjectAction(
  rawArgument,
  {exists = fs.existsSync, runner = spawnSync} = {},
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
  const arguments_ = action === 'reveal'
    ? ['-R', projectPath]
    : ['-a', editor.applicationName, projectPath];
  const result = runner('/usr/bin/open', arguments_, {encoding: 'utf8'});

  if (result.error || result.status !== 0) {
    const detail = result.error?.message || result.stderr?.trim() || 'Unknown open error';
    throw new Error(`Unable to ${action} project: ${detail}`);
  }

  return {action, arguments: arguments_, editor, projectPath};
}
