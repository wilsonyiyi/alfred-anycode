#!/usr/bin/env node

import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const MANAGER_SCRIPT_FILTER_UID = 'A230553D-D083-45EE-AAFD-02C49F29CED6';
const EDITOR_SCRIPT_FILTER_UID = '46CF5385-7B12-47EC-A34B-D36168267B0A';
const ACTION_UID = '950A4362-3515-4A4C-B733-916A9DF9D41A';

const requiredFiles = [
  '46CF5385-7B12-47EC-A34B-D36168267B0A.png',
  'A230553D-D083-45EE-AAFD-02C49F29CED6.png',
  'assets/editor-icons/codex.png',
  'assets/editor-icons/cursor.png',
  'assets/editor-icons/vscode.png',
  'assets/editor-icons/webstorm.png',
  'assets/editor-icons/zed.png',
  'index.js',
  'info.plist',
  'scripts/config-server.js',
  'scripts/run-action.js',
  'scripts/run-node.sh',
  'scripts/install-workflow.js',
  'src/config/config-store.js',
  'src/config/editor-config.js',
  'src/config/keyword-sync.js',
  'src/config/workflow-config.js',
  'src/config-ui/page.js',
  'src/config-ui/server.js',
  'src/config-ui/translations.js',
  'src/ides/editor-icon.js',
  'src/ides/editor-registry.js',
  'src/install/workflow-link.js',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Required workflow file is missing: ${file}`);
  }
}

const plistResult = spawnSync('/usr/bin/plutil', ['-lint', 'info.plist'], {
  encoding: 'utf8',
});
if (plistResult.status !== 0) {
  throw new Error(plistResult.stderr || plistResult.stdout || 'Invalid info.plist');
}

const plistJsonResult = spawnSync(
  '/usr/bin/plutil',
  ['-convert', 'json', '-o', '-', 'info.plist'],
  {encoding: 'utf8'},
);
if (plistJsonResult.status !== 0) {
  throw new Error(plistJsonResult.stderr || 'Unable to inspect info.plist');
}
const workflow = JSON.parse(plistJsonResult.stdout);
const scriptFilters = workflow.objects.filter(object => (
  object.type === 'alfred.workflow.input.scriptfilter'
));
const managerFilter = scriptFilters.find(object => object.uid === MANAGER_SCRIPT_FILTER_UID);
const editorFilter = scriptFilters.find(object => object.uid === EDITOR_SCRIPT_FILTER_UID);
const connectsToAction = uid => workflow.connections?.[uid]?.some(connection => (
  connection.destinationuid === ACTION_UID
));

if (
  scriptFilters.length !== 2
  || managerFilter?.config.keyword !== 'anycode'
  || managerFilter?.config.argumenttype !== 1
  || managerFilter?.config.withspace !== false
  || !connectsToAction(MANAGER_SCRIPT_FILTER_UID)
) {
  throw new Error('info.plist must expose anycode as a standalone no-argument settings command.');
}

if (
  !editorFilter
  || editorFilter.config.argumenttype !== 0
  || editorFilter.config.withspace !== true
  || editorFilter.config.keyword.split('||').includes('anycode')
  || !connectsToAction(EDITOR_SCRIPT_FILTER_UID)
) {
  throw new Error('Editor keywords must use a separate argument-required Script Filter.');
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (packageJson.license !== 'GPL-3.0-or-later') {
  throw new Error('package.json must preserve the GPL-3.0-or-later license.');
}

if (packageJson.dependencies?.alfy) {
  throw new Error('The workflow must not reintroduce the vulnerable Alfy dependency tree.');
}

if (packageJson.dependencies?.['alfred-link']) {
  throw new Error('The workflow must use the dependency-free safe workflow linker.');
}

const plist = fs.readFileSync('info.plist', 'utf8');

if (plist.includes('default_ide') || plist.includes('editor_shortcuts')) {
  throw new Error('The workflow must not reintroduce a default IDE or shortcut model.');
}

if (!plist.includes('scripts/run-action.js')) {
  throw new Error('The workflow action must dispatch both project and configuration actions.');
}

if (!/<key>userconfigurationconfig<\/key>\s*<array\/>/u.test(plist)) {
  throw new Error('Dynamic settings must not be duplicated in Alfred native configuration fields.');
}

console.log('Workflow structure and info.plist are valid.');
