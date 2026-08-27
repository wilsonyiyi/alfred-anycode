import fs from 'node:fs';
import path from 'node:path';

function expandHome(value, homeDirectory) {
  if (value === '~') {
    return homeDirectory;
  }

  return value.startsWith('~/')
    ? path.join(homeDirectory, value.slice(2))
    : value;
}

function iconForPath(iconPath) {
  return path.extname(iconPath).toLocaleLowerCase() === '.app'
    ? {path: iconPath, type: 'fileicon'}
    : {path: iconPath};
}

export function resolveEditorIcon(
  editor,
  {exists = fs.existsSync, homeDirectory},
) {
  if (editor.iconPath) {
    const configuredIcon = path.resolve(expandHome(editor.iconPath, homeDirectory));
    if (exists(configuredIcon)) {
      return iconForPath(configuredIcon);
    }
  }

  const applicationBundleName = editor.applicationName.endsWith('.app')
    ? editor.applicationName
    : `${editor.applicationName}.app`;
  const candidates = [
    path.join('/Applications', applicationBundleName),
    path.join(homeDirectory, 'Applications', applicationBundleName),
    path.join('/System/Applications', applicationBundleName),
  ];
  const applicationPath = candidates.find(candidate => exists(candidate));

  return applicationPath
    ? {path: applicationPath, type: 'fileicon'}
    : undefined;
}
