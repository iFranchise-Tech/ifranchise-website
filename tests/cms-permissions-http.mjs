// Production Worker contract tested locally; never target a hosted URL with test identity headers.
import assert from 'node:assert/strict';
const base='http://127.0.0.1:3028';
const headers=(email,id)=>({'oai-authenticated-user-email':email,'oai-authenticated-user-id':id,'Origin':base,'Content-Type':'application/json'});
const superHeaders=headers('preview@ifranchise.in','local_seedy');const stamp=Date.now();
async function api(h,path='',body,status=200){const r=await fetch(base+'/api/admin'+path,{method:body?'POST':'GET',headers:h,body:body?JSON.stringify(body):undefined});const raw=await r.text();let d;try{d=JSON.parse(raw)}catch{d={error:raw.slice(0,400)}}assert.equal(r.status,status,JSON.stringify(d));return d;}
await api({},'',undefined,401);await api(headers('personal@gmail.com','p'),'',undefined,403);await api(headers('uninvited@ifranchise.in','u'),'',undefined,403);
const owner=(await api(superHeaders)).me;
const managerEmail='qa-manager-'+stamp+'@ifranchise.in',editorEmail='qa-author-'+stamp+'@ifranchise.in',hrEmail='qa-hr-'+stamp+'@ifranchise.in',viewerEmail='qa-viewer-'+stamp+'@ifranchise.in';
async function invite(email,role,scopes,manager){return api(superHeaders,'',{action:'member',version:0,payload:{email,name:'Local test '+role,role,scopes,manager,status:'invited'}})}
await invite(managerEmail,'approver',['articles'],owner.email);const mh=headers(managerEmail,'manager-'+stamp);await api(mh);
await invite(editorEmail,'editor',['articles'],managerEmail);const eh=headers(editorEmail,'editor-'+stamp);await api(eh);
await invite(hrEmail,'approver',['jobs'],owner.email);const hh=headers(hrEmail,'hr-'+stamp);await api(hh);
await invite(viewerEmail,'viewer',['articles'],managerEmail);const vh=headers(viewerEmail,'viewer-'+stamp);await api(vh);
await api(eh,'?kind=jobs',undefined,403);await api(hh,'?kind=articles',undefined,403);await api(eh,'?view=team',undefined,403);
const orig=(await api(eh,'?id=articles:what-is-a-franchise')).record;
await api(vh,'',{action:'save',kind:orig.kind,slug:orig.slug,version:orig.version,payload:orig.draft},403);
let r=(await api(eh,'',{action:'save',kind:orig.kind,slug:orig.slug,version:orig.version,payload:orig.draft})).record;
r=(await api(eh,'',{action:'submit',kind:r.kind,slug:r.slug,version:r.version})).record;
await api(eh,'',{action:'publish',kind:r.kind,slug:r.slug,version:r.version},403);
await api(hh,'',{action:'publish',kind:r.kind,slug:r.slug,version:r.version},403);
r=(await api(mh,'',{action:'publish',kind:r.kind,slug:r.slug,version:r.version})).record;assert.equal(r.status,'published');
r=(await api(mh,'',{action:'save',kind:r.kind,slug:r.slug,version:r.version,payload:r.draft})).record;r=(await api(mh,'',{action:'submit',kind:r.kind,slug:r.slug,version:r.version})).record;
await api(mh,'',{action:'publish',kind:r.kind,slug:r.slug,version:r.version},403);r=(await api(superHeaders,'',{action:'publish',kind:r.kind,slug:r.slug,version:r.version})).record;
const members=(await api(superHeaders,'?view=team')).members;const author=members.find(m=>m.email===editorEmail);
await api(superHeaders,'',{action:'member',version:author.version,payload:{...author,status:'suspended'}});await api(eh,'',undefined,403);
await api(headers(managerEmail,'wrong-user'),'',undefined,403);
const old=(await api(superHeaders,'?id=articles:what-is-a-franchise')).history.find(h=>h.action==='original version');assert.ok(old,'original version retained');
console.log('PASS: production authentication contract, personal/uninvited rejection, role separation, view-only protection, reporting-chain approval, self-approval denial, suspension, stable identity binding, original version history.');
