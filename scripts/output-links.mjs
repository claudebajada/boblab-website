import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(target));
    else if (entry.name.endsWith('.html')) files.push(target);
  }
  return files;
}
export async function checkOutputLinks(output, basePath = '') {
  for (const file of await htmlFiles(output)) {
    const html = await readFile(file, 'utf8');
    const route = `${basePath}/${path.relative(output, file).split(path.sep).join('/')}`;
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https:|mailto:)/.test(value)) continue;
      const url = new URL(value.replaceAll('&amp;', '&'), `https://preview.invalid${route}`);
      const pathname = decodeURIComponent(url.pathname);
      if (basePath && pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
        throw new Error(`${route}: local URL escapes deployment base path: ${value}`);
      }
      let target = path.resolve(output, `.${pathname.slice(basePath.length) || '/'}`);
      if (!target.startsWith(`${path.resolve(output)}${path.sep}`) && target !== path.resolve(output)) {
        throw new Error(`Link leaves output: ${value}`);
      }
      try {
        if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
        if (!(await stat(target)).isFile()) throw new Error('not a file');
      } catch { throw new Error(`${route}: missing local target ${value}`); }
      if (url.hash && target.endsWith('.html')) {
        const ids = [...(await readFile(target, 'utf8')).matchAll(/id="([^"]+)"/g)].map(m => m[1]);
        if (!ids.includes(decodeURIComponent(url.hash.slice(1)))) throw new Error(`${route}: missing fragment ${value}`);
      }
    }
  }
}
