import test from 'node:test';
import assert from 'node:assert/strict';
import { structuredData } from '../scripts/structured-data.mjs';

const site = {
  stage: 'live', name: 'BOB Lab', expandedName: 'Boundaries of the Brain laboratory',
  institution: 'University of Malta', description: 'Neuroimaging research.', email: 'lab@example.org',
};
function graphFor(page, origin = 'https://lab.example', basePath = '') {
  const markup = structuredData(site, page, origin, basePath);
  return JSON.parse(markup.match(/^<script type="application\/ld\+json">(.*)<\/script>$/)?.[1] ?? 'null');
}

test('homepage identifies the lab, university, website and canonical page', () => {
  const data = graphFor({ route: '/', label: 'Home' });
  assert.equal(data['@context'], 'https://schema.org');
  const [lab, website, page] = data['@graph'];
  assert.equal(lab['@type'], 'ResearchOrganization');
  assert.equal(lab.name, 'Boundaries of the Brain laboratory');
  assert.equal(lab.logo, 'https://lab.example/media/bob-logo-colour.png');
  assert.equal(lab.parentOrganization.name, 'University of Malta');
  assert.equal(website['@type'], 'WebSite');
  assert.deepEqual(website.publisher, { '@id': lab['@id'] });
  assert.equal(page.url, 'https://lab.example/');
  assert.deepEqual(page.isPartOf, { '@id': website['@id'] });
});

test('project pages retain the GitHub Pages base path in URLs and references', () => {
  const data = graphFor({ route: '/projects/sara/', label: 'SARA', description: 'An MRI phantom.' },
    'https://claudebajada.github.io', '/boblab-website');
  assert.equal(data['@graph'].length, 1);
  const page = data['@graph'][0];
  assert.equal(page.url, 'https://claudebajada.github.io/boblab-website/projects/sara/');
  assert.equal(page.isPartOf['@id'], 'https://claudebajada.github.io/boblab-website/#website');
  assert.equal(page.about['@id'], 'https://claudebajada.github.io/boblab-website/#organization');
});

test('news uses Article markup without confusing event dates with publication dates', () => {
  const article = { title: 'A science event', date: '2026-11-06', summary: ['Families explored brains.'],
    photos: [{ src: '/media/events/event.webp' }] };
  const data = graphFor({ route: '/news/an-event/', label: article.title, article },
    'https://claudebajada.github.io', '/boblab-website');
  const [page, story] = data['@graph'];
  assert.equal(story['@type'], 'Article');
  assert.equal(story.image, 'https://claudebajada.github.io/boblab-website/media/events/event.webp');
  assert.equal(story.datePublished, undefined);
  assert.deepEqual(page.mainEntity, { '@id': story['@id'] });
  assert.deepEqual(story.mainEntityOfPage, { '@id': page['@id'] });
});

test('structured data is omitted on previews, 404s, aliases and unconfigured URLs', () => {
  assert.equal(structuredData({ ...site, stage: 'preview' }, { route: '/', label: 'Home' }, 'https://lab.example', ''), '');
  assert.equal(structuredData(site, { route: '/', label: 'Home' }, null, ''), '');
  assert.equal(structuredData(site, { route: '/404.html', label: 'Not found' }, 'https://lab.example', ''), '');
  assert.equal(structuredData(site, { route: '/our-team-1/', canonicalRoute: '/our-team/' }, 'https://lab.example', ''), '');
});

test('JSON-LD escapes embedded closing script tags', () => {
  const untrusted = { ...site, description: '</script><script>alert(1)</script>' };
  const markup = structuredData(untrusted, { route: '/', label: 'Home' }, 'https://lab.example', '');
  assert.equal((markup.match(/<script/g) || []).length, 1);
  assert.ok(!markup.includes('</script><script>'));
  assert.ok(markup.includes('\\u003c/script>'));
});
