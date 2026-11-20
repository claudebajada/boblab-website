import { loadContent, collections, root } from './content.mjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

try {
  const data = await loadContent();
  const routes = JSON.parse(await readFile(path.join(root, 'docs/legacy-urls.json'), 'utf8'));
  const supported = new Set(['/', '/our-team/', '/projects/', '/publications/', '/contact-us/']);
  for (const route of routes) {
    if (!supported.has(route.to) || !['retain', 'html-redirect'].includes(route.action)) {
      throw new Error(`Invalid migration mapping: ${JSON.stringify(route)}`);
    }
  }
  console.log(`Content valid (${data.site.stage}): ${collections.map(k => `${k}: ${data[k].length}`).join(', ')}.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
