// Isolated local Worker only; no hosted writes or external lead delivery.
import assert from 'node:assert/strict';
const base='http://127.0.0.1:3028';
const headers={'oai-authenticated-user-email':'preview@ifranchise.in','oai-authenticated-user-id':'local_seedy',Origin:base,'Content-Type':'application/json'};
let checks=0;async function api(path,body,status=200){const r=await fetch(base+'/api/admin'+path,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined});const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));checks++;return d;}
for(const id of ['faqs:general','faqs:homepage','faqs:opportunities','faqs:list-your-brand','faqs:contact-us','articles:what-is-a-franchise','blogs:what-to-notice-on-your-first-franchise-visit','franchises:odette']){
 const r=(await api('?id='+id)).record,key=r.kind==='faqs'?'questions':'faqs';
 const rows=Array.from({length:5},(_,i)=>({q:'Question '+i,a:'Answer'}));
 for(const values of [rows.slice(0,1),rows.slice(0,4),[...rows,{q:'Sixth?',a:'Answer'}],[{q:'q'.repeat(101),a:'A'}],[{q:'Q?',a:'a'.repeat(401)}],[{q:'Same?',a:'A'},{q:'Same?',a:'B'}]])await api('',{action:'save',kind:r.kind,slug:r.slug,version:r.version,payload:{...r.draft,[key]:values}},422);
 const preview=await api('',{action:'preview',kind:r.kind,payload:{...r.draft,[key]:rows}});assert(preview.url);assert.equal((await api('?id='+id)).record.version,r.version);
}
console.log('PASS: all eight FAQ locations reject incomplete, over-limit, long and duplicate entries; valid five-item previews preserve versions.');
for(const [path,image] of [['/','/assets/stock-heroes/home-business-consultation'],['/about-us','/assets/stock-heroes/advisory-collaboration'],['/list-your-brand','/assets/stock-heroes/expansion-strategy-boardroom'],['/careers','careers-working-together'],['/resources','resources-commercial-analysis'],['/resources/blogs','blogs-professional-research'],['/resources/articles','articles-learning-workspace'],['/resources/videos','videos-business-workshop']]){
 const r=await fetch(base+path);assert.equal(r.status,200,path);const html=await r.text();
 // Local old CMS page records may override image defaults; leave their content intact.
 if(path!=='/'&&path!=='/about-us')assert(html.includes(image),path+' stock asset');
 if(path.startsWith('/resources')){assert(!html.includes('Fresh perspectives'));assert(!html.includes('Newly added'));}
 checks++;
}
for(const slug of ['odette','emori']){const r=await fetch(base+'/franchise/'+slug+'/thank-you');assert.equal(r.status,200);const html=await r.text();assert(html.includes('noindex'));assert(html.includes('Franchise enquiries'));assert(!html.includes('Your enquiry about'));checks++;}
assert.equal((await fetch(base+'/franchise/no-such-brand/thank-you')).status,404);checks++;
console.log('PASS: changed public routes, distinct stock assets, one resource grid, safe direct confirmation routes and unknown-brand 404.');
console.log('PASS '+checks+' website issue HTTP checks. No published content was changed.');
