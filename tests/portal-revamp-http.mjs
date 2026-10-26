// Synthetic fixtures only, against the local production Worker.
import assert from 'node:assert/strict';
const base='http://127.0.0.1:3028',stamp=Date.now();
const headers=(email,id)=>({'oai-authenticated-user-email':email,'oai-authenticated-user-id':id,Origin:base,'Content-Type':'application/json'}),owner=headers('preview@ifranchise.in','local_seedy');
async function api(h,path='',body,status=200){const r=await fetch(base+'/api/admin'+path,{headers:h,method:body?'POST':'GET',body:body?JSON.stringify(body):undefined}),d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d}
const change=async(h,r,action,payload,status=200)=>(await api(h,'',{action,kind:r.kind,slug:r.slug,version:r.version,...(payload?{payload}:{})},status)).record;
const person='qa-matrix-'+stamp+'@ifranchise.in';await api(owner,'',{action:'member',version:0,payload:{name:'Local mixed-access test',email:person,role:'editor',scopes:['franchises','jobs','articles'],permissions:{franchises:{view:true,edit:true,approve:true},jobs:{view:true,edit:false,approve:false},articles:{view:true,edit:false,approve:false}},manager:'preview@ifranchise.in',status:'invited'}});
const mixed=headers(person,'matrix-'+stamp);await api(mixed);
await api(mixed,'?kind=jobs');await api(mixed,'?kind=videos',undefined,403);await api(mixed,'?view=industries');
const job=(await api(owner,'?kind=jobs')).records[0];const jr=(await api(owner,'?id='+job.id)).record;await change(mixed,jr,'save',jr.draft,403);
let brand=(await api(owner,'?id=franchises:odette')).record,original=brand.draft;
const draft={...original,description:'Synthetic preview description',models:['FICO','FOFO'],brochureEnabled:false,faqs:Array.from({length:5},(_,i)=>({q:i?'Synthetic question '+i+'?':'Synthetic brand question?',a:'Synthetic answer.'}))};
const preview=await api(mixed,'',{action:'preview',kind:'franchises',payload:draft});const html=await(await fetch(base+preview.url,{headers:mixed})).text();assert(html.includes('Synthetic preview description'));assert(html.includes('Synthetic brand question?'));assert(html.includes('p-header'));assert(html.includes('p-footer'));assert(!html.includes('data-brochure-request'));assert(html.includes('FICO / FOFO'));assert(!html.includes('Brand information sources'));
assert.equal((await api(owner,'?id='+brand.id)).record.version,brand.version,'preview must not save a draft');
assert.equal((await fetch(base+preview.url)).status,404,'previews require authentication');
await api(mixed,'',{action:'preview',kind:'jobs',payload:jr.draft},403);
brand=await change(mixed,brand,'save-publish',draft);assert.equal(brand.status,'published');assert.equal(brand.submittedBy,null);assert.equal(brand.live.models.length,2);
assert.equal((await fetch(base+'/api/brochures/odette',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'})).status,410);
brand=await change(mixed,brand,'save-publish',original);
assert.equal((await fetch(base+'/api/brochures/odette',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'})).status,410);
assert.equal((await fetch(base+'/brochures/odette.pdf')).status,404);assert.equal((await fetch(base+'/api/brochures/odette')).status,410);
const industries=await api(owner,'?kind=industries'),inUse=(await api(owner,'?id='+industries.records.find(i=>i.title===original.category).id)).record;await change(owner,inUse,'archive',null,422);
let industry=(await api(owner,'',{action:'save-publish',kind:'industries',slug:'qa-industry-'+stamp,version:0,payload:{slug:'qa-industry-'+stamp,title:'Synthetic industry '+stamp}})).record;assert((await api(mixed,'?view=industries')).industries.some(i=>i.slug===industry.slug));industry=await change(owner,industry,'archive');assert(!((await api(mixed,'?view=industries')).industries.some(i=>i.slug===industry.slug)));
for(const id of ['pages:homepage','faqs:homepage','faqs:list-your-brand','faqs:opportunities','faqs:contact-us','faqs:general','placements:franchises']){const record=(await api(owner,'?id='+id)).record;const p=await api(owner,'',{action:'preview',kind:record.kind,payload:record.draft});const r=await fetch(base+p.url,{headers:owner}),page=await r.text();assert.equal(r.status,200,id);assert(page.includes('p-footer'),id+' complete footer');assert(page.includes('p-header'),id+' complete header');}
const template=(await api(owner,'?kind=articles')).blank;
let blog=(await api(owner,'',{action:'save-publish',kind:'blogs',slug:'qa-blog-'+stamp,version:0,payload:{...template,slug:'qa-blog-'+stamp,title:'Synthetic blog',excerpt:'Synthetic summary',image:'/assets/brandmark-purple.svg',imageAlt:'Synthetic image',introHighlight:'Synthetic intro',sections:[{heading:'Synthetic section',body:['Synthetic body.'],bullets:[]}]}})).record;assert.equal((await fetch(base+'/resources/blogs/'+blog.slug)).status,200);await change(owner,blog,'archive');assert.equal((await fetch(base+'/resources/blogs/'+blog.slug)).status,404);
const videoTemplate=(await api(owner,'?kind=videos')).blank;let video=(await api(owner,'',{action:'save-publish',kind:'videos',slug:'qa-video-'+stamp,version:0,payload:{...videoTemplate,slug:'qa-video-'+stamp,title:'Synthetic video',excerpt:'Synthetic video description',youtubeUrl:'https://www.youtube.com/watch?v=abcdefghijk'}})).record;assert.equal((await fetch(base+'/resources/videos/'+video.slug)).status,200);await change(owner,video,'archive');
await api(owner,'',{action:'save-publish',kind:'videos',slug:'qa-invalid-video',version:0,payload:{...videoTemplate,slug:'qa-invalid-video',title:'Test',excerpt:'Test',youtubeUrl:'https://attacker.invalid/video'}},422);
for(const path of ['/resources','/resources/blogs','/resources/articles','/resources/faqs','/resources/videos','/contact-us','/list-your-brand','/privacy-policy'])assert.equal((await fetch(base+path)).status,200,path);
assert.equal((await fetch(base+'/privacy-and-terms',{redirect:'manual'})).headers.get('location'),'/privacy-policy');
console.log('PASS: individual access, direct publication, preview isolation and complete pages, brand FAQs/models, taxonomy management, brochure visibility and gate, legacy PDF blocked, blogs/videos CRUD and redirects.');
