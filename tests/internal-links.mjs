import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const root = process.env.TEST_ORIGIN || 'http://127.0.0.1:3019';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(root).hostname), 'Local preview only');

const routes = JSON.parse(readFileSync('content/route-inventory.json')).map((x) => x.path);
const assets = new Set();
const links = new Set();
const errors = [];

for (const path of routes) {
  const html = await (await fetch(root + path)).text();
  for (const match of html.matchAll(/<(a|img)[^>]+(?:href|src)="([^"#]+)"/g)) {
    const u = match[2].replaceAll('&amp;', '&');
    if (u.startsWith('/') && !u.startsWith('//')) (match[1] === 'a' ? links : assets).add(u.split('#')[0]);
  }
}

for (const path of [...links, ...assets]) {
  // Retired public brochure PDFs are intentionally unavailable.
  if (/^\/brochures\/.+\.pdf$/i.test(path)) {
    const r = await fetch(root + path, {method: 'HEAD'});
    if (r.status !== 404) errors.push({path, status: r.status, expected: 404});
    continue;
  }
  const r = await fetch(root + path, {method: 'HEAD'});
  if (r.status !== 200) errors.push({path, status: r.status});
}

assert.deepEqual(errors, []);
console.log('PASS ' + links.size + ' internal links and ' + assets.size + ' visible assets');
