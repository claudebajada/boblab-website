// GitHub Actions supplies the real Pages URL; local builds need no configuration.
export function deployment(site, environment = process.env) {
  const configured = environment.SITE_URL || site.origin;
  if (!configured) return { origin: null, basePath: '' };
  const url = new URL(configured);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('SITE_URL must be an HTTPS site URL without credentials, query, or fragment');
  }
  const basePath = url.pathname.replace(/\/$/, '');
  if (basePath && !/^\/(?:[a-zA-Z0-9._-]+\/?)+$/.test(basePath)) throw new Error('Invalid Pages base path');
  return { origin: url.origin, basePath };
}

export function prefixLocalUrls(html, basePath) {
  if (!basePath) return html;
  return html.replace(/\b(href|src|action)="\/(?!\/)([^"]*)"/g,
    (_, attribute, suffix) => `${attribute}="${basePath}/${suffix}"`);
}
