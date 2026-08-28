import fs from 'node:fs/promises';
import path from 'node:path';
import {createDefaultEditorConfig} from '../config/editor-config.js';
import {syncWorkflowKeywords} from '../config/keyword-sync.js';

export const DEVELOPMENT_WORKFLOW_BUNDLE_ID = 'com.wilsonyiyi.alfred-anycode.dev';
export const PRODUCTION_WORKFLOW_BUNDLE_ID = 'com.wilsonyiyi.alfred-anycode';

const XML_ENTITIES = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
});

function escapeXml(value) {
  return String(value).replace(/[&<>"']/gu, character => XML_ENTITIES[character]);
}

function replaceRequired(value, pattern, replacement, label) {
  if (!pattern.test(value)) {
    throw new Error(`Unable to locate ${label} in info.plist.`);
  }
  return value.replace(pattern, replacement);
}

function replaceLastStringValue(value, key, nextValue) {
  const pattern = new RegExp(`(<key>${key}<\\/key>\\s*<string>)([^<]*)(<\\/string>)`, 'gu');
  const matches = [...value.matchAll(pattern)];
  const match = matches.at(-1);
  if (!match) {
    throw new Error(`Unable to locate ${key} in info.plist.`);
  }

  const start = match.index;
  const replacement = `${match[1]}${escapeXml(nextValue)}${match[3]}`;
  return `${value.slice(0, start)}${replacement}${value.slice(start + match[0].length)}`;
}

export function readWorkflowBundleId(plist) {
  return plist.match(/<key>bundleid<\/key>\s*<string>([^<]+)<\/string>/u)?.[1] ?? '';
}

export function createProductionPlist(plist, packageJson) {
  let result = replaceRequired(
    plist,
    /(<key>bundleid<\/key>\s*<string>)([^<]*)(<\/string>)/u,
    `$1${PRODUCTION_WORKFLOW_BUNDLE_ID}$3`,
    'bundleid',
  );
  result = replaceRequired(
    result,
    /(<key>description<\/key>\s*<string>)([^<]*)(<\/string>)/u,
    `$1${escapeXml(packageJson.description)}$3`,
    'description',
  );
  result = replaceRequired(
    result,
    /(<key>disabled<\/key>\s*)<(?:true|false)\/>/u,
    '$1<false/>',
    'disabled state',
  );
  return replaceLastStringValue(result, 'version', packageJson.version);
}

export async function assertPublishablePackage(packageRoot, fileSystem = fs) {
  const plist = await fileSystem.readFile(path.join(packageRoot, 'info.plist'), 'utf8');
  const bundleId = readWorkflowBundleId(plist);
  if (bundleId !== PRODUCTION_WORKFLOW_BUNDLE_ID) {
    throw new Error(
      `Refusing to publish workflow bundle ${bundleId || '(missing)'}. `
      + 'Run npm run build:release and publish .release/package instead.',
    );
  }
  return bundleId;
}

export async function buildReleasePackage({
  destinationRoot,
  fileSystem = fs,
  sourceRoot,
}) {
  const packageJson = JSON.parse(
    await fileSystem.readFile(path.join(sourceRoot, 'package.json'), 'utf8'),
  );
  const entries = ['package.json', 'package-lock.json', ...packageJson.files];

  await fileSystem.rm(destinationRoot, {force: true, recursive: true});
  await fileSystem.mkdir(destinationRoot, {recursive: true});
  for (const entry of entries) {
    const source = path.join(sourceRoot, entry);
    const destination = path.join(destinationRoot, entry);
    try {
      await fileSystem.cp(source, destination, {recursive: true});
    } catch (error) {
      if (entry === 'package-lock.json' && error?.code === 'ENOENT') {
        continue;
      }
      throw error;
    }
  }

  const plistPath = path.join(destinationRoot, 'info.plist');
  const plist = await fileSystem.readFile(plistPath, 'utf8');
  await fileSystem.writeFile(plistPath, createProductionPlist(plist, packageJson), 'utf8');
  await syncWorkflowKeywords({
    config: createDefaultEditorConfig({}),
    fileSystem,
    plistPath,
  });

  return {destinationRoot, packageJson};
}
