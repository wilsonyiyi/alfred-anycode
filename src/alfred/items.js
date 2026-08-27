export function createActionArgument({action, editor, projectPath}) {
  return JSON.stringify({
    action,
    editor: editor
      ? {applicationName: editor.applicationName, id: editor.id, label: editor.label}
      : undefined,
    path: projectPath,
  });
}

export function buildConfigurationItems() {
  return [{
    arg: JSON.stringify({action: 'configure'}),
    icon: {path: 'icon.png'},
    subtitle: 'Manage project folders, editor keywords, and custom icons',
    title: 'Open AnyCode Settings',
  }];
}

export function buildProjectItems(projects, editor, editorIcon) {
  return projects.map(project => ({
    arg: createActionArgument({
      action: 'open',
      editor,
      projectPath: project.absolutePath,
    }),
    autocomplete: project.name,
    icon: editorIcon ?? {path: project.absolutePath, type: 'fileicon'},
    mods: {
      cmd: {
        arg: createActionArgument({
          action: 'reveal',
          projectPath: project.absolutePath,
        }),
        subtitle: 'Reveal project in Finder',
      },
    },
    subtitle: `Open in ${editor.label} — ${project.absolutePath}`,
    text: {copy: project.absolutePath, largetype: project.absolutePath},
    title: project.name,
    uid: `${editor.id}:${project.absolutePath}`,
  }));
}

export function buildEmptyState(config) {
  return [{
    icon: {path: '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertCautionIcon.icns'},
    subtitle: `Configured patterns: ${config.projectPatterns.join(', ')}`,
    title: 'No projects found. Configure your project directories.',
    valid: false,
  }];
}

export function buildErrorItem(error) {
  return [{
    icon: {path: '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns'},
    subtitle: 'Open Configure Workflow… and check the IDE and project settings.',
    text: {copy: error instanceof Error ? error.message : String(error)},
    title: error instanceof Error ? error.message : String(error),
    valid: false,
  }];
}
