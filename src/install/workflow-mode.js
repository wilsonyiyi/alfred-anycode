import path from 'node:path';
import {
  linkWorkflow,
  unlinkWorkflow,
  workflowLinkName,
} from './workflow-link.js';

async function lstatIfPresent(fileSystem, target) {
  try {
    return await fileSystem.lstat(target);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return undefined;
    }

    throw error;
  }
}

function assertReleaseBackup(stats, releaseBackup) {
  if (stats && (!stats.isDirectory() || stats.isSymbolicLink())) {
    throw new Error(`Release backup is not a directory: ${releaseBackup}`);
  }
}

export function workflowModePaths({
  backupRoot,
  packageName,
  preferencesRoot,
}) {
  const linkName = workflowLinkName(packageName);
  return {
    destination: path.join(preferencesRoot, 'workflows', linkName),
    releaseBackup: path.join(backupRoot, linkName),
  };
}

export async function inspectWorkflowMode({
  backupRoot,
  fileSystem,
  packageName,
  packageRoot,
  preferencesRoot,
}) {
  const source = await fileSystem.realpath(packageRoot);
  const {destination, releaseBackup} = workflowModePaths({
    backupRoot,
    packageName,
    preferencesRoot,
  });
  const [destinationStats, backupStats] = await Promise.all([
    lstatIfPresent(fileSystem, destination),
    lstatIfPresent(fileSystem, releaseBackup),
  ]);

  assertReleaseBackup(backupStats, releaseBackup);

  if (!destinationStats) {
    return {
      destination,
      mode: backupStats ? 'development-interrupted' : 'missing',
      releaseBackup,
      source,
    };
  }

  if (destinationStats.isSymbolicLink()) {
    const currentTarget = await fileSystem.realpath(destination);
    return {
      currentTarget,
      destination,
      mode: currentTarget === source ? 'development' : 'foreign-link',
      releaseBackup,
      releasePreserved: Boolean(backupStats),
      source,
    };
  }

  if (!destinationStats.isDirectory()) {
    return {destination, mode: 'invalid', releaseBackup, source};
  }

  return {
    destination,
    mode: backupStats ? 'conflict' : 'production',
    releaseBackup,
    source,
  };
}

function invalidModeError(state) {
  if (state.mode === 'foreign-link') {
    return new Error(`Refusing to replace workflow link to ${state.currentTarget}`);
  }

  if (state.mode === 'conflict') {
    return new Error(
      `Both an installed workflow and release backup exist. Resolve them manually:\n${state.destination}\n${state.releaseBackup}`,
    );
  }

  if (state.mode === 'invalid') {
    return new Error(`Workflow destination is not a directory: ${state.destination}`);
  }

  return new Error(`Cannot switch workflow from mode: ${state.mode}`);
}

export async function switchToDevelopment(options) {
  const state = await inspectWorkflowMode(options);

  if (state.mode === 'development') {
    if (!state.releasePreserved) {
      throw new Error(`No preserved release exists at ${state.releaseBackup}`);
    }

    return {...state, changed: false};
  }

  if (state.mode === 'missing') {
    throw new Error(`No installed release exists at ${state.destination}`);
  }

  if (!['production', 'development-interrupted'].includes(state.mode)) {
    throw invalidModeError(state);
  }

  if (state.mode === 'production') {
    await options.fileSystem.mkdir(path.dirname(state.releaseBackup), {recursive: true});
    await options.fileSystem.rename(state.destination, state.releaseBackup);
  }

  try {
    await linkWorkflow(options);
  } catch (error) {
    if (state.mode === 'production') {
      await options.fileSystem.rename(state.releaseBackup, state.destination);
    }
    throw error;
  }

  return {
    ...state,
    changed: true,
    mode: 'development',
    releasePreserved: true,
  };
}

export async function switchToProduction(options) {
  const state = await inspectWorkflowMode(options);

  if (state.mode === 'production') {
    return {...state, changed: false};
  }

  if (state.mode === 'missing') {
    throw new Error(`No installed release or backup was found for ${state.destination}`);
  }

  if (!['development', 'development-interrupted'].includes(state.mode)) {
    throw invalidModeError(state);
  }

  if (!state.releasePreserved && state.mode === 'development') {
    throw new Error(`No preserved release exists at ${state.releaseBackup}`);
  }

  if (state.mode === 'development') {
    const unlinked = await unlinkWorkflow(options);
    if (!unlinked.removed) {
      throw new Error(`Unable to remove development workflow link: ${unlinked.reason}`);
    }
  }

  try {
    await options.fileSystem.rename(state.releaseBackup, state.destination);
  } catch (error) {
    if (state.mode === 'development') {
      await linkWorkflow(options);
    }
    throw error;
  }

  return {...state, changed: true, mode: 'production'};
}
