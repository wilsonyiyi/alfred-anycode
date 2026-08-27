import assert from 'node:assert/strict';
import test from 'node:test';
import {normalizeSearchText, searchProjects} from '../src/search/project-search.js';

const projects = [
  {absolutePath: '/Work/service-center', name: 'service-center'},
  {absolutePath: '/Work/center-service', name: 'center-service'},
  {absolutePath: '/Playground/tutu', name: 'tutu'},
  {absolutePath: '/Work/选品中心', name: '选品中心'},
];

test('searchProjects prioritizes exact prefixes over path matches', () => {
  assert.deepEqual(
    searchProjects(projects, 'service').map(project => project.name),
    ['service-center', 'center-service'],
  );
});

test('searchProjects supports punctuation-insensitive and Unicode searches', () => {
  assert.equal(searchProjects(projects, 'sc')[0].name, 'service-center');
  assert.equal(searchProjects(projects, '选品')[0].name, '选品中心');
  assert.equal(normalizeSearchText('Café_Project'), 'cafe project');
});
