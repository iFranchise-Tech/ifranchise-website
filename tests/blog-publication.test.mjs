import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isBlogPublished} from '../lib/blog-publication.mjs';

const blogs=JSON.parse(readFileSync(new URL('../content/cms-blogs.json',import.meta.url),'utf8'));
const visibleAt=instant=>blogs.filter(blog=>isBlogPublished(blog,Date.parse(instant))).map(blog=>blog.slug);

test('the November publication schedule uses the supplied authors and dates',()=>{
 assert.deepEqual(blogs.map(({slug,author,date})=>[slug,author,date]),[
  ['top-9-clothing-franchise-opportunities-in-india','Prajjwal Negi','2026-11-11'],
  ['how-to-start-a-clothing-franchise-in-india','Sneha Mahajan','2026-11-11'],
  ['how-much-does-a-premium-clothing-franchise-cost-in-india','Sneha Mahajan','2026-11-17'],
  ['how-the-franchise-business-model-works','Sneha Mahajan','2026-11-19'],
  ['how-to-franchise-your-clothing-brand-in-india','Sneha Mahajan','2026-11-23'],
 ]);
 assert.equal(visibleAt('2026-11-16T18:29:59.999Z').length,2);
 assert.equal(visibleAt('2026-11-16T18:30:00.000Z').length,3);
});

test('scheduled blogs become available exactly at midnight IST, without changing their data',()=>{
 for(const [date,slug,total] of [
  ['2026-11-19','how-the-franchise-business-model-works',4],
  ['2026-11-23','how-to-franchise-your-clothing-brand-in-india',5],
 ]){
  const release=Date.parse(`${date}T00:00:00+05:30`);
  const blog=blogs.find(item=>item.slug===slug);
  assert.equal(isBlogPublished(blog,release-1),false);
  assert.equal(isBlogPublished(blog,release),true);
  assert.equal(blogs.filter(item=>isBlogPublished(item,release)).length,total);
 }
});

test('publication dates are independent of the server timezone and remain available afterward',()=>{
 const blog={date:'2026-11-19'};
 assert.equal(isBlogPublished(blog,Date.parse('2026-11-18T18:30:00Z')),true);
 assert.equal(isBlogPublished(blog,Date.parse('2026-11-18T13:30:00-05:00')),true);
 assert.equal(isBlogPublished(blog,Date.parse('2027-01-01T00:00:00Z')),true);
});

test('missing or invalid dates do not accidentally publish a blog',()=>{
 for(const date of [undefined,'','19-11-2026','2026-02-30','2026-13-01','2026-11-19T00:00:00Z']){
  assert.equal(isBlogPublished({date},Date.parse('2027-01-01T00:00:00Z')),false);
 }
 assert.equal(isBlogPublished({date:'2028-02-29'},Date.parse('2028-02-29T00:00:00Z')),true);
});
