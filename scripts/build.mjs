import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, root } from './content.mjs';
import { checkOutputLinks } from './output-links.mjs';
import { deployment, prefixLocalUrls } from './deployment.mjs';
import { composePages, escapeHtml as e, arrow, duckDiscovery } from './render.mjs';
import { structuredData } from './structured-data.mjs';
export { composePages, escapeHtml } from './render.mjs';

export async function build(projectRoot = root, environment = process.env) {
  const data = await loadContent(projectRoot);
  const { site } = data;
  const { origin, basePath } = deployment(site, environment);
  const pages = composePages(data);
  const shell = await readFile(path.join(projectRoot, 'src/templates/page.html'), 'utf8');
  const output = path.join(projectRoot, 'dist');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await cp(path.join(projectRoot, 'public'), output, { recursive: true });
  const notFound = { route: '/404.html', label: 'Page not found', pageClass: 'not-found', body: '<div class="wrap section page-intro"><h1>Page not found</h1><p>Check the address or use the main navigation.</p><a class="button-link" href="/">Back to the homepage</a></div>' };
  const aliases = [{ route: '/our-team-1/', label: 'People', pageClass: 'people-page', body: '<div class="wrap section page-intro"><h1>People</h1><p><a class="button-link" href="/our-team/">Meet the people</a></p></div>', canonicalRoute: '/our-team/' }];
  for (const page of [...pages, notFound, ...aliases]) {
    const values = {
      title: e(`${page.label} | ${site.name}`), description: e(page.description || site.description),
      name: e(site.name), expandedName: e(site.expandedName), institution: e(site.institution), email: e(site.email || ''), arrow,
      pageClass: e(page.pageClass), robots: site.stage !== 'live' || page.route === '/404.html' || page.canonicalRoute ? 'noindex, nofollow' : 'index, follow',
      canonical: origin && page.route !== '/404.html' ? `<link rel="canonical" href="${e(origin + basePath + (page.canonicalRoute || page.route))}">` : '',
      redirect: page.canonicalRoute ? `<meta http-equiv="refresh" content="0; url=${e(basePath + page.canonicalRoute)}">` : '',
      structuredData: structuredData(site, page, origin, basePath),
      navigation: pages.filter(p => !p.navigationRoute).map(p => `<a href="${p.route}"${p.route === (page.navigationRoute || page.route) ? ' aria-current="page"' : ''}>${e(p.label)}</a>`).join('\n'),
      notice: site.stage === 'scaffold' ? '<aside class="notice wrap">Scaffold preview. Content migration and final design are still in progress.</aside>' : '',
      body: page.body, footerDuck: duckDiscovery('pond', 'footer-duck'),
    };
    const html = prefixLocalUrls(shell.replace(/\{\{([a-zA-Z]+)\}\}/g, (_, key) => {
      if (!(key in values)) throw new Error(`Unknown template field: ${key}`);
      return values[key];
    }), basePath);
    const target = path.join(output, page.route === '/404.html' ? '404.html' : `${page.route}index.html`);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, html);
  }
  const live = site.stage === 'live';
  await writeFile(path.join(output, '.nojekyll'), '');
  await writeFile(path.join(output, 'robots.txt'), live && origin ? `User-agent: *\nAllow: /\nSitemap: ${origin}${basePath}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
  if (live && origin) await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p => `<url><loc>${e(origin + basePath + p.route)}</loc></url>`).join('')}</urlset>\n`);
  await checkOutputLinks(output, basePath);
  console.log(`Built ${pages.length} pages, legacy team alias and 404; local links valid (${basePath || '/'}). Output: ${output}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().catch(error => { console.error(error.message); process.exitCode = 1; });
}
