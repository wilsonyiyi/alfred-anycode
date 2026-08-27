const CACHE_KEY = 'project-catalog-v1';

function createSignature(patterns) {
  return JSON.stringify([...patterns].sort());
}

function isCacheEntryUsable(entry, signature, now, cacheTtlMs) {
  return Boolean(
    entry
      && entry.signature === signature
      && Array.isArray(entry.projects)
      && Number.isFinite(entry.updatedAt)
      && now - entry.updatedAt < cacheTtlMs,
  );
}

export function createProjectCatalog({cache, cacheTtlMs, clock = Date.now, discover}) {
  if (typeof discover !== 'function') {
    throw new TypeError('Project catalog requires a discovery function.');
  }

  return {
    async list(patterns, {refresh = false} = {}) {
      const signature = createSignature(patterns);
      const now = clock();
      const cached = cache?.get(CACHE_KEY);

      if (!refresh && isCacheEntryUsable(cached, signature, now, cacheTtlMs)) {
        return cached.projects;
      }

      const projects = await discover(patterns);
      cache?.set(CACHE_KEY, {projects, signature, updatedAt: now});
      return projects;
    },
  };
}
