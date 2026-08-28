import crypto from 'node:crypto';
import {createEditorRegistry, parseEditorKeyword} from '../ides/editor-registry.js';

export const CONFIG_VERSION = 2;
export const MANAGER_KEYWORD = 'anycode';
export const DEFAULT_PROJECT_PATTERNS = Object.freeze([
  '~/Developer/*',
  '~/Projects/*',
  '~/Code/*',
]);

export const EDITOR_TYPES = Object.freeze({
  cursor: Object.freeze({applicationName: 'Cursor', defaultKeyword: 'cursor', label: 'Cursor'}),
  vscode: Object.freeze({applicationName: 'Visual Studio Code', defaultKeyword: 'code', label: 'Visual Studio Code'}),
  zed: Object.freeze({applicationName: 'Zed', defaultKeyword: 'zed', label: 'Zed'}),
  webstorm: Object.freeze({applicationName: 'WebStorm', defaultKeyword: 'ws', label: 'WebStorm'}),
  codex: Object.freeze({applicationName: 'Codex', defaultKeyword: 'codex', label: 'Codex'}),
  custom: Object.freeze({applicationName: '', defaultKeyword: '', label: 'Custom application'}),
});

export const DEFAULT_EDITOR_TYPES = Object.freeze(['vscode', 'cursor']);
const PRESET_EDITOR_ORDER = Object.freeze(['vscode', 'cursor', 'zed', 'webstorm', 'codex']);

function readConfigString(environment, key, fallback = '') {
  if (Object.hasOwn(environment, key) && typeof environment[key] === 'string') {
    return environment[key].trim();
  }
  return fallback;
}

export function parseProjectPatterns(value) {
  const values = Array.isArray(value)
    ? value
    : String(value ?? '').split(/[;,\n]/u);
  const patterns = [...new Set(values.map(pattern => String(pattern).trim()).filter(Boolean))];
  return patterns.length > 0 ? patterns : [...DEFAULT_PROJECT_PATTERNS];
}

function firstKeyword(value) {
  return String(value ?? '').split('||', 1)[0].trim();
}

function normalizeEditor(editor, {migrateAliases = false} = {}) {
  const type = Object.hasOwn(EDITOR_TYPES, editor.type) ? editor.type : 'custom';
  const preset = EDITOR_TYPES[type];
  const applicationName = type === 'custom'
    ? String(editor.applicationName ?? '').trim()
    : preset.applicationName;
  const keywordExpression = migrateAliases
    ? firstKeyword(editor.keywordExpression)
    : String(editor.keywordExpression ?? '').trim();

  if (!applicationName) {
    throw new Error('Custom editor application name is required.');
  }
  parseEditorKeyword(keywordExpression);

  return {
    applicationName,
    iconPath: String(editor.iconPath ?? '').trim(),
    id: String(editor.id ?? '').trim() || crypto.randomUUID(),
    keywordExpression,
    type,
  };
}

export function normalizeEditorConfig(value) {
  const migrateAliases = Number(value?.version ?? CONFIG_VERSION) < CONFIG_VERSION;
  const editors = Array.isArray(value?.editors)
    ? value.editors.map(editor => normalizeEditor(editor, {migrateAliases}))
    : [];
  const ids = new Set();
  for (const editor of editors) {
    if (ids.has(editor.id)) {
      throw new Error(`Duplicate editor id "${editor.id}".`);
    }
    ids.add(editor.id);
  }

  const registry = createEditorRegistry(editors, {allowEmpty: true});
  for (const editor of registry.editors) {
    if (editor.keyword === MANAGER_KEYWORD) {
      throw new Error(`The keyword "${MANAGER_KEYWORD}" is reserved for configuration.`);
    }
  }

  return {
    editors,
    projectPatterns: parseProjectPatterns(value?.projectPatterns),
    version: CONFIG_VERSION,
  };
}

export function createDefaultEditorConfig(environment = process.env) {
  const editors = PRESET_EDITOR_ORDER
    .filter(type => (
      DEFAULT_EDITOR_TYPES.includes(type)
      || Object.hasOwn(environment, `${type}_keyword`)
    ))
    .map(type => {
      const preset = EDITOR_TYPES[type];
      return {
        applicationName: preset.applicationName,
        iconPath: '',
        id: type,
        keywordExpression: firstKeyword(readConfigString(
          environment,
          `${type}_keyword`,
          preset.defaultKeyword,
        )),
        type,
      };
    })
    .filter(editor => editor.keywordExpression);

  const customApplication = readConfigString(environment, 'custom_editor_application');
  const customKeyword = firstKeyword(readConfigString(environment, 'custom_editor_keyword'));
  if (customApplication && customKeyword) {
    editors.push({
      applicationName: customApplication,
      iconPath: readConfigString(environment, 'custom_editor_icon'),
      id: 'custom-migrated',
      keywordExpression: customKeyword,
      type: 'custom',
    });
  }

  return normalizeEditorConfig({
    editors,
    projectPatterns: readConfigString(environment, 'projects'),
  });
}

export function editorDefinitions(config) {
  return config.editors.map(editor => ({
    applicationName: editor.applicationName,
    iconPath: editor.iconPath,
    id: editor.id,
    keywordExpression: editor.keywordExpression,
  }));
}
