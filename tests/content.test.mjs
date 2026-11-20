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

test('news policy rejects oversized summaries, galleries, link lists and invalid date ranges', async () => {
  const record = await template('news');
  const validate = () => validateRecord('news', record, `${record.id}.json`, new Set());
  record.summary = [Array(80).fill('word').join(' ')];
  validate();
  record.summary[0] += ' extra';
  assert.throws(validate, /80 words/);
  record.summary = ['Short update.'];
  record.title = 'A'.repeat(100);
  validate();
  record.title += 'B';
  assert.throws(validate, /100 characters/);
  record.title = 'Short title';
  record.endDate = '2026-01-01';
  assert.throws(validate, /end date/);
  record.endDate = null;
  record.links = Array(3).fill({ label: 'Source', url: 'https://example.com/' });
  assert.throws(validate, /at most 2/);
  record.links = [];
  const photo = { src: '/media/example.webp', alt: 'Brain models on a table', caption: 'At the festival.', credit: 'Example photographer', width: 1200, height: 800 };
  record.photos = Array(4).fill(photo);
  assert.throws(validate, /at most 3 photos/);
  record.photos = [{ ...photo, credit: '' }];
  assert.throws(validate, /caption and credit/);
  record.photos = [{ ...photo, src: 'https://example.com/photo.webp' }];
  assert.throws(validate, /local photograph/);
  record.photos = [{ ...photo, height: 0 }];
  assert.throws(validate, /positive photo dimensions/);
  record.photos = Array(3).fill(photo);
  validate();
});

test('homepage features the chosen publication or the first public journal article in bibliography order', async () => {
  const journal = { ...await template('publication'), draft: false, year: 2025 };
  const publications = [
    { ...journal, id: 'later-title', title: 'Zebra study' },
    { ...journal, id: 'earlier-title', title: 'Atlas study' },
    { ...journal, id: 'draft-journal', year: 2027, draft: true },
    { ...journal, id: 'new-preprint', year: 2026, kind: 'preprint' },
  ];
  const site = { introduction: [], featuredPublicationId: 'new-preprint' };
  const data = { site, publications, people: [], projects: [], news: [] };
  const featuredIds = () => [...composePages(data)[0].body.matchAll(/<article class="paper" id="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(featuredIds(), ['new-preprint']);
  site.featuredPublicationId = 'later-title';
  assert.deepEqual(featuredIds(), ['later-title']);
  site.featuredPublicationId = null;
  assert.deepEqual(featuredIds(), ['earlier-title']);
  data.publications = publications.filter(p => p.kind === 'preprint' || p.draft);
  assert.deepEqual(featuredIds(), []);
});

test('homepage caps combined news/events at three, sorts dates, and keeps older story URLs', async () => {
  const example = await template('news');
  const news = [
    { ...example, id: 'oldest', date: '2025-01-01', draft: false },
    { ...example, id: 'tie-b', date: '2026-11-01', draft: false },
    { ...example, id: 'newest', date: '2026-11-07', endDate: '2026-11-08', draft: false },
    { ...example, id: 'tie-a', date: '2026-11-01', draft: false },
    { ...example, id: 'private-update', date: '2026-12-01', draft: true },
  ];
  news[2].photos = [1, 2, 3].map(i => ({ src: `/media/photo-${i}.webp`, alt: 'A brain model', caption: '<script>caption</script>', credit: 'A & B', width: 1200, height: 800 }));
  const data = { site: { introduction: ['Research'], email: null }, people: [], projects: [], publications: [], news };
  const pages = composePages(data);
  const home = pages.find(p => p.route === '/').body;
  assert.deepEqual([...home.matchAll(/<article id="([^"]+)"/g)].map(match => match[1]), ['newest', 'tie-a', 'tie-b']);
  assert.equal((home.match(/class="news-photo/g) || []).length, 1);
  assert.ok(!home.includes('photo-2.webp'));
  assert.ok(!pages.some(p => p.route.includes('private-update')));
  assert.ok(pages.some(p => p.route === '/news/oldest/'));
  const detail = pages.find(p => p.route === '/news/newest/').body;
  assert.equal((detail.match(/class="news-photo/g) || []).length, 3);
  assert.match(detail, /&lt;script&gt;caption&lt;\/script&gt;/);
  assert.match(detail, /A &amp; B/);
  assert.match(detail, /7\s*–\s*8 November 2026/);
  data.news = [];
  assert.ok(!composePages(data)[0].body.includes('id="news-and-events"'));
});
