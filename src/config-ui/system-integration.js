import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {EDITOR_TYPES} from '../config/editor-config.js';

const execFileAsync = promisify(execFile);
const PROJECT_DIRECTORY_NAMES = Object.freeze(['Developer', 'Projects', 'Code', 'Workspace']);
const APPLICATION_ICON_SCRIPT = String.raw`
ObjC.import('AppKit');
function run(argv) {
  const image = $.NSWorkspace.sharedWorkspace.iconForFile($(argv[0]));
  const bitmap = $.NSBitmapImageRep.imageRepWithData(image.TIFFRepresentation);
  const png = bitmap.representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $({}));
  if (!png.writeToFileAtomically($(argv[1]), true)) throw new Error('Unable to write application icon.');
}
`;

async function pathExists(target, fileSystem = fs) {
  try {
    await fileSystem.access(target);
    return true;
  } catch {
    return false;
  }
}

function applicationCandidates(applicationName, homeDirectory) {
  const bundleName = applicationName.endsWith('.app') ? applicationName : `${applicationName}.app`;
  return [
    path.join('/Applications', bundleName),
    path.join(homeDirectory, 'Applications', bundleName),
  ];
}

async function spotlightApplicationNames(runner = execFileAsync) {
  try {
    const {stdout} = await runner('/usr/bin/mdfind', [
      'kMDItemContentType == "com.apple.application-bundle"',
    ], {encoding: 'utf8'});
    return new Set(String(stdout ?? '')
      .split('\n')
      .map(applicationPath => path.basename(applicationPath.trim()).replace(/\.app$/iu, '').toLocaleLowerCase())
      .filter(Boolean));
  } catch {
    return new Set();
  }
}

export async function detectLocalEnvironment({
  fileSystem = fs,
  homeDirectory = os.homedir(),
  runner = execFileAsync,
} = {}) {
  const indexedApplicationNames = await spotlightApplicationNames(runner);
  const installedEditorTypes = [];
  for (const [type, preset] of Object.entries(EDITOR_TYPES)) {
    if (type === 'custom') continue;
    const candidates = applicationCandidates(preset.applicationName, homeDirectory);
    const existsAtKnownLocation = (
      await Promise.all(candidates.map(candidate => pathExists(candidate, fileSystem)))
    ).some(Boolean);
    if (
      existsAtKnownLocation
      || indexedApplicationNames.has(preset.applicationName.toLocaleLowerCase())
    ) {
      installedEditorTypes.push(type);
    }
  }

  const existingProjectPatterns = [];
  for (const name of PROJECT_DIRECTORY_NAMES) {
    if (await pathExists(path.join(homeDirectory, name), fileSystem)) {
      existingProjectPatterns.push(`~/${name}/*`);
    }
  }

  return {existingProjectPatterns, installedEditorTypes};
}

function normalizeSelection(stdout) {
  return String(stdout ?? '').trim().replace(/\/$/u, '');
}

function selectionError(error, label) {
  if (error?.code === 1 && /User canceled/u.test(error.stderr || '')) {
    const canceled = new Error(`${label} selection was canceled.`);
    canceled.code = 'SELECTION_CANCELED';
    return canceled;
  }
  return error;
}

export async function chooseMacOSDirectory({runner = execFileAsync} = {}) {
  try {
    const {stdout} = await runner('/usr/bin/osascript', [
      '-e',
      'POSIX path of (choose folder with prompt "Choose a project directory for AnyCode")',
    ], {encoding: 'utf8'});
    return normalizeSelection(stdout);
  } catch (error) {
    throw selectionError(error, 'Directory');
  }
}

export async function readMacOSApplicationIcon(applicationPath, {
  fileSystem = fs,
  runner = execFileAsync,
  temporaryRoot = os.tmpdir(),
} = {}) {
  const temporaryDirectory = await fileSystem.mkdtemp(path.join(temporaryRoot, 'anycode-app-icon-'));
  const sourcePath = path.join(temporaryDirectory, 'application-icon.png');
  const resizedPath = path.join(temporaryDirectory, 'application-icon-128.png');
  try {
    await runner('/usr/bin/osascript', [
      '-l',
      'JavaScript',
      '-e',
      APPLICATION_ICON_SCRIPT,
      applicationPath,
      sourcePath,
    ], {encoding: 'utf8'});
    await runner('/usr/bin/sips', [
      '-Z',
      '128',
      sourcePath,
      '--out',
      resizedPath,
    ], {encoding: 'utf8'});
    const bytes = await fileSystem.readFile(resizedPath);
    return `data:image/png;base64,${bytes.toString('base64')}`;
  } finally {
    await fileSystem.rm(temporaryDirectory, {force: true, recursive: true}).catch(() => {});
  }
}

export async function chooseMacOSApplication({
  iconReader = readMacOSApplicationIcon,
  runner = execFileAsync,
} = {}) {
  try {
    const {stdout} = await runner('/usr/bin/osascript', [
      '-e',
      'POSIX path of (choose file with prompt "Choose an editor for AnyCode" of type {"com.apple.application-bundle"} default location (path to applications folder))',
    ], {encoding: 'utf8'});
    const applicationPath = normalizeSelection(stdout);
    let iconDataUrl = '';
    try {
      iconDataUrl = await iconReader(applicationPath, {runner});
    } catch {
      // The selected application remains usable when macOS cannot render its icon.
    }
    return {
      applicationName: path.basename(applicationPath).replace(/\.app$/iu, ''),
      applicationPath,
      iconDataUrl,
    };
  } catch (error) {
    throw selectionError(error, 'Application');
  }
}

export function projectPatternForDirectory(directory, homeDirectory = os.homedir()) {
  const relative = path.relative(homeDirectory, directory);
  const displayDirectory = relative && !relative.startsWith('..') && !path.isAbsolute(relative)
    ? `~/${relative}`
    : directory;
  return `${displayDirectory.replace(/\/$/u, '')}/*`;
}
