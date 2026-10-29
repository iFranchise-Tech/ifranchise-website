// Targets the retained Sites preview identity. It does not authenticate against the Cloudflare Access worker.
// Runs only against a disposable local preview database.
import assert from 'node:assert/strict';
const base=process.env.CMS_TEST_ORIGIN||'http://127.0.0.1:3028';if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(base))throw new Error('Local preview only');
const testSlug='cms-qa-role-'+Date.now();
const auth={'oai-authenticated-user-email':'preview@ifranchise.in','oai-authenticated-user-id':'local_seedy','Origin':base,'Content-Type':'application/json'};
async function api(path='',body,expected=200,headers=auth){const r=await fetch(base+'/api/admin'+path,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined});const raw=await r.text();let d;try{d=JSON.parse(raw)}catch{d={error:raw.slice(0,500)}};assert.equal(r.status,expected,JSON.stringify(d));return d;}
const change=async(r,action,extra={},status=200)=>(await api('',{action,kind:r.kind,slug:r.slug,version:r.version,...extra},status)).record;
await api('',undefined,401,{});await api('',{action:'save-publish'},403,{...auth,'Origin':'https://evil.test'});
const overview=await api();assert.equal(overview.me.role,'super_admin');
const original=(await api('?id=franchises:odette')).record;
let r=await change(original,'save',{payload:{...original.draft,description:original.draft.description+' Local test.'}});
assert.equal(r.live.description,original.live.description);assert.equal(r.status,'draft');
await change(original,'save-publish',{payload:r.draft},409);
await change(r,'save-publish',{payload:{...r.draft,name:''}},422);
assert.equal((await api('?id='+r.id)).record.version,r.version,'invalid publish must not save any changes');
r=await change(r,'save-publish',{payload:original.draft});assert.equal(r.status,'published');assert.equal(r.version,original.version+2);assert.equal(r.submittedBy,null);
// An older client submitting a publisher's draft must also process immediately.
r=await change(r,'save',{payload:r.draft});r=await change(r,'submit');assert.equal(r.status,'published');
const jobTemplate=(await api('?kind=jobs')).blank;
let job=(await api('',{action:'save',kind:'jobs',slug:testSlug,version:0,payload:{...jobTemplate,slug:testSlug,title:'Local CMS QA role',dept:'Testing',location:'Remote',aboutRole:'Local test only',responsibilities:['Test publishing'],requirements:['Test restores']}})).record;
assert.equal((await fetch(base+'/careers/'+testSlug)).status,404);
job=await change(job,'publish');assert.equal(job.status,'published');
let page=await fetch(base+'/careers/'+testSlug);assert.equal(page.status,200);assert.match(await page.text(),/Local CMS QA role/);
job=await change(job,'archive');assert.equal(job.status,'archived');assert.equal((await fetch(base+'/careers/'+testSlug)).status,404);
job=await change(job,'restore');assert.equal(job.status,'draft');assert.equal(job.live,null);
job=await change(job,'save-publish',{payload:job.draft});assert.equal(job.status,'published');
let order=(await api('?id=placements:franchises')).record;const initialOrder=order.draft;const ids=[...order.draft.ids].reverse();
await change(order,'save-publish',{payload:{...order.draft,ids:[...ids,'not-a-real-brand']}},422);
order=await change(order,'save-publish',{payload:{...order.draft,ids}});assert.equal(order.status,'published');
const catalogue=await (await fetch(base+'/franchise-opportunities')).text();const first=catalogue.indexOf('opportunity-card');assert.ok(catalogue.slice(first,first+800).includes('/franchise/'+ids[0]));
await change(order,'save-publish',{payload:initialOrder});await change(job,'archive');
for(const id of ['pages:homepage','faqs:homepage']){const p=(await api('?id='+id)).record;const next=await change(p,'save-publish',{payload:p.draft});assert.equal(next.status,'published');assert.equal(next.version,p.version+1);}
const badMember={name:'Personal email',email:'bad@gmail.com',role:'editor',scopes:['articles'],manager:overview.me.email,status:'invited'};
await api('',{action:'member',version:0,payload:badMember},422);
console.log('PASS: Super Admin direct save/publish, optional drafts, atomic validation, edit conflicts, legacy submit, direct archive, restore, public pages, brand order, homepage/FAQs, authentication, CSRF, work email restrictions.');
