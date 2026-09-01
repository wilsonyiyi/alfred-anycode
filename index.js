import path from 'node:path';
import {fileURLToPath} from 'node:url';
import alfred, {parseWorkflowInput} from './src/alfred/runtime.js';
import {
  buildConfigurationItems,
  buildEmptyState,
  buildErrorItem,
  buildProjectItems,
  buildRefreshErrorItem,
  buildRefreshItem,
  buildRefreshLoadingItem,
} from './src/alfred/items.js';
import {MANAGER_KEYWORD} from './src/config/editor-config.js';
import {readWorkflowConfig} from './src/config/workflow-config.js';
import {resolveEditorIcon} from './src/ides/editor-icon.js';
import {createEditorRegistry} from './src/ides/editor-registry.js';
import {createProjectCatalog} from './src/projects/project-catalog.js';
import {discoverProjects} from './src/projects/project-discovery.js';
import {
  beginProjectRefresh,
  getProjectRefreshPollInterval,
  PROJECT_REFRESH_SESSION_VARIABLE,
  readProjectRefreshState,
} from './src/projects/project-refresh.js';
import {searchProjects} from './src/search/project-search.js';

const workflowRoot = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  if (alfred.keyword.toLocaleLowerCase() === MANAGER_KEYWORD) {
    alfred.output(buildConfigurationItems());
    return;
  }

  const {query, refresh} = parseWorkflowInput(alfred.input);
  let refreshState;
  if (refresh) {
    const refreshId = process.env[PROJECT_REFRESH_SESSION_VARIABLE];
    refreshState = refreshId
      ? readProjectRefreshState({cache: alfred.cache, refreshId})
      : beginProjectRefresh({
        cache: alfred.cache,
        workflowRoot,
      });

    if (refreshState.status === 'running') {
      alfred.output([buildRefreshLoadingItem(query)], {
        rerunInterval: getProjectRefreshPollInterval(refreshState),
        variables: {[PROJECT_REFRESH_SESSION_VARIABLE]: refreshState.id},
      });
      return;
    }

    if (refreshState.status === 'error') {
      alfred.output([buildRefreshErrorItem(refreshState.message, query)], {
        variables: {[PROJECT_REFRESH_SESSION_VARIABLE]: refreshState.id},
      });
      return;
    }
  }

  const config = await readWorkflowConfig();
  const editor = createEditorRegistry(config.editorDefinitions).resolve(alfred.keyword);
  const catalog = createProjectCatalog({
    cache: alfred.cache,
    cacheTtlMs: config.cacheTtlMs,
    discover: patterns => discoverProjects(patterns, {
      homeDirectory: config.homeDirectory,
    }),
  });

  const projects = await catalog.list(config.projectPatterns);
  const refreshItems = refresh ? [buildRefreshItem(projects.length, query)] : [];
  const outputOptions = refresh
    ? {variables: {[PROJECT_REFRESH_SESSION_VARIABLE]: refreshState.id}}
    : {variables: {[PROJECT_REFRESH_SESSION_VARIABLE]: ''}};

  if (projects.length === 0) {
    alfred.output([...refreshItems, ...buildEmptyState(config)], outputOptions);
    return;
  }

  alfred.output([
    ...refreshItems,
    ...buildProjectItems(
      searchProjects(projects, query),
      editor,
      resolveEditorIcon(editor, {homeDirectory: config.homeDirectory}),
    ),
  ], outputOptions);
}

try {
  await run();
} catch (error) {
  alfred.log(error);
  alfred.output(buildErrorItem(error));
}
