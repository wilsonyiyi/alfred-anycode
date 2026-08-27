import os from 'node:os';
import {createConfigStore, resolveWorkflowDataDirectory} from './config-store.js';
import {editorDefinitions} from './editor-config.js';

export async function readWorkflowConfig(environment = process.env) {
  const store = createConfigStore({
    dataDirectory: resolveWorkflowDataDirectory(environment),
    environment,
  });
  const value = await store.load();

  return {
    cacheTtlMs: 5 * 60 * 1000,
    editorDefinitions: editorDefinitions(value),
    homeDirectory: environment.HOME || os.homedir(),
    projectPatterns: value.projectPatterns,
  };
}
