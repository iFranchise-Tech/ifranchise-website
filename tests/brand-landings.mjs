import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:3019';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'Local preview only');
const brands = JSON.parse(readFileSync('content/brands.json', 'utf8'));
const sitemap = await (await fetch(origin + '/sitemap.xml')).text();
assert(!sitemap.includes('/franchise/'), 'sitemap contains no legacy brand URLs');

for (const brand of brands) {
  const response = await fetch(origin + '/franchise-opportunities/' + brand.slug + '?journey=brand&brand=unrelated');
  assert.equal(response.status, 200, brand.slug);
  const html = await response.text();
  assert(html.includes('rel="canonical" href="https://www.ifranchise.in/franchise-opportunities/' + brand.slug + '"'), brand.slug + ' canonical URL');
  assert(sitemap.includes('/franchise-opportunities/' + brand.slug + '</loc>'), brand.slug + ' in sitemap');
  assert(!/href="[^"\s]*\/franchise\//.test(html), brand.slug + ' has no legacy links');
  for (const suffix of ['', '/thank-you']) {
    const legacy = await fetch(origin + '/franchise/' + brand.slug + suffix + '?utm_source=search&tag=one&tag=two', {redirect:'manual'});
    assert.equal(legacy.status, 308, brand.slug + suffix + ' permanent redirect');
    const target = new URL(legacy.headers.get('location'), origin);
    assert.equal(target.pathname, '/franchise-opportunities/' + brand.slug + suffix);
    assert.equal(target.searchParams.get('utm_source'), 'search');
    assert.deepEqual(target.searchParams.getAll('tag'), ['one','two']);
  }
  const confirmation = await fetch(origin + '/franchise-opportunities/' + brand.slug + '/thank-you');
  assert.equal(confirmation.status, 200, brand.slug + ' confirmation');
  assert((await confirmation.text()).includes('noindex'), brand.slug + ' confirmation stays private from indexing');
  assert(html.includes('data-brand-slug="' + brand.slug + '"'), brand.slug + ' has its dedicated enquiry');
  assert.equal((html.match(/<form\b/g) || []).length, 1, brand.slug + ' has one embedded form');
  for (const field of ['name', 'email', 'phone', 'city', 'state', 'budget', 'timeframe', 'enquiryConsent']) {
    assert(html.includes('name="' + field + '"'), brand.slug + ' ' + field);
  }
  assert(!html.includes('name="interest_slug"'), brand.slug + ' does not expose the retired CRM interest field');
  for (const anchor of ['overview', 'investment', 'gallery', 'questions', 'enquire']) {
    assert(html.includes('id="' + anchor + '"'), brand.slug + ' ' + anchor);
  }
  assert(html.includes('id="enquire" class="brand-enquiry-card is-sticky"'), brand.slug + ' keeps the enquiry panel on-page');
  assert(html.includes('id="brand-enquiry-title"'), brand.slug + ' enquiry panel has its accessible title');
  assert(!html.includes('form-toggle'), brand.slug + ' cannot switch enquiry journeys');
  assert(!html.includes('Online enquiries are currently paused.'), brand.slug + ' keeps website intake open');
  assert(html.includes('brand-profile'), brand.slug + ' uses the brand profile layout');
  assert(html.includes('profile-logo'), brand.slug + ' shows the brand logo');
  assert(html.includes('href="/franchise-opportunities"'), brand.slug + ' links back to the catalogue');
  assert.equal((await fetch(origin + '/api/brochures/' + brand.slug)).status, 410, brand.slug + ' brochure API stays closed');
  if (brand.brochure) assert.equal((await fetch(origin + brand.brochure)).status, 404, brand.brochure);
}

for (const path of ['/franchise-opportunities/no-such-brand', '/franchise-opportunities/no-such-brand/thank-you', '/franchise/no-such-brand']) {
  assert.equal((await fetch(origin + path)).status, 404, path + ' rejects unknown brands');
}
console.log('PASS all ' + brands.length + ' landing pages: canonical URLs, legacy redirects, sitemap, confirmations, unknown-brand handling, dedicated enquiry panels and gated brochures.');
