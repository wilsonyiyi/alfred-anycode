import alfred from './src/alfred/runtime.js';
import {
  buildConfigurationItems,
  buildEmptyState,
  buildErrorItem,
  buildProjectItems,
} from './src/alfred/items.js';
import {MANAGER_KEYWORD} from './src/config/editor-config.js';
import {readWorkflowConfig} from './src/config/workflow-config.js';
import {resolveEditorIcon} from './src/ides/editor-icon.js';
import {createEditorRegistry} from './src/ides/editor-registry.js';
import {createProjectCatalog} from './src/projects/project-catalog.js';
import {discoverProjects} from './src/projects/project-discovery.js';
import {searchProjects} from './src/search/project-search.js';

async function run() {
  if (alfred.keyword.toLocaleLowerCase() === MANAGER_KEYWORD) {
    alfred.output(buildConfigurationItems());
    return;
  }

  const config = await readWorkflowConfig();
  const editor = createEditorRegistry(config.editorDefinitions).resolve(alfred.keyword);
  const refresh = alfred.input.trim() === ':refresh';
  const query = refresh ? '' : alfred.input;
  const catalog = createProjectCatalog({
    cache: alfred.cache,
    cacheTtlMs: config.cacheTtlMs,
    discover: patterns => discoverProjects(patterns, {
      homeDirectory: config.homeDirectory,
    }),
  });
  const projects = await catalog.list(config.projectPatterns, {refresh});

  if (projects.length === 0) {
    alfred.output(buildEmptyState(config));
    return;
  }

  alfred.output(buildProjectItems(
    searchProjects(projects, query),
    editor,
    resolveEditorIcon(editor, {homeDirectory: config.homeDirectory}),
  ));
}

try {
  await run();
} catch (error) {
  alfred.log(error);
  alfred.output(buildErrorItem(error));
}
