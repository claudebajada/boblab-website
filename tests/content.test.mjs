import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { root, validateRecord, isDate, isPublicUrl } from '../scripts/content.mjs';
import { composePages, escapeHtml } from '../scripts/build.mjs';

const template = async kind => JSON.parse(await readFile(path.join(root, 'templates/content', `${kind}.json`), 'utf8'));

test('public records require registered evidence; drafts remain possible', async () => {
  const record = await template('person');
  validateRecord('people', record, `${record.id}.json`, new Set());
  record.draft = false;
  assert.throws(() => validateRecord('people', record, `${record.id}.json`, new Set()), /sourceIds/);
  record.sourceIds = ['unknown'];
  assert.throws(() => validateRecord('people', record, `${record.id}.json`, new Set()), /unknown source/);
});

test('alumni cannot accidentally acquire portrait grids', async () => {
  const record = await template('person');
  record.group = 'alumni'; record.image = '/media/photo.webp'; record.imageAlt = 'Portrait';
  assert.throws(() => validateRecord('people', record, `${record.id}.json`, new Set()), /alumni portraits/);
});

test('dates and URL schemes reject invalid inputs', () => {
  assert.equal(isDate('2026-02-30'), false);
  assert.equal(isDate('2024-02-29'), true);
  for (const url of ['javascript:alert(1)', '//untrusted.example', '/media/../private.txt', 'https://user:pass@example.com']) assert.equal(isPublicUrl(url), false);
  assert.equal(isPublicUrl('https://doi.org/10.1000/example'), true);
});

test('drafts do not reach HTML and public text is escaped', async () => {
  const person = await template('person');
  person.name = '<script>private draft</script>';
  const data = { site: { expandedName: 'Lab', introduction: ['Research'], institution: 'University', email: null }, people: [person], projects: [], publications: [], news: [] };
  assert.ok(!composePages(data).map(p => p.body).join('').includes('private draft'));
  person.draft = false;
  const html = composePages(data).find(p => p.route === '/our-team/').body;
  assert.ok(html.includes('&lt;script&gt;private draft&lt;/script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.equal(escapeHtml('"a&b"'), '&quot;a&amp;b&quot;');
});

test('unknown fields and reversed project dates fail clearly', async () => {
  const project = await template('project');
  project.startDate = '2026-05-01'; project.endDate = '2026-04-30';
  assert.throws(() => validateRecord('projects', project, `${project.id}.json`, new Set()), /end precedes start/);
  project.endDate = null; project.darft = false;
  assert.throws(() => validateRecord('projects', project, `${project.id}.json`, new Set()), /fields must be exactly/);
});


test('faculty uses a content group and project routes never expose draft records', async () => {
  const faculty = await template('person');
  faculty.group = 'faculty'; faculty.draft = false; faculty.sourceIds = ['owner-brief'];
  validateRecord('people', faculty, `${faculty.id}.json`, new Set(['owner-brief']));
  const project = await template('project');
  const data = { site: { introduction: ['Research'], email: null }, people: [faculty], projects: [project], publications: [], news: [] };
  assert.ok(!composePages(data).some(p => p.route === `/projects/${project.id}/`));
  project.draft = false;
  const pages = composePages(data);
  assert.equal(pages.find(p => p.route === `/projects/${project.id}/`).navigationRoute, '/projects/');
  assert.match(pages.find(p => p.route === '/our-team/').body, /<h2>Faculty<\/h2>/);
});


test('research figures require accessible text, attribution and valid dimensions', async () => {
  const project = await template('project');
  const figure = { src: '/media/example.png', alt: 'An MRI phantom', caption: 'A physical MRI test object.', credit: '', sourceUrl: 'https://example.com/figure', licenseUrl: null, width: 800, height: 600 };
  project.figures = [figure];
  assert.throws(() => validateRecord('projects', project, `${project.id}.json`, new Set()), /caption and credit required/);
  figure.credit = 'Example source'; figure.width = 0;
  assert.throws(() => validateRecord('projects', project, `${project.id}.json`, new Set()), /positive figure dimensions/);
  figure.width = 800;
  validateRecord('projects', project, `${project.id}.json`, new Set());
});
