import test from 'node:test';
import assert from 'node:assert/strict';
import { deployment, prefixLocalUrls } from '../scripts/deployment.mjs';

test('Pages path prefixes do not alter external or same-page links', () => {
  const config = deployment({ origin: null }, { SITE_URL: 'https://claudebajada.github.io/boblab-website/' });
  assert.deepEqual(config, { origin: 'https://claudebajada.github.io', basePath: '/boblab-website' });
  assert.equal(prefixLocalUrls('<a href="/projects/#tools">Tools</a><a href="#main">Skip</a><a href="https://example.com/">External</a>', config.basePath), '<a href="/boblab-website/projects/#tools">Tools</a><a href="#main">Skip</a><a href="https://example.com/">External</a>');
  assert.throws(() => deployment({}, { SITE_URL: 'http://example.com/' }), /HTTPS/);
  assert.throws(() => deployment({}, { SITE_URL: 'https://example.com/?query=yes' }), /without/);
});
