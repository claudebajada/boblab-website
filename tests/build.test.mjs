import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { root, loadContent } from '../scripts/content.mjs';
import { build } from '../scripts/build.mjs';
import { checkOutputLinks } from '../scripts/output-links.mjs';

test('all collections build publicly while drafts and source files stay outside output', async () => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'bob-build-test-'));
  try {
    for (const directory of ['content', 'docs', 'public', 'src']) {
      await cp(path.join(root, directory), path.join(fixture, directory), { recursive: true });
    }
    const sitePath = path.join(fixture, 'content/site.json');
    const site = JSON.parse(await readFile(sitePath, 'utf8'));
    Object.assign(site, {
      stage: 'live', origin: 'https://lab.example', email: 'lab@example.com',
      featuredPublicationId: 'example-publication',
      homeImage: { src: '/media/research/brain-tractography.gif', stillSrc: '/media/research/legacy-brain-still.webp', alt: 'Brain surface and fibre pathways', width: 578, height: 578 },
      homeBanner: { src: '/media/brand/banner-5.webp', alt: 'Four cortical surface renderings', width: 2257, height: 420 },
    });
    await writeFile(sitePath, JSON.stringify(site));
    for (const [kind, template] of [['people', 'person'], ['projects', 'project'], ['publications', 'publication'], ['news', 'news']]) {
      const record = JSON.parse(await readFile(path.join(root, 'templates/content', `${template}.json`), 'utf8'));
      Object.assign(record, { draft: false, sourceIds: ['owner-brief'] });
      await writeFile(path.join(fixture, 'content', kind, `${record.id}.json`), JSON.stringify(record));
      Object.assign(record, { id: `private-${template}`, draft: true });
      await writeFile(path.join(fixture, 'content', kind, `${record.id}.json`), JSON.stringify(record));
    }
    await build(fixture, {});
    const output = path.join(fixture, 'dist');
    const entries = await readdir(output);
    assert.ok(!entries.includes('content') && !entries.includes('docs') && !entries.includes('templates'));
    for (const [route, id] of [['our-team', 'person'], ['projects', 'project'], ['publications', 'publication'], ['', 'news']]) {
      const html = await readFile(path.join(output, route, 'index.html'), 'utf8');
      const publishedId = id === 'news' ? 'example-update' : `example-${id}`;
      assert.ok(html.includes(`id="${publishedId}"`));
      assert.ok(!html.includes(`id="private-${id}"`));
      assert.ok(!html.includes('sourceIds') && !html.includes('Scaffold preview'));
      assert.ok(html.includes('rel="canonical"'));
    }
    const homepage = await readFile(path.join(output, 'index.html'), 'utf8');
    assert.ok(homepage.includes('<article class="paper" id="example-publication">'));
    const homeSchema = JSON.parse(homepage.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1] ?? 'null');
    assert.equal(homeSchema['@graph'][0]['@type'], 'ResearchOrganization');
    assert.equal(homeSchema['@graph'][1]['@type'], 'WebSite');
    assert.equal(homeSchema['@graph'][2].url, 'https://lab.example/');
    const projectHtml = await readFile(path.join(output, 'projects/example-project/index.html'), 'utf8');
    assert.match(projectHtml, /About the project/);
    const projectSchema = JSON.parse(projectHtml.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1] ?? 'null');
    assert.equal(projectSchema['@graph'][0].url, 'https://lab.example/projects/example-project/');
    assert.ok(!(await readFile(path.join(output, '404.html'), 'utf8')).includes('application/ld+json'));
    const alias = await readFile(path.join(output, 'our-team-1/index.html'), 'utf8');
    assert.ok(!alias.includes('application/ld+json'));
    assert.ok(alias.includes('<meta http-equiv="refresh" content="0; url=/our-team/">'));
    assert.ok(alias.includes('href="/our-team/">Meet the people</a>'));
    assert.ok(!homepage.includes('http-equiv="refresh"'));
    assert.equal((projectHtml.match(/aria-current="page"/g) || []).length, 2);
    assert.ok(!projectHtml.includes('href="/projects/private-project/"'));
    assert.ok(!(await readdir(path.join(output, 'projects'))).includes('private-project'));
    assert.match(await readFile(path.join(output, 'robots.txt'), 'utf8'), /Allow: \/\nSitemap: https:\/\/lab.example\/sitemap.xml/);
    assert.match(await readFile(path.join(output, 'sitemap.xml'), 'utf8'), /https:\/\/lab.example\/our-team\//);
    await writeFile(path.join(output, 'index.html'), '<a href="/missing/">Broken</a>');
    await assert.rejects(checkOutputLinks(output), /missing local target/);
    await writeFile(path.join(output, 'index.html'), '<a href="/our-team/#missing">Broken</a>');
    await assert.rejects(checkOutputLinks(output), /missing fragment/);
    await build(fixture, { SITE_URL: 'https://claudebajada.github.io/boblab-website' });
    const pagesHtml = await readFile(path.join(output, 'index.html'), 'utf8');
    const prefixedAlias = await readFile(path.join(output, 'our-team-1/index.html'), 'utf8');
    assert.ok(prefixedAlias.includes('<meta http-equiv="refresh" content="0; url=/boblab-website/our-team/">'));
    assert.ok(prefixedAlias.includes('href="/boblab-website/our-team/">Meet the people</a>'));
    assert.ok(pagesHtml.includes('href="/boblab-website/styles.css"'));
    assert.ok(pagesHtml.includes('src="/boblab-website/media/bob-logo-colour.png"'));
    assert.ok(pagesHtml.includes('src="/boblab-website/media/research/brain-tractography.gif"'));
    assert.ok(pagesHtml.includes('src="/boblab-website/media/brand/banner-5.webp"'));
    assert.ok(pagesHtml.includes('src="/boblab-website/media/events/amazing-animals-brain-models.webp"'));
    const eventHtml = await readFile(path.join(output, 'news/amazing-animals-science-in-the-city-2026/index.html'), 'utf8');
    assert.ok(eventHtml.includes('src="/boblab-website/media/events/amazing-animals-claude-bajada.webp"'));
    assert.ok(eventHtml.includes('href="/boblab-website/#news-and-events"'));
    const eventSchema = JSON.parse(eventHtml.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1] ?? 'null');
    assert.equal(eventSchema['@graph'][1]['@type'], 'Article');
    assert.equal(eventSchema['@graph'][1].image, 'https://claudebajada.github.io/boblab-website/media/events/amazing-animals-brain-models.webp');
    assert.equal(eventSchema['@graph'][1].datePublished, undefined);
    assert.ok(!eventHtml.includes('href="/news/'));
    assert.ok(pagesHtml.includes('src="/boblab-website/media/research/legacy-brain-still.webp"'));
    assert.ok(pagesHtml.includes('href="/boblab-website/projects/"'));
    const prefixedDetail = await readFile(path.join(output, 'projects/example-project/index.html'), 'utf8');
    assert.ok(prefixedDetail.includes('href="/boblab-website/projects/#example-project"'));
    assert.ok(!prefixedDetail.includes('href="/projects/'));
    const projectIndex = await readFile(path.join(output, 'projects/index.html'), 'utf8');
    assert.ok(projectIndex.includes('href="/boblab-website/projects/example-project/"'));
    assert.ok(pagesHtml.includes('href="https://claudebajada.github.io/boblab-website/"'));
    assert.match(await readFile(path.join(output, 'sitemap.xml'), 'utf8'), /https:\/\/claudebajada.github.io\/boblab-website\/publications\//);
    await checkOutputLinks(output, '/boblab-website');
    await writeFile(path.join(output, 'index.html'), '<a href="/projects/">Missed prefix</a>');
    await assert.rejects(checkOutputLinks(output, '/boblab-website'), /escapes deployment base path/);
    await build(fixture, { SITE_URL: 'https://boblab.example/' });
    const domainHtml = await readFile(path.join(output, 'index.html'), 'utf8');
    assert.ok(domainHtml.includes('href="/styles.css"'));
    assert.ok(!domainHtml.includes('/boblab-website/'));
    const domainSchema = JSON.parse(domainHtml.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1] ?? 'null');
    assert.equal(domainSchema['@graph'][0].url, 'https://boblab.example/');
    assert.equal(domainSchema['@graph'][0].logo, 'https://boblab.example/media/bob-logo-colour.png');
    const examplePath = path.join(fixture, 'content/projects/example-project.json');
    const example = JSON.parse(await readFile(examplePath, 'utf8'));
    example.publicationIds = ['missing-publication'];
    await writeFile(examplePath, JSON.stringify(example));
    await assert.rejects(loadContent(fixture), /missing or draft publication/);
    example.publicationIds = [];
    example.links = [{ label: 'Old project directory', url: 'https://boblab.info/projects/' }];
    await writeFile(examplePath, JSON.stringify(example));
    await assert.rejects(loadContent(fixture), /not the old site/);
    example.links = [];
    await writeFile(examplePath, JSON.stringify(example));
    const source = (await loadContent(fixture)).publications.find(p => !p.draft && p.doi);
    const duplicate = { ...source, id: 'duplicate-doi', doi: source.doi.toUpperCase() };
    await writeFile(path.join(fixture, 'content/publications/duplicate-doi.json'), JSON.stringify(duplicate));
    await assert.rejects(loadContent(fixture), /Duplicate public DOI/);
    await rm(path.join(fixture, 'content/publications/duplicate-doi.json'));
    const eventPath = path.join(fixture, 'content/news/amazing-animals-science-in-the-city-2026.json');
    const event = JSON.parse(await readFile(eventPath, 'utf8'));
    const approvedPhoto = event.photos[0].src;
    event.photos[0].src = '/media/missing-event-photo.webp';
    await writeFile(eventPath, JSON.stringify(event));
    await assert.rejects(loadContent(fixture), /ENOENT/);
    event.photos[0].src = approvedPhoto;
    await writeFile(eventPath, JSON.stringify(event));
    for (const id of ['missing-publication', 'private-publication']) {
      await writeFile(sitePath, JSON.stringify({ ...site, featuredPublicationId: id }));
      await assert.rejects(loadContent(fixture), /site\.featuredPublicationId: expected a public publication ID/);
    }
    const legacySettings = { ...site };
    delete legacySettings.featuredPublicationId;
    await writeFile(sitePath, JSON.stringify(legacySettings));
    assert.equal((await loadContent(fixture)).site.featuredPublicationId, null);
    site.homeBanner.src = '/media/../private.png';
    await writeFile(sitePath, JSON.stringify(site));
    await assert.rejects(loadContent(fixture), /local image and alt text/);
    site.homeBanner.src = '/media/missing-banner.png';
    await writeFile(sitePath, JSON.stringify(site));
    await assert.rejects(loadContent(fixture), /ENOENT/);
    site.homeBanner.src = '/media/brand/banner-5.webp';
    site.homeImage.stillSrc = 'https://example.com/remote.gif';
    await writeFile(sitePath, JSON.stringify(site));
    await assert.rejects(loadContent(fixture), /local animation, still image and alt text/);
    site.homeImage.stillSrc = '/media/missing-still.webp';
    await writeFile(sitePath, JSON.stringify(site));
    await assert.rejects(loadContent(fixture), /ENOENT/);

  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
