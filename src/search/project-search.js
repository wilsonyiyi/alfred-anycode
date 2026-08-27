export function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .toLocaleLowerCase()
    .replace(/\p{Mark}/gu, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}

function compact(value) {
  return normalizeSearchText(value).replaceAll(' ', '');
}

function subsequenceScore(value, query) {
  let queryIndex = 0;
  let gapCount = 0;

  for (let valueIndex = 0; valueIndex < value.length && queryIndex < query.length; valueIndex += 1) {
    if (value[valueIndex] === query[queryIndex]) {
      queryIndex += 1;
    } else if (queryIndex > 0) {
      gapCount += 1;
    }
  }

  return queryIndex === query.length ? Math.max(1, 150 - gapCount) : 0;
}

function scoreProject(project, query) {
  if (!query) {
    return 1;
  }

  const normalizedName = normalizeSearchText(project.name);
  const normalizedPath = normalizeSearchText(project.absolutePath);
  const compactName = compact(project.name);
  const compactQuery = compact(query);
  const initials = normalizedName
    .split(' ')
    .filter(Boolean)
    .map(token => token[0])
    .join('');
  const queryTokens = normalizeSearchText(query).split(' ').filter(Boolean);

  if (compactName === compactQuery) {
    return 1000;
  }

  if (compactName.startsWith(compactQuery)) {
    return 850;
  }

  if (initials.startsWith(compactQuery)) {
    return 750;
  }

  if (normalizedName.split(' ').some(token => token.startsWith(normalizeSearchText(query)))) {
    return 700;
  }

  if (compactName.includes(compactQuery)) {
    return 550;
  }

  if (queryTokens.every(token => normalizedName.includes(token))) {
    return 450;
  }

  if (queryTokens.every(token => normalizedPath.includes(token))) {
    return 300;
  }

  return subsequenceScore(compactName, compactQuery);
}

export function searchProjects(projects, query, {limit = 80} = {}) {
  return projects
    .map(project => ({project, score: scoreProject(project, query)}))
    .filter(result => result.score > 0)
    .sort((left, right) =>
      right.score - left.score
      || left.project.name.localeCompare(right.project.name, undefined, {
        sensitivity: 'base',
      }),
    )
    .slice(0, limit)
    .map(result => result.project);
}
