import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function readCache(cacheFile) {
  try {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  } catch {
    return {};
  }
}

function createCache(cacheDirectory) {
  const cacheFile = path.join(cacheDirectory, 'projects-cache.json');

  return {
    get(key) {
      return readCache(cacheFile)[key];
    },
    set(key, value) {
      fs.mkdirSync(cacheDirectory, {recursive: true});
      const temporaryFile = `${cacheFile}.${process.pid}.tmp`;
      const cache = readCache(cacheFile);
      cache[key] = value;
      fs.writeFileSync(temporaryFile, `${JSON.stringify(cache)}\n`, 'utf8');
      fs.renameSync(temporaryFile, cacheFile);
    },
  };
}

const cacheDirectory = process.env.alfred_workflow_cache
  || path.join(os.tmpdir(), 'alfred-anycode-cache');

const alfred = {
  cache: createCache(cacheDirectory),
  input: process.argv[2] ?? '',
  keyword: process.env.alfred_workflow_keyword ?? '',
  log(value) {
    console.error(value);
  },
  output(items, {rerunInterval, variables} = {}) {
    const response = {items};
    if (rerunInterval !== undefined) {
      response.rerun = rerunInterval;
    }

    if (variables !== undefined) {
      response.variables = variables;
    }

    console.log(JSON.stringify(response));
  },
};

export default alfred;
