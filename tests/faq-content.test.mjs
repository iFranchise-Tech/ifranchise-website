import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {completeFaqs,pageFaqs,resourceFaqs} from '../lib/faq-content.mjs';
import {hydrateBrand} from '../lib/cms/catalogue-fields.mjs';
import {editingIssues} from '../lib/cms/display.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../content/'+name,import.meta.url)));
test('all imported brands and editorial resources display five unique, nonempty questions',()=>{
 const brands=read('brands.json'),articles=read('editorial.json');
 for(const [slug,rows] of [...brands.map(b=>[b.slug,hydrateBrand(b).faqs]),...articles.map(a=>[a.slug,resourceFaqs(a)])]){
  assert.equal(rows.length,5,slug);assert.equal(new Set(rows.map(q=>q.q.toLowerCase())).size,5,slug);
  assert(rows.every(q=>q.q.trim()&&q.a.trim()),slug);
 }
});
test('resource additions are complete source sentences and respect editor character limits',()=>{
 for(const article of read('editorial.json')){
  const original=article.faqs;const rows=resourceFaqs(article);
  assert.deepEqual(rows.slice(0,original.length),original,article.slug);
  for(const row of rows.slice(original.length)){assert(row.q.length<=100,article.slug);assert(row.a.length<=400,article.slug);assert(/[.!?]$/.test(row.a),article.slug);}
 }
});
test('page sections show five; absent resource FAQ sections stay absent',()=>{
 for(const slug of ['homepage','opportunities','list-your-brand','contact-us','general'])assert.equal(pageFaqs(slug).length,5);
 for(const blog of read('cms-blogs.json'))assert.deepEqual(resourceFaqs(blog),[]);
 assert.deepEqual(resourceFaqs({sections:[]}),[]);
});
test('custom answers are retained, excess display entries are capped without mutating the stored data',()=>{
 const rows=Array.from({length:7},(_,i)=>({q:'Custom '+i+'?',a:'Answer '+i+'.'}));const saved=JSON.stringify(rows);
 assert.deepEqual(completeFaqs(rows),rows.slice(0,5));assert.equal(JSON.stringify(rows),saved);
 const b={name:'Custom brand',budget:'On request',model:'FICO',faqs:rows.slice(0,1)};
 assert.deepEqual(hydrateBrand(b).faqs[0],b.faqs[0]);assert.equal(hydrateBrand(b).faqs.length,5);
});
test('new FAQ edits require exactly five across all editors, with optional empty resource FAQs',()=>{
 for(const kind of ['franchises','faqs','blogs','articles']){
  const key=kind==='faqs'?'questions':'faqs';
  for(const count of [1,2,3,4,6])assert(editingIssues(kind,{[key]:Array.from({length:count},(_,i)=>({q:'Q'+i,a:'A'}))}).some(s=>s.includes('exactly 5')),kind+' '+count);
  assert.equal(editingIssues(kind,{[key]:Array.from({length:5},(_,i)=>({q:'Q'+i,a:'A'}))}).length,0);
 }
 for(const kind of ['blogs','articles'])assert.deepEqual(editingIssues(kind,{faqs:[]}),[]);
});
