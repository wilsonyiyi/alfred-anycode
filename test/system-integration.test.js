import assert from 'node:assert/strict';
import test from 'node:test';
import {
  chooseMacOSApplication,
  chooseMacOSDirectory,
  detectLocalEnvironment,
  projectPatternForDirectory,
} from '../src/config-ui/system-integration.js';

test('detectLocalEnvironment combines known paths with Spotlight application results', async () => {
  const existing = new Set([
    '/Applications/Cursor.app',
    '/Users/example/Projects',
    '/Users/example/Workspace',
  ]);
  const fileSystem = {
    async access(target) {
      if (!existing.has(target)) throw Object.assign(new Error('missing'), {code: 'ENOENT'});
    },
  };

  const runner = async (command, arguments_) => {
    assert.equal(command, '/usr/bin/mdfind');
    assert.match(arguments_[0], /application-bundle/u);
    return {
      stdout: [
        '/Users/example/Library/Application Support/JetBrains/Toolbox/apps/WebStorm.app',
        '/Applications/Zed.app',
      ].join('\n'),
    };
  };

  assert.deepEqual(await detectLocalEnvironment({fileSystem, homeDirectory: '/Users/example', runner}), {
    existingProjectPatterns: ['~/Projects/*', '~/Workspace/*'],
    installedEditorTypes: ['cursor', 'zed', 'webstorm'],
  });
});

test('detectLocalEnvironment still works when Spotlight is unavailable', async () => {
  const fileSystem = {
    async access(target) {
      if (target !== '/Applications/Visual Studio Code.app') {
        throw Object.assign(new Error('missing'), {code: 'ENOENT'});
      }
    },
  };

  const result = await detectLocalEnvironment({
    fileSystem,
    homeDirectory: '/Users/example',
    runner: async () => {
      throw new Error('Spotlight unavailable');
    },
  });
  assert.deepEqual(result.installedEditorTypes, ['vscode']);
});

test('macOS selectors normalize directory and application results', async () => {
  const calls = [];
  const directory = await chooseMacOSDirectory({
    runner: async (...arguments_) => {
      calls.push(arguments_);
      return {stdout: '/Users/example/Code/\n'};
    },
  });
  const application = await chooseMacOSApplication({
    runner: async () => ({stdout: '/Applications/Zed.app/\n'}),
  });

  assert.equal(directory, '/Users/example/Code');
  assert.deepEqual(application, {
    applicationName: 'Zed',
    applicationPath: '/Applications/Zed.app',
  });
  assert.equal(calls[0][0], '/usr/bin/osascript');
  assert.equal(projectPatternForDirectory(directory, '/Users/example'), '~/Code/*');
});

test('macOS selector cancellation has a stable error code', async () => {
  await assert.rejects(
    chooseMacOSDirectory({
      runner: async () => {
        throw Object.assign(new Error('cancel'), {code: 1, stderr: 'execution error: User canceled. (-128)'});
      },
    }),
    error => error.code === 'SELECTION_CANCELED',
  );
});
