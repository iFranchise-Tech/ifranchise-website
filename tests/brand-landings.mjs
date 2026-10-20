import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:3018';
const brands=JSON.parse(readFileSync('content/brands.json','utf8'));
for(const brand of brands){
 const response=await fetch(origin+'/franchise/'+brand.slug+'?journey=brand&brand=unrelated');
 assert.equal(response.status,200,brand.slug);
 const html=await response.text();
 assert(html.includes('data-brand-slug="'+brand.slug+'"'),brand.slug+' has its dedicated enquiry');
 assert.match(html,new RegExp('name="interest_slug" value="'+brand.slug+'"'),brand.slug+' preserves the CRM interest mapping');
 assert.equal((html.match(/<form\b/g)||[]).length,1,brand.slug+' has one embedded form');
 for(const field of ['name','phone','city','state','budget','timeframe','contactPermission'])assert(html.includes('name="'+field+'"'),brand.slug+' '+field);
 for(const anchor of ['overview','investment','gallery','questions','enquire'])assert(html.includes('id="'+anchor+'"'),brand.slug+' '+anchor);
 assert(html.includes('href="#enquire"'),brand.slug+' enquiry CTAs stay on-page');
 assert(!html.includes('form-toggle'),brand.slug+' cannot switch enquiry journeys');
 assert(html.includes('Online enquiries are currently paused.'),brand.slug+' indicates paused intake');
 assert(html.includes('p-detail-logo'),brand.slug+' uses the larger logo');
}
console.log('PASS all 12 landing pages: dedicated forms, brand mappings, inline CTA anchors, full enquiry fields and paused intake.');
