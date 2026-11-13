import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const collections = ['people', 'projects', 'publications', 'news'];
const shared = ['id', 'draft', 'sourceIds', 'lastReviewed', 'links'];
const fields = {
  people: ['name', 'role', 'group', 'years', 'bio', 'image', 'imageAlt'],
  projects: ['title', 'acronym', 'summary', 'status', 'startDate', 'endDate', 'category', 'publicationIds', 'shortTitle', 'figures'],
  publications: ['title', 'authors', 'year', 'venue', 'kind', 'doi'],
  news: ['title', 'date', 'summary'],
};
function assert(ok, message) { if (!ok) throw new Error(message); }
function text(value) { return typeof value === 'string' && value.trim().length > 0; }
function strings(value) { return Array.isArray(value) && value.every(text); }
function nullableText(value) { return value === null || text(value); }
export function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
function keys(value, expected, label) {
  assert(value && typeof value === 'object' && !Array.isArray(value), `${label}: expected object`);
  assert(Object.keys(value).sort().join('|') === [...expected].sort().join('|'),
    `${label}: fields must be exactly ${expected.join(', ')}`);
}
export function isPublicUrl(value) {
  if (typeof value !== 'string' || /[\s\\\u0000-\u001f]/.test(value)) return false;
  if (value.startsWith('/') && !value.startsWith('//')) {
    return !value.split(/[/?#]/).some(part => part === '..' || part === '.');
  }
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; }
  catch { return false; }
}
function localImage(value) {
  return typeof value === 'string' && /^\/media\/[a-zA-Z0-9/_-]+\.(webp|png|jpe?g|avif|svg|gif)$/.test(value) && !value.includes('..');
}
function validateFigure(figure, label) {
  keys(figure, ['src', 'alt', 'caption', 'credit', 'sourceUrl', 'licenseUrl', 'width', 'height'], label);
  assert(localImage(figure.src) && text(figure.alt), `${label}: local figure image and alt text required`);
  assert(text(figure.caption) && text(figure.credit), `${label}: figure caption and credit required`);
  assert(isPublicUrl(figure.sourceUrl) && (figure.licenseUrl === null || isPublicUrl(figure.licenseUrl)), `${label}: invalid figure source/licence URL`);
  assert([figure.width, figure.height].every(n => Number.isInteger(n) && n > 0), `${label}: positive figure dimensions required`);
}
function provenance(record, sources, label, required) {
  assert(strings(record.sourceIds), `${label}: sourceIds must be a string array`);
  assert(!required || record.sourceIds.length > 0, `${label}: public content needs sourceIds`);
  for (const id of record.sourceIds) assert(sources.has(id), `${label}: unknown source ${id}`);
  assert(isDate(record.lastReviewed), `${label}: invalid lastReviewed date`);
}
export function validateRecord(kind, record, filename, sources) {
  const label = `${kind}/${filename}`;
  keys(record, [...shared, ...fields[kind]], label);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id), `${label}: invalid id`);
  assert(filename === `${record.id}.json`, `${label}: filename must match id`);
  assert(typeof record.draft === 'boolean', `${label}: draft must be boolean`);
  provenance(record, sources, label, !record.draft);
  assert(Array.isArray(record.links), `${label}: links must be an array`);
  for (const link of record.links) {
    keys(link, ['label', 'url'], label);
    assert(text(link.label) && isPublicUrl(link.url), `${label}: invalid link`);
  }
  if (kind === 'people') {
    assert(text(record.name) && text(record.role), `${label}: name and role required`);
    assert(['faculty', 'current', 'alumni'].includes(record.group), `${label}: invalid group`);
    assert(nullableText(record.years) && strings(record.bio), `${label}: invalid years/bio`);
    assert(nullableText(record.image) && nullableText(record.imageAlt), `${label}: invalid image fields`);
    assert(record.group !== 'alumni' || record.image === null, `${label}: alumni portraits are disabled`);
    assert(record.image === null || (/^\/media\/[a-zA-Z0-9/_-]+\.(webp|png|jpe?g|avif|svg)$/.test(record.image)
      && !record.image.includes('..') && text(record.imageAlt)), `${label}: local image and alt text required`);
  } else if (kind === 'projects') {
    assert(Array.isArray(record.figures), `${label}: figures must be an array`);
    for (const figure of record.figures) validateFigure(figure, label);
    assert(nullableText(record.shortTitle), `${label}: invalid shortTitle`);
    assert(['research', 'policy', 'education', 'collaboration', 'resource'].includes(record.category), `${label}: invalid category`);
    assert(strings(record.publicationIds), `${label}: publicationIds must be a string array`);
    assert(text(record.title) && nullableText(record.acronym), `${label}: invalid title/acronym`);
    assert(strings(record.summary) && record.summary.length > 0, `${label}: summary required`);
    assert(['active', 'programme', 'completed', 'resource'].includes(record.status), `${label}: invalid project status`);
    assert([record.startDate, record.endDate].every(d => d === null || isDate(d)), `${label}: invalid project date`);
    assert(!record.startDate || !record.endDate || record.startDate <= record.endDate, `${label}: end precedes start`);
  } else if (kind === 'publications') {
    assert(text(record.title) && text(record.venue) && strings(record.authors) && record.authors.length > 0,
      `${label}: title, authors, and venue required`);
    assert(Number.isInteger(record.year) && record.year >= 1900 && record.year <= 2200, `${label}: invalid year`);
    assert(['journal', 'preprint', 'conference', 'software', 'dataset', 'policy'].includes(record.kind), `${label}: invalid publication kind`);
    assert(record.doi === null || (typeof record.doi === 'string' && /^10\.\d{4,9}\/\S+$/.test(record.doi)), `${label}: invalid DOI`);
  } else {
    assert(text(record.title) && isDate(record.date) && strings(record.summary) && record.summary.length > 0,
      `${label}: title, date, and summary required`);
  }
}
async function checkPublicFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), `Public assets cannot be symlinks: ${entry.name}`);
    assert(entry.isFile() || entry.isDirectory(), `Unsupported public asset: ${entry.name}`);
    if (entry.isDirectory()) await checkPublicFiles(path.join(directory, entry.name));
  }
}
export async function loadContent(projectRoot = root) {
  const registry = await readFile(path.join(projectRoot, 'docs/sources.md'), 'utf8');
  const sources = new Set([...registry.matchAll(/^## ([a-z0-9-]+)$/gm)].map(match => match[1]));
  const site = JSON.parse(await readFile(path.join(projectRoot, 'content/site.json'), 'utf8'));
  keys(site, ['name', 'expandedName', 'institution', 'description', 'introduction', 'stage', 'origin', 'email', 'sourceIds', 'lastReviewed', 'homeImage', 'homeBanner'], 'site');
  for (const key of ['name', 'expandedName', 'institution', 'description']) assert(text(site[key]), `site: ${key} required`);
  assert(strings(site.introduction) && site.introduction.length > 0, 'site: introduction required');
  assert(['scaffold', 'preview', 'live'].includes(site.stage), 'site: stage must be scaffold, preview, or live');
  assert(site.origin === null || (isPublicUrl(site.origin) && new URL(site.origin).origin === site.origin), 'site: origin must be an HTTPS origin without trailing slash');
  assert(site.email === null || (typeof site.email === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(site.email)), 'site: invalid email');
  assert(site.stage !== 'live' || (site.origin && site.email), 'site: live builds require origin and email');
  provenance(site, sources, 'site', true);
  if (site.homeBanner !== null) {
    keys(site.homeBanner, ['src', 'alt', 'width', 'height'], 'site/homeBanner');
    assert(localImage(site.homeBanner.src) && text(site.homeBanner.alt), 'site/homeBanner: local image and alt text required');
    assert([site.homeBanner.width, site.homeBanner.height].every(n => Number.isInteger(n) && n > 0), 'site/homeBanner: positive image dimensions required');
    assert((await stat(path.join(projectRoot, 'public', site.homeBanner.src))).isFile(), 'site/homeBanner: image missing');
  }
  if (site.homeImage !== null) {
    keys(site.homeImage, ['src', 'stillSrc', 'alt', 'width', 'height'], 'site/homeImage');
    assert(localImage(site.homeImage.src) && localImage(site.homeImage.stillSrc) && !site.homeImage.stillSrc.endsWith('.gif') && text(site.homeImage.alt), 'site/homeImage: local animation, still image and alt text required');
    assert([site.homeImage.width, site.homeImage.height].every(n => Number.isInteger(n) && n > 0), 'site/homeImage: positive image dimensions required');
    assert((await stat(path.join(projectRoot, 'public', site.homeImage.stillSrc))).isFile(), 'site/homeImage: still image missing');
  }
  const result = { site };
  for (const kind of collections) {
    result[kind] = [];
    const names = (await readdir(path.join(projectRoot, 'content', kind))).filter(name => name.endsWith('.json')).sort();
    for (const name of names) {
      const record = JSON.parse(await readFile(path.join(projectRoot, 'content', kind, name), 'utf8'));
      validateRecord(kind, record, name, sources);
      if (kind === 'people' && record.image) {
        assert((await stat(path.join(projectRoot, 'public', record.image))).isFile(), `${name}: image missing`);
      }
      result[kind].push(record);
    }
  }
  const figures = [site.homeImage, ...result.projects.flatMap(p => p.figures)].filter(Boolean);
  for (const figure of figures) assert((await stat(path.join(projectRoot, 'public', figure.src))).isFile(), `${figure.src}: figure image missing`);
  const publicationIds = new Set(result.publications.filter(p => !p.draft).map(p => p.id));
  const dois = new Set();
  for (const p of result.publications.filter(p => !p.draft && p.doi)) {
    const doi = p.doi.toLowerCase();
    assert(!dois.has(doi), `Duplicate public DOI: ${p.doi}`);
    dois.add(doi);
  }
  for (const p of result.projects.filter(p => !p.draft)) {
    for (const id of p.publicationIds) assert(publicationIds.has(id), `${p.id}: missing or draft publication ${id}`);
    assert(!p.links.some(link => new URL(link.url, 'https://local.example').hostname === 'boblab.info'), `${p.id}: use a local project page or original resource, not the old site`);
  }
  await checkPublicFiles(path.join(projectRoot, 'public'));
  return result;
}
