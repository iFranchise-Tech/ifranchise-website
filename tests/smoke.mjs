import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root = process.env.TEST_ORIGIN || 'http://127.0.0.1:3019';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(root).hostname), 'Local preview only');
const site = readFileSync(new URL('../lib/site.ts', import.meta.url), 'utf8');
const preview = /preview:\s*true/.test(site);
const siteUrl = (site.match(/url:\s*'([^']+)'/) || [])[1];
assert.ok(siteUrl);

const routes = ['/', '/franchise-opportunities', '/for-brands', '/contact-us', '/guides', '/privacy-policy', '/franchise/odette', '/franchise/emori', '/franchise/kasturi-creations', '/guides/franchise-models', '/guides/franchise-enquiry-checklist', '/guides/franchise-ready-brand'];

for (const path of routes) {
  const res = await fetch(root + path);
  assert.equal(res.status, 200, path);
  const html = await res.text();
  assert.match(html, /<h1[ >]/, path + ' h1');
  assert.match(html, /name="description"/, path + ' description');
  assert.match(html, /rel="canonical"/, path + ' canonical');
  if (preview) assert.match(html, /noindex/, path + ' preview protected');
  else assert.doesNotMatch(html, /noindex/, path + ' indexable in production mode');
  assert.doesNotMatch(html, /codex-preview|Starter Project/, path + ' starter removed');
  console.log('PASS ' + path + ' · server HTML and metadata');
}

const redirects = JSON.parse(readFileSync(new URL('../content/redirects.json', import.meta.url), 'utf8'));
const map = await (await fetch(root + '/sitemap.xml')).text();
for (const path of routes.filter((item) => !(item in redirects))) {
  assert.ok(map.includes(siteUrl + (path === '/' ? '' : path)), 'sitemap ' + path);
}

const robots = await (await fetch(root + '/robots.txt')).text();
if (preview) assert.match(robots, /Disallow: \/\s/);
else {
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Disallow: \/admin/);
}
assert.match(robots, new RegExp('Sitemap: ' + siteUrl.replace(/\./g, '\\.') + '/sitemap\\.xml'));

for (const asset of ['/assets/storefronts.webp', '/assets/wordmark.svg', '/assets/brandmark-purple.svg', '/assets/odette.webp', '/assets/emori.webp', '/assets/kasturi.webp']) {
  assert.equal((await fetch(root + asset)).status, 200, asset);
}

assert.equal((await fetch(root + '/franchise/not-a-brand')).status, 404);
assert.equal((await fetch(root + '/api/brochures/odette')).status, 410);
assert.equal((await fetch(root + '/brochures/odette.pdf')).status, 404);
console.log('PASS sitemap, robots, image assets, brochure gate and 404 route');
