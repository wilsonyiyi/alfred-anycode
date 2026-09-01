import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRefreshErrorItem,
  buildRefreshItem,
  buildRefreshLoadingItem,
} from '../src/alfred/items.js';

test('buildRefreshItem reports the count and continues with the cleaned query', () => {
  assert.deepEqual(buildRefreshItem(1, 'alfred-anycode'), {
    autocomplete: 'alfred-anycode',
    icon: {path: 'icon.png'},
    subtitle: '1 project indexed. Press Return or keep typing to continue.',
    title: 'Project cache refreshed',
    uid: 'project-cache-refreshed',
    valid: false,
  });
  assert.match(buildRefreshItem(42).subtitle, /^42 projects indexed\./u);
});

test('refresh items expose explicit loading and error states', () => {
  assert.deepEqual(buildRefreshLoadingItem('alfred-anycode'), {
    autocomplete: 'alfred-anycode',
    icon: {path: 'icon.png'},
    subtitle: 'Scanning configured project directories…',
    title: 'Refreshing project cache…',
    uid: 'project-cache-refreshing',
    valid: false,
  });
  assert.deepEqual(buildRefreshErrorItem('Request failed', 'alfred-anycode'), {
    autocomplete: 'alfred-anycode',
    icon: {path: '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns'},
    subtitle: 'Request failed',
    title: 'Project cache refresh failed',
    uid: 'project-cache-refresh-failed',
    valid: false,
  });
});
