import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';

const root = process.env.TEST_ORIGIN || 'http://127.0.0.1:3019';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(root).hostname), 'Local preview only');
const site = readFileSync(new URL('../lib/site.ts', import.meta.url), 'utf8');
const preview = /preview:\s*true/.test(site);
const siteUrl = (site.match(/url:\s*'([^']+)'/) || [])[1];
assert.ok(siteUrl);

const read = (name) => JSON.parse(readFileSync(new URL('../content/' + name + '.json', import.meta.url), 'utf8'));
const brands = read('brands');
const redirects = read('redirects');
const routes = [...new Set([...read('route-inventory').map((x) => x.path), '/franchise-solutions', '/insights', '/data-rights-request', '/for-brands', '/guides', '/guides/franchise-models', '/guides/franchise-enquiry-checklist', '/guides/franchise-ready-brand'])];

assert.equal(brands.length, 12);
assert.equal(read('blogs').length, 7);
assert.equal(read('knowledge').length, 16);

const errors = [];
for (let i = 0; i < routes.length; i += 4) {
  await Promise.all(routes.slice(i, i + 4).map(async (path) => {
    try {
      const r = await fetch(root + path);
      const html = await r.text();
      assert.equal(r.status, 200, path);
      assert.match(html, /<h1[ >]/);
      assert.match(html, /name="description"/);
      assert.match(html, /rel="canonical"/);
      if (preview) assert.match(html, /noindex/);
      assert.doesNotMatch(html, /Internal Server Error|Starter Project|John Doe|15,725/);
    } catch (e) {
      errors.push(path + ': ' + e.message);
    }
  }));
}
assert.deepEqual(errors, []);

for (const brand of brands) {
  assert(existsSync(new URL('../public' + brand.logo, import.meta.url)), brand.logo);
  for (const asset of brand.gallery) assert(existsSync(new URL('../public' + asset, import.meta.url)), asset);
}

// Public brochure PDFs were intentionally retired; downloads stay gated.
for (const brand of brands.filter((item) => item.brochure)) {
  assert.equal((await fetch(root + brand.brochure)).status, 404, brand.brochure);
  assert.equal((await fetch(root + '/api/brochures/' + brand.slug)).status, 410, brand.slug);
}

const map = await (await fetch(root + '/sitemap.xml')).text();
for (const path of ['/', '/franchise-opportunities', '/list-your-brand', '/contact-us', '/privacy-policy', '/franchise/odette']) {
  assert(map.includes(siteUrl + (path === '/' ? '' : path)), 'sitemap ' + path);
}

for (const [from, to] of Object.entries(redirects)) {
  const r = await fetch(root + from, {redirect: 'manual'});
  assert.equal(r.status, 308, from);
  assert.equal(r.headers.get('location'), to, from);
}

assert.equal((await fetch(root + '/not-an-existing-route')).status, 404);
assert.equal((await fetch(root + '/franchise/not-a-brand')).status, 404);
console.log('PASS ' + routes.length + ' server-rendered pages, 12 brands, gated brochures, sitemap, ' + Object.keys(redirects).length + ' redirects and 404s');
