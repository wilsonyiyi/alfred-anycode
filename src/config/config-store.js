import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  createDefaultEditorConfig,
  normalizeEditorConfig,
} from './editor-config.js';

const CONFIG_FILE_NAME = 'config.json';

export function resolveWorkflowDataDirectory(environment = process.env) {
  return environment.alfred_workflow_data
    || environment.ANYCODE_DATA_DIR
    || path.join(
      os.homedir(),
      'Library',
      'Application Support',
      'Alfred',
      'Workflow Data',
      'com.wilsonyiyi.alfred-anycode',
    );
}

export function createConfigStore({
  dataDirectory,
  environment = process.env,
  fileSystem = fs,
}) {
  const configPath = path.join(dataDirectory, CONFIG_FILE_NAME);

  return {
    configPath,
    dataDirectory,
    async load() {
      try {
        const value = JSON.parse(await fileSystem.readFile(configPath, 'utf8'));
        return normalizeEditorConfig(value);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw new Error(`Unable to read AnyCode configuration at ${configPath}`, {cause: error});
        }
        return createDefaultEditorConfig(environment);
      }
    },
    async save(value) {
      const normalized = normalizeEditorConfig(value);
      await fileSystem.mkdir(dataDirectory, {recursive: true});
      const temporaryPath = `${configPath}.${process.pid}.${crypto.randomUUID()}.tmp`;
      await fileSystem.writeFile(
        temporaryPath,
        `${JSON.stringify(normalized, null, 2)}\n`,
        'utf8',
      );
      await fileSystem.rename(temporaryPath, configPath);
      return normalized;
    },
  };
}
