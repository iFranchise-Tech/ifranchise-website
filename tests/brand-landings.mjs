import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:3019';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'Local preview only');
const brands = JSON.parse(readFileSync('content/brands.json', 'utf8'));

for (const brand of brands) {
  const response = await fetch(origin + '/franchise/' + brand.slug + '?journey=brand&brand=unrelated');
  assert.equal(response.status, 200, brand.slug);
  const html = await response.text();
  assert(html.includes('data-brand-slug="' + brand.slug + '"'), brand.slug + ' has its dedicated enquiry');
  assert.equal((html.match(/<form\b/g) || []).length, 1, brand.slug + ' has one embedded form');
  for (const field of ['name', 'email', 'phone', 'city', 'state', 'budget', 'timeframe', 'enquiryConsent']) {
    assert(html.includes('name="' + field + '"'), brand.slug + ' ' + field);
  }
  assert(!html.includes('name="interest_slug"'), brand.slug + ' does not expose the retired CRM interest field');
  for (const anchor of ['overview', 'investment', 'gallery', 'questions', 'enquire']) {
    assert(html.includes('id="' + anchor + '"'), brand.slug + ' ' + anchor);
  }
  assert(html.includes('href="#enquire"'), brand.slug + ' enquiry CTAs stay on-page');
  assert(!html.includes('form-toggle'), brand.slug + ' cannot switch enquiry journeys');
  assert(!html.includes('Online enquiries are currently paused.'), brand.slug + ' keeps website intake open');
  assert(html.includes('brand-profile'), brand.slug + ' uses the brand profile layout');
  assert(html.includes('profile-logo'), brand.slug + ' shows the brand logo');
  assert(html.includes('href="/franchise-opportunities"'), brand.slug + ' links back to the catalogue');
  assert.equal((await fetch(origin + '/api/brochures/' + brand.slug)).status, 410, brand.slug + ' brochure API stays closed');
  if (brand.brochure) assert.equal((await fetch(origin + brand.brochure)).status, 404, brand.brochure);
}

console.log('PASS all ' + brands.length + ' landing pages: dedicated forms, current intake fields, inline CTA anchors and gated brochures.');
