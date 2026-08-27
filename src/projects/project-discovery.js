import path from 'node:path';
import fastGlob from 'fast-glob';

export function expandHomeDirectory(pattern, homeDirectory) {
  if (pattern === '~') {
    return homeDirectory;
  }

  if (pattern.startsWith('~/')) {
    return path.join(homeDirectory, pattern.slice(2));
  }

  return pattern;
}

export async function discoverProjects(
  patterns,
  {glob = fastGlob, homeDirectory} = {},
) {
  if (!homeDirectory) {
    throw new Error('Home directory is unavailable.');
  }

  const expandedPatterns = patterns.map(pattern =>
    expandHomeDirectory(pattern, homeDirectory),
  );

  const directories = await glob(expandedPatterns, {
    absolute: true,
    dot: false,
    followSymbolicLinks: true,
    ignore: ['**/.git/**', '**/node_modules/**'],
    onlyDirectories: true,
    suppressErrors: true,
    unique: true,
  });

  const projectsByPath = new Map();
  for (const directory of directories) {
    const absolutePath = path.resolve(directory);
    projectsByPath.set(absolutePath, {
      absolutePath,
      name: path.basename(absolutePath),
    });
  }

  return [...projectsByPath.values()].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, {sensitivity: 'base'}),
  );
}
