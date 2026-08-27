import path from 'node:path';

const DEFAULT_PREFERENCES_RELATIVE_PATH = path.join(
  'Library',
  'Application Support',
  'Alfred',
  'Alfred.alfredpreferences',
);
const PREFS_JSON_RELATIVE_PATH = path.join(
  'Library',
  'Application Support',
  'Alfred',
  'prefs.json',
);

function expandHome(value, homeDirectory) {
  if (value === '~') {
    return homeDirectory;
  }

  if (value.startsWith('~/')) {
    return path.join(homeDirectory, value.slice(2));
  }

  return value;
}

export function workflowLinkName(packageName) {
  const name = String(packageName ?? '').trim().replaceAll('/', '-');
  if (!name || name === '.' || name === '..' || name.includes(path.sep)) {
    throw new Error(`Invalid workflow package name: ${packageName}`);
  }

  return name;
}

export function assertUnprivilegedInstall({
  environment = process.env,
  userId = typeof process.getuid === 'function' ? process.getuid() : undefined,
} = {}) {
  if (userId === 0 || environment.SUDO_USER) {
    throw new Error(
      'Do not install Alfred workflows with sudo. Configure npm for user-level global packages and try again.',
    );
  }
}

export async function resolveAlfredPreferences({
  fileSystem,
  environment = process.env,
  homeDirectory,
}) {
  const configuredPath = environment.alfred_preferences || environment.ALFRED_PREFERENCES;
  if (configuredPath) {
    return path.resolve(expandHome(configuredPath, homeDirectory));
  }

  const prefsJsonPath = path.join(homeDirectory, PREFS_JSON_RELATIVE_PATH);
  try {
    const prefs = JSON.parse(await fileSystem.readFile(prefsJsonPath, 'utf8'));
    if (typeof prefs.current === 'string' && prefs.current.trim()) {
      return path.resolve(expandHome(prefs.current.trim(), homeDirectory));
    }
  } catch (error) {
    if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) {
      throw new Error(`Unable to read Alfred preferences at ${prefsJsonPath}`, {cause: error});
    }
  }

  return path.join(homeDirectory, DEFAULT_PREFERENCES_RELATIVE_PATH);
}

export async function linkWorkflow({
  fileSystem,
  packageName,
  packageRoot,
  preferencesRoot,
}) {
  const source = await fileSystem.realpath(packageRoot);
  const workflowsDirectory = path.join(preferencesRoot, 'workflows');
  const destination = path.join(workflowsDirectory, workflowLinkName(packageName));

  await fileSystem.mkdir(workflowsDirectory, {recursive: true});
  const resolvedWorkflowsDirectory = await fileSystem.realpath(workflowsDirectory);
  if (path.dirname(source) === resolvedWorkflowsDirectory) {
    return {
      alreadyInstalled: true,
      created: false,
      destination: source,
      source,
    };
  }

  try {
    const stats = await fileSystem.lstat(destination);
    if (!stats.isSymbolicLink()) {
      throw new Error(`Refusing to replace existing workflow at ${destination}`);
    }

    const currentTarget = path.resolve(path.dirname(destination), await fileSystem.readlink(destination));
    if (currentTarget !== source) {
      throw new Error(`Refusing to replace workflow link with a different target at ${destination}`);
    }

    return {created: false, destination, source};
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  await fileSystem.symlink(source, destination, 'dir');
  return {created: true, destination, source};
}

export async function unlinkWorkflow({
  fileSystem,
  packageName,
  packageRoot,
  preferencesRoot,
}) {
  const source = await fileSystem.realpath(packageRoot);
  const destination = path.join(
    preferencesRoot,
    'workflows',
    workflowLinkName(packageName),
  );

  try {
    const stats = await fileSystem.lstat(destination);
    if (!stats.isSymbolicLink()) {
      return {destination, removed: false, reason: 'not-a-symbolic-link'};
    }

    const currentTarget = path.resolve(path.dirname(destination), await fileSystem.readlink(destination));
    if (currentTarget !== source) {
      return {destination, removed: false, reason: 'different-target'};
    }

    await fileSystem.unlink(destination);
    return {destination, removed: true};
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {destination, removed: false, reason: 'missing'};
    }

    throw error;
  }
}
