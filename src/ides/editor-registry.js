const KEYWORD_PATTERN = /^[\p{Letter}\p{Number}][\p{Letter}\p{Number}._-]{0,31}$/u;

function normalizeKeyword(value) {
  return String(value ?? '').trim().toLocaleLowerCase();
}

export function validateApplicationName(applicationName) {
  const value = String(applicationName ?? '').trim();
  if (!value) {
    throw new Error('IDE application name is required.');
  }

  if (value.length > 200 || /[\u0000-\u001F\u007F]/u.test(value)) {
    throw new Error('IDE application name contains unsupported characters.');
  }

  return value;
}

export function parseEditorKeywords(value) {
  const keywords = String(value ?? '')
    .split('||')
    .map(normalizeKeyword)
    .filter(Boolean);

  if (keywords.length === 0) {
    throw new Error('Each IDE requires at least one keyword.');
  }

  for (const keyword of keywords) {
    if (!KEYWORD_PATTERN.test(keyword)) {
      throw new Error(`Invalid IDE keyword "${keyword}".`);
    }
  }

  return [...new Set(keywords)];
}

function normalizeEditor(editor) {
  const applicationName = validateApplicationName(editor.applicationName);
  return {
    applicationName,
    iconPath: String(editor.iconPath ?? '').trim(),
    id: String(editor.id),
    keywords: parseEditorKeywords(editor.keywordExpression),
    label: applicationName,
  };
}

export function createEditorRegistry(editorDefinitions, {allowEmpty = false} = {}) {
  const editors = editorDefinitions
    .filter(editor => String(editor.keywordExpression ?? '').trim())
    .map(normalizeEditor);
  if (!allowEmpty && editors.length === 0) {
    throw new Error('Configure at least one IDE keyword.');
  }
  const editorByKeyword = new Map();

  for (const editor of editors) {
    for (const keyword of editor.keywords) {
      if (editorByKeyword.has(keyword)) {
        throw new Error(`Duplicate IDE keyword "${keyword}".`);
      }
      editorByKeyword.set(keyword, editor);
    }
  }

  return {
    editors,
    resolve(keyword) {
      const normalizedKeyword = normalizeKeyword(keyword);
      const editor = editorByKeyword.get(normalizedKeyword);
      if (!editor) {
        throw new Error(`No IDE is configured for keyword "${keyword || ''}".`);
      }
      return editor;
    },
  };
}
