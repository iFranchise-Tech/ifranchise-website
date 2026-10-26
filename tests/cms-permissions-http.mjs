// Production Worker contract tested locally; never target a hosted URL with test identity headers.
import assert from 'node:assert/strict';
const base='http://127.0.0.1:3028';
const headers=(email,id)=>({'oai-authenticated-user-email':email,'oai-authenticated-user-id':id,'Origin':base,'Content-Type':'application/json'});
const superHeaders=headers('preview@ifranchise.in','local_seedy');const stamp=Date.now();
async function api(h,path='',body,status=200){const r=await fetch(base+'/api/admin'+path,{method:body?'POST':'GET',headers:h,body:body?JSON.stringify(body):undefined});const raw=await r.text();let d;try{d=JSON.parse(raw)}catch{d={error:raw.slice(0,400)}}assert.equal(r.status,status,JSON.stringify(d));return d;}
const change=async(h,r,action,extra={},status=200)=>(await api(h,'',{action,kind:r.kind,slug:r.slug,version:r.version,...extra},status)).record;
await api({},'',undefined,401);await api(headers('personal@gmail.com','p'),'',undefined,403);await api(headers('uninvited@ifranchise.in','u'),'',undefined,403);
const owner=(await api(superHeaders)).me;
const managerEmail='qa-manager-'+stamp+'@ifranchise.in',editorEmail='qa-author-'+stamp+'@ifranchise.in',hrEmail='qa-hr-'+stamp+'@ifranchise.in',viewerEmail='qa-viewer-'+stamp+'@ifranchise.in',otherEmail='qa-other-'+stamp+'@ifranchise.in';
async function invite(email,role,scopes,manager){return api(superHeaders,'',{action:'member',version:0,payload:{email,name:'Local test '+role,role,scopes,manager,status:'invited'}})}
await invite(managerEmail,'approver',['articles'],owner.email);const mh=headers(managerEmail,'manager-'+stamp);await api(mh);
await invite(editorEmail,'editor',['articles'],managerEmail);const eh=headers(editorEmail,'editor-'+stamp);await api(eh);
await invite(hrEmail,'approver',['jobs'],owner.email);const hh=headers(hrEmail,'hr-'+stamp);await api(hh);
await invite(viewerEmail,'viewer',['articles'],managerEmail);const vh=headers(viewerEmail,'viewer-'+stamp);await api(vh);
await invite(otherEmail,'approver',['articles'],owner.email);const oh=headers(otherEmail,'other-'+stamp);await api(oh);
await api(eh,'?kind=jobs',undefined,403);await api(hh,'?kind=articles',undefined,403);await api(eh,'?view=team',undefined,403);
const orig=(await api(eh,'?id=articles:what-is-a-franchise')).record;
for(const action of ['save','save-publish','publish','archive'])await change(vh,orig,action,{payload:orig.draft},403);
await change(eh,orig,'save-publish',{payload:orig.draft},403);await change(hh,orig,'save-publish',{payload:orig.draft},403);
let r=await change(eh,orig,'save',{payload:{...orig.draft,title:'Local editorial approval test'}});assert.equal(r.status,'draft');assert.equal(r.live.title,orig.live.title);
r=await change(eh,r,'submit');assert.equal(r.status,'review');
await change(eh,r,'save',{payload:r.draft},409);await change(eh,r,'publish',{},403);await change(hh,r,'publish',{},403);await change(oh,r,'publish',{},403);
await change(mh,r,'reject',{},422);r=await change(mh,r,'reject',{note:'Revise the title.'});assert.equal(r.status,'changes');
r=await change(eh,r,'save',{payload:orig.draft});r=await change(eh,r,'submit');r=await change(mh,r,'publish');assert.equal(r.status,'published');
// A publisher's own edits save and publish atomically, without a submission event.
const priorHistory=(await api(mh,'?id='+r.id)).history;const before=priorHistory.length;
r=await change(mh,r,'save-publish',{payload:{...r.draft,title:'Local direct publication'}});assert.equal(r.status,'published');assert.equal(r.live.title,'Local direct publication');assert.equal(r.submittedBy,null);
const details=await api(mh,'?id='+r.id);assert.equal(details.history.length,Math.min(50,before+1));assert.notEqual(details.history[0].id,priorHistory[0]?.id);assert.equal(details.history[0].action,'publish');
// Explicit drafts and requests from old clients remain supported.
r=await change(mh,r,'save',{payload:orig.draft});assert.equal(r.status,'draft');r=await change(mh,r,'submit');assert.equal(r.status,'published');
// Removal is immediate for publishers, reviewed for editors.
r=await change(eh,r,'archive');assert.equal(r.status,'draft');assert.ok(r.live);r=await change(eh,r,'submit');assert.equal(r.status,'review');r=await change(mh,r,'publish');assert.equal(r.status,'archived');assert.equal(r.live,null);
r=await change(mh,r,'restore');r=await change(mh,r,'publish');assert.equal(r.status,'published');r=await change(mh,r,'archive');assert.equal(r.status,'archived');r=await change(mh,r,'restore');r=await change(mh,r,'save-publish',{payload:orig.draft});
// First-write history must retain the previous published version after a direct save.
const pristine=(await api(superHeaders,'?id=franchises:bigguys')).record;
let brand=await change(superHeaders,pristine,'save-publish',{payload:{...pristine.draft,description:pristine.draft.description+' Local revision test.'}});
const old=(await api(superHeaders,'?id='+brand.id)).history.find(h=>h.action==='original version');assert.ok(old);
brand=await change(superHeaders,brand,'revert',{revision:old.id});assert.equal(brand.draft.description,pristine.live.description);assert.equal(brand.status,'draft');await change(superHeaders,brand,'publish');
// HR can directly create and remove a job, but cannot publish articles.
const blank=(await api(hh,'?kind=jobs')).blank;
let job=(await api(hh,'',{action:'save-publish',kind:'jobs',slug:'qa-job-'+stamp,version:0,payload:{...blank,slug:'qa-job-'+stamp,title:'Local HR test',dept:'QA',location:'Remote',aboutRole:'Testing direct publishing',responsibilities:['Test'],requirements:['Test']}})).record;assert.equal(job.status,'published');await change(hh,job,'archive');
// Permission changes and suspension take effect on the next write.
let members=(await api(superHeaders,'?view=team')).members;let other=members.find(m=>m.email===otherEmail);
await api(superHeaders,'',{action:'member',version:other.version,payload:{...other,role:'editor'}});await change(oh,r,'save-publish',{payload:r.draft},403);
const author=members.find(m=>m.email===editorEmail);await api(superHeaders,'',{action:'member',version:author.version,payload:{...author,status:'suspended'}});await api(eh,'',undefined,403);
await api(headers(managerEmail,'wrong-user'),'',undefined,403);
console.log('PASS: direct publishing and removal by scoped Approvers, editor review requirement, reporting hierarchy, changes requested, view-only/section protection, atomic audit/history, HR publishing, role changes, suspension and identity binding.');
