import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import {MANAGER_KEYWORD} from './editor-config.js';
import {parseEditorKeywords} from '../ides/editor-registry.js';

export const EDITOR_SCRIPT_FILTER_UID = '46CF5385-7B12-47EC-A34B-D36168267B0A';
const EDITOR_KEYWORD_FIELD_PATTERN = new RegExp(
  `(<key>keyword<\\/key>\\s*<string>)([^<]*)(<\\/string>(?:(?!<key>uid<\\/key>)[\\s\\S])*?<key>uid<\\/key>\\s*<string>${EDITOR_SCRIPT_FILTER_UID}<\\/string>)`,
  'u',
);

export function collectEditorKeywords(config) {
  const keywords = [];
  const seen = new Set([MANAGER_KEYWORD]);
  for (const editor of config.editors) {
    if (!String(editor.keywordExpression ?? '').trim()) {
      continue;
    }
    for (const keyword of parseEditorKeywords(editor.keywordExpression)) {
      if (seen.has(keyword)) {
        throw new Error(`Duplicate or reserved workflow keyword "${keyword}".`);
      }
      seen.add(keyword);
      keywords.push(keyword);
    }
  }
  return keywords;
}

export async function syncWorkflowKeywords({
  config,
  fileSystem = fs,
  plistPath,
}) {
  const expression = collectEditorKeywords(config).join('||');
  const plist = await fileSystem.readFile(plistPath, 'utf8');
  if (!EDITOR_KEYWORD_FIELD_PATTERN.test(plist)) {
    throw new Error(`Unable to locate the editor Script Filter in ${plistPath}`);
  }
  const updated = plist.replace(EDITOR_KEYWORD_FIELD_PATTERN, `$1${expression}$3`);
  if (updated === plist) {
    return {changed: false, expression};
  }

  const temporaryPath = `${plistPath}.${process.pid}.${crypto.randomUUID()}.tmp`;
  await fileSystem.writeFile(temporaryPath, updated, 'utf8');
  await fileSystem.rename(temporaryPath, plistPath);
  return {changed: true, expression};
}
