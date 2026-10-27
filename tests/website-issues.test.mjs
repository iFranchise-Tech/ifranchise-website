import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catalogueOptions,filterBrands,startingInvestment} from '../lib/catalogue.mjs';
import {nationalPhoneInput,normalizePhone} from '../lib/contact-validation.mjs';
import {returnDetails,outletLabel} from '../lib/return-details.mjs';
import {editingIssues} from '../lib/cms/display.mjs';
const brands=JSON.parse(readFileSync(new URL('../content/brands.json',import.meta.url)));
test('catalogue choices come only from published brand data, with safe unknown investments',()=>{
 const list=[{name:'Alpha',category:'Retail',model:'FOFO',investment:20},{name:'Beta',category:'Food',models:['FICO'],investment:null},{name:'Gamma',category:'Food',model:'FOFO',investment:'Unavailable'}];
 const opts=catalogueOptions(list);assert.deepEqual(opts.sectors,['Food','Retail']);assert.deepEqual(opts.models.map(x=>x[0]),['FICO','FOFO']);assert(opts.suggestions.includes('Alpha'));assert(!opts.sectors.includes('Education'));
 for(const b of list.slice(1))assert.equal(startingInvestment(b),null);
 assert.deepEqual(filterBrands(list,{sector:'Retail',budget:'25',model:'FOFO',query:'alpha'}).map(b=>b.name),['Alpha']);
 assert.deepEqual(filterBrands(list,{budget:'25'}).map(b=>b.name),['Alpha']);
 assert.equal(catalogueOptions([]).budgets.length,0);
});
test('phone input preserves excess digits for correction and validation rejects them',()=>{
 for(const v of ['91234567890','09123456789','919123456789','+9191234567890']){const entered=nationalPhoneInput(v,'IN');assert.equal(entered,v.startsWith('+91')?v.slice(3):v);assert.throws(()=>normalizePhone(entered,'IN'));}
 assert.equal(nationalPhoneInput('+91 91234-56789','IN'),'9123456789');
 for(const [country,number,expected] of [['GB','07400123456','+447400123456'],['AU','0412345678','+61412345678'],['AE','0501234567','+971501234567'],['US','4155552671','+14155552671'],['FR','0612345678','+33612345678']]){
  assert.equal(normalizePhone(nationalPhoneInput(number,country),country),expected);
  assert.equal(nationalPhoneInput(number+'99',country),number+'99');assert.throws(()=>normalizePhone(number+'99',country));
 }
});
test('Odette MG and revenue share stay exact and complex legacy return conditions are preserved',()=>{
 const odette=brands.find(b=>b.slug==='odette'),r=returnDetails(odette);
 assert.equal(r.guarantee,'₹1.25 Lakhs per month');assert.equal(r.share,'12% Revenue Share (whichever is higher)');assert.equal(r.legacy,null);assert.equal(outletLabel(odette),'50+ outlets');
 const emori=brands.find(b=>b.slug==='emori');assert.equal(returnDetails(emori).legacy,emori.facts.returns);
 assert.equal(outletLabel({facts:{outlets:'22 Outlets (2025)'}}),'22 Outlets (2025)');assert.equal(outletLabel({outlets:1}),'1 outlet');assert.equal(outletLabel({}),null);assert.equal(outletLabel({outlets:7}),'7 outlets');
});
test('all structured return arrangements preserve values, periods and conditions',()=>{
 const t={arrangement:'higher',margin:12,guaranteeType:'amount',guarantee:125000,period:'monthly',note:'Excludes taxes'};
 const r=returnDetails({returnTerms:t});assert.equal(r.guarantee,'₹1,25,000 per month');assert.equal(r.share,'12% margin on sales (whichever is higher)');assert.equal(r.note,'Excludes taxes');
 assert.equal(returnDetails({returnTerms:{...t,arrangement:'share'}}).guarantee,null);
 assert.equal(returnDetails({returnTerms:{...t,arrangement:'minimum',guaranteeType:'percentage',guarantee:15,period:'annual'}}).guarantee,'15% of total investment per year');
 assert.equal(returnDetails({returnTerms:{...t,arrangement:'fixed'}}).fixed,'₹1,25,000 per month');
});
test('five-question and character limits apply to every FAQ editor, preserving unchanged legacy data',()=>{
 const rows=Array.from({length:5},(_,i)=>({q:'Question '+i,a:'Answer'}));
 for(const kind of ['franchises','articles','blogs','faqs']){
  const key=kind==='faqs'?'questions':'faqs';assert.deepEqual(editingIssues(kind,{[key]:rows}),[]);
  assert(editingIssues(kind,{[key]:[...rows,{q:'Sixth',a:'Answer'}]}).length);
  assert(editingIssues(kind,{[key]:[{q:'q'.repeat(101),a:'Answer'}]}).length);
  assert(editingIssues(kind,{[key]:[{q:'Question',a:'a'.repeat(401)}]}).length);
  assert(editingIssues(kind,{[key]:[{q:' Same? ',a:'A'},{q:'same?',a:'B'}]}).length);
  const legacy={[key]:[...rows,{q:'Sixth',a:'Answer'}]};assert.deepEqual(editingIssues(kind,{...legacy,title:'Only title changes'},legacy),[]);
 }
});

import {readReceipt} from '../lib/intake/receipt.mjs';
test('only a confirmed successful receipt can trigger the enquiry success flow',async()=>{
 assert.equal((await readReceipt(Response.json({received:true,reference:'IF-synthetic'}))).reference,'IF-synthetic');
 for(const response of [Response.json({received:false,error:'Try again'},{status:422}),Response.json({received:true,reference:'IF-synthetic'},{status:500}),Response.json({received:true}),Response.json(null),new Response('<html>Gateway error</html>',{status:502})])await assert.rejects(readReceipt(response));
});
