import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {env} from 'cloudflare:workers';
import {setHeaders} from './cms-auth-headers.mjs';
import {localD1} from './local-d1.mjs';
import {issueLocalAdminToken,LOCAL_ADMIN_COOKIE} from '../lib/local-admin.mjs';
import {allRecords,recordSummaries,summary} from '../lib/cms/store.ts';
import {adminIdentity} from '../lib/cms/auth.ts';
import {acceptInvitation} from '../lib/email/invitations.ts';
import {unseal} from '../lib/email/crypto.mjs';
import {POST,GET} from '../app/api/admin/route.ts';
import {GET as sessionGet} from '../app/api/admin/session/route.ts';
import {GET as intakeGet,POST as intakeSync,PATCH as intakeUpdate} from '../app/api/admin/intake/route.ts';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
const {DB,database}=localD1();
for(const file of readdirSync('drizzle').filter(file=>file.endsWith('.sql')).sort())database.exec(readFileSync('drizzle/'+file,'utf8'));
database.exec(readFileSync('database/content.sql','utf8'));
database.exec("INSERT INTO website_submissions (id,reference,session_id,kind,payload,created_at,sheet_status) VALUES ('retained','IF-retained','retained-session','general','{}','2026-01-01T00:00:00Z','synced')");
database.exec("INSERT INTO cms_members (email,name,role,scopes,manager,status,expires_at,version,created_at,updated_at) VALUES ('retained@ifranchise.in','Retained staff','editor','[\"articles\"]','abdul@ifranchise.in','invited','2099-01-01T00:00:00Z',1,'2026-01-01T00:00:00Z','2026-01-01T00:00:00Z')");
const preserved=()=>JSON.stringify({content:database.prepare('SELECT * FROM cms_records ORDER BY id').all(),submissions:database.prepare('SELECT * FROM website_submissions ORDER BY id').all(),member:database.prepare("SELECT * FROM cms_members WHERE email='retained@ifranchise.in'").get()});
const before=preserved();
Object.assign(env,{EMAIL_MODE:import.meta.env.DEV?'capture':'resend',EMAIL_ENVIRONMENT:'preview',EMAIL_PUBLIC_ORIGIN:import.meta.env.DEV?'http://localhost:3021':'https://preview.example',EMAIL_OUTBOX_KEY:Buffer.alloc(32,7).toString('base64'),RESEND_API_KEY:'test-only-not-a-key',EMAIL_ALLOWED_RECIPIENTS:'editor@ifranchise.in,viewer@ifranchise.in,it@ifranchise.in',DB,LOCAL_ADMIN_EMAIL:'editor@ifranchise.in,uninvited@ifranchise.in',LOCAL_ADMIN_SECRET:'test-only-local-auth-secret-32-characters',CMS_SUPER_ADMIN_EMAIL:'abdul@ifranchise.in,sumanth.reddy@ifranchise.in'});
// Projection must preserve list data exactly, including imported defaults,
// archived rows and page/FAQ compatibility, without loading private snapshots.
for(const kind of ['franchises','jobs','industries','blogs','articles','videos','faqs','pages','placements']){
 assert.deepEqual(await recordSummaries(kind),(await allRecords(kind)).map(summary),kind+' summary equivalence');
}
console.log('PASS projected listings match existing record summaries for every content kind.');
async function as(email,host='localhost:3021'){
 const token=await issueLocalAdminToken(env,email);
 setHeaders({host,cookie:LOCAL_ADMIN_COOKIE+'='+encodeURIComponent(token)});
}
const {privateKey,publicKey}=await generateKeyPair('RS256');
const jwk={...await exportJWK(publicKey),kid:'cms-auth-test',alg:'RS256',use:'sig'};
Object.assign(env,{ACCESS_TEAM_DOMAIN:'https://cms-test.cloudflareaccess.com',ACCESS_AUD:'a'.repeat(64)});
globalThis.fetch=async input=>{
 const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
 if(url==='https://api.resend.com/emails')return Response.json({id:crypto.randomUUID()});
 assert.equal(url,env.ACCESS_TEAM_DOMAIN+'/cdn-cgi/access/certs');
 return Response.json({keys:[jwk]});
};
async function asAccess(email,{expiry='5m',subject='workspace:'+email,cookie=false}={}){
 const token=await new SignJWT({email}).setProtectedHeader({alg:'RS256',kid:jwk.kid}).setSubject(subject).setIssuer(env.ACCESS_TEAM_DOMAIN).setAudience(env.ACCESS_AUD).setIssuedAt().setExpirationTime(expiry).sign(privateKey);
 setHeaders({host:'preview.example',...(cookie?{cookie:'CF_Authorization='+token}:{'cf-access-jwt-assertion':token})});
}
if(!import.meta.env.DEV){
 await as('abdul@ifranchise.in');
 await assert.rejects(adminIdentity,error=>error.status===401);
 assert.equal((await GET(new Request('http://localhost:3021/api/admin'))).status,401);
 console.log('PASS production compilation rejects local credentials even on localhost.');
}
{
 const origin='http://localhost:3021';
 const member=async payload=>POST(new Request(origin+'/api/admin',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({action:'member',version:0,payload})}));
 for(const email of ['abdul@ifranchise.in','sumanth.reddy@ifranchise.in']){
  if(import.meta.env.DEV)await as(email);else await asAccess(email);
  const identity=await adminIdentity();assert.equal(identity.role,'super_admin');assert.equal((await adminIdentity()).version,identity.version);
  const address=email==='abdul@ifranchise.in'?'editor@ifranchise.in':'viewer@ifranchise.in';
  const response=await member({email:address,name:'Test staff',role:'editor',scopes:['articles'],manager:email,status:'invited'});assert.equal(response.status,200,await response.text());
  const rejected=await member({email:'outsider@ifranchise.in',name:'Extra owner',role:'super_admin',scopes:[],manager:null,status:'invited'});assert.equal(rejected.status,422);
 }
 await asAccess('uninvited@ifranchise.in');await assert.rejects(adminIdentity,error=>error.status===403);
 await asAccess('editor@ifranchise.in');await assert.rejects(adminIdentity,error=>error.status===403);
 const queued=database.prepare("SELECT * FROM email_outbox WHERE kind='invitation' AND source_ref='editor@ifranchise.in'").get();
 const mail=await unseal(queued.payload,env.EMAIL_OUTBOX_KEY,queued.id);
 const token=mail.text.match(/#token=([A-Za-z0-9_-]{43})/)[1];
 await acceptInvitation(token);await assert.rejects(()=>acceptInvitation(token),error=>error.status===422);
 const editor=await adminIdentity();assert.equal(editor.status,'active');assert.equal(editor.role,'editor');
 assert.equal((await GET(new Request(origin+'/api/admin?view=team'))).status,403);
 assert.equal((await GET(new Request(origin+'/api/admin?kind=jobs'))).status,403);
 assert.equal((await member({email:'new@ifranchise.in',role:'editor'})).status,403);
 database.prepare("UPDATE cms_members SET status='suspended' WHERE email=?").run(editor.email);
 await assert.rejects(adminIdentity,error=>error.status===403);
 database.prepare("UPDATE cms_members SET status='active',role='super_admin' WHERE email=?").run(editor.email);
 await assert.rejects(adminIdentity,error=>error.status===403);
 await as('abdul@ifranchise.in','preview.example');await assert.rejects(adminIdentity,error=>error.status===401);
 assert.equal(preserved(),before,'sign-in and invitations preserve existing content, submissions and unrelated members');
 console.log('PASS both Super Admin invitations, stable member versions, role boundaries, invitation activation, suspension and remote-host isolation.');
}
// The Access session proves identity; D1 remains authoritative on every request.
{
 const origin='https://preview.example';
 for(const email of ['abdul@ifranchise.in','sumanth.reddy@ifranchise.in']){
  const original=database.prepare('SELECT * FROM cms_members WHERE email=?').get(email);
  // Development tests used a local identity earlier; model a separate hosted DB identity here.
  database.prepare('UPDATE cms_members SET user_id=? WHERE email=?').run('workspace:'+email,email);
  await asAccess(email,{cookie:true});
  const version=(await adminIdentity()).version;
  for(let n=0;n<3;n++){const session=await sessionGet();assert.equal(session.status,200);assert.deepEqual(await session.json(),{email,version});}
  for(const kind of ['franchises','jobs','blogs','articles','industries','videos','faqs','pages'])assert.equal((await GET(new Request(origin+'/api/admin?kind='+kind))).status,200);
  database.prepare("UPDATE cms_members SET status='suspended' WHERE email=?").run(email);
  const denied=await sessionGet();assert.equal(denied.status,403);assert.equal((await denied.json()).code,'account_disabled');
  assert.equal(database.prepare('SELECT status FROM cms_members WHERE email=?').get(email).status,'suspended');
  database.prepare("UPDATE cms_members SET status='active' WHERE email=?").run(email);
  await asAccess(email,{subject:'different-identity'});await assert.rejects(adminIdentity,e=>e.code==='identity_mismatch');
  await asAccess(email,{expiry:1});assert.equal((await sessionGet()).status,401);
  database.prepare('UPDATE cms_members SET user_id=?,status=?,role=? WHERE email=?').run(original.user_id,original.status,original.role,email);
 }
 await asAccess('person@gmail.com');await assert.rejects(adminIdentity,e=>e.code==='company_account_required');
 await asAccess('outsider@ifranchise.in');await assert.rejects(adminIdentity,e=>e.code==='invitation_required');
 const now=new Date().toISOString();
 database.prepare("INSERT INTO cms_members(email,name,role,scopes,status,expires_at,invitation_required,version,created_at,updated_at) VALUES ('expired@ifranchise.in','Expired','editor','[]','invited','2000-01-01T00:00:00Z',1,1,?,?)").run(now,now);
 await asAccess('expired@ifranchise.in');await assert.rejects(adminIdentity,e=>e.code==='invitation_expired');
 // A deleted configured Super Admin must not be recreated by authentication.
 const removed=database.prepare("SELECT * FROM cms_members WHERE email='sumanth.reddy@ifranchise.in'").get();
 database.prepare("DELETE FROM cms_members WHERE email='sumanth.reddy@ifranchise.in'").run();
 await asAccess(removed.email);await assert.rejects(adminIdentity,e=>e.code==='invitation_required');
 assert.equal(database.prepare('SELECT count(*) AS n FROM cms_members WHERE email=?').get(removed.email).n,0);
 const columns=Object.keys(removed);database.prepare('INSERT INTO cms_members('+columns.join(',')+') VALUES ('+columns.map(()=>'?').join(',')+')').run(...Object.values(removed));
 console.log('PASS hosted cookie reuse, refresh, all content scopes, both Super Admin revocations, deleted account, identity mismatch, personal email and expired sessions/invitations.');
}
// A role's pending work must not be hidden behind other teams' older rows.
{
 const origin='http://localhost:3021',email='qa-hr@ifranchise.in',now=new Date().toISOString();
 database.prepare("INSERT INTO cms_members (email,user_id,name,role,scopes,manager,status,version,created_at,updated_at) VALUES (?,?,?,'editor',?,'abdul@ifranchise.in','active',1,?,?)").run(email,'workspace:'+email,'HR QA',JSON.stringify({applications:{view:true,edit:true,approve:false}}),now,now);
 for(let i=0;i<35;i++)database.prepare("INSERT INTO website_submissions (id,reference,session_id,kind,payload,created_at,sheet_status) VALUES (?,?,?,?,?,?, 'pending')").run('queue-'+i,'IF-queue-'+i,'queue-session-'+i,i<30?'general':'job','{}',i<30?'2025-01-01':'2026-01-01');
 await asAccess(email);
 const queued=await intakeSync(new Request(origin+'/api/admin/intake',{method:'POST',headers:{origin}}));assert.equal(queued.status,200);
 assert.deepEqual(await queued.json(),{synced:0,pending:5},'HR receives its own oldest five pending applications even behind thirty enquiries');
 const page=await intakeGet(new Request(origin+'/api/admin/intake?page=1.5'));assert.equal(page.status,200);assert.equal((await page.json()).page,1);
 database.prepare("INSERT INTO website_submissions (id,reference,session_id,kind,payload,created_at,sheet_status) VALUES ('privacy-qa','IF-privacy-qa','privacy-session','privacy',?,?,'private')").run(JSON.stringify({name:'Privacy QA',status:'Received'}),now);
 const patch=payload=>intakeUpdate(new Request(origin+'/api/admin/intake',{method:'PATCH',headers:{origin,'content-type':'application/json'},body:JSON.stringify(payload)}));
 assert.equal((await patch({id:'privacy-qa',status:'In progress'})).status,403);
 if(import.meta.env.DEV)await as('abdul@ifranchise.in');else await asAccess('abdul@ifranchise.in');
 assert.equal((await patch({id:'privacy-qa',status:'Completed'})).status,422);
 const updated=await patch({id:'privacy-qa',status:'Completed',verified:true,handled:true});assert.equal(updated.status,200);
 const data=await updated.json();assert.equal(data.record.payload.status,'Completed');assert(!('session_id' in data.record));assert(!('resume_key' in data.record));
 console.log('PASS scoped sync queue, integer pagination, private status permissions and fresh response.');
}
// Inbox filters must apply before pagination and only narrow role permissions.
{
 const origin='http://localhost:3021';
 const insert=database.prepare("INSERT INTO website_submissions (id,reference,session_id,kind,payload,created_at,sheet_status) VALUES (?,?,?,?,?,?,?)");
 for(let i=0;i<30;i++)insert.run('filter-job-'+i,'IF-filter-job-'+i,'filter-job-session-'+i,'job','{}','2024-03-02T08:00:00.000Z','pending');
 insert.run('filter-private','IF-filter-private','filter-private-session','privacy','{}','2024-03-02T08:00:00.000Z','not_applicable');
 insert.run('filter-brand','IF-filter-brand','filter-brand-session','brand','{}','2024-03-02T08:00:00.000Z','synced');
 const list=async query=>{const r=await intakeGet(new Request(origin+'/api/admin/intake?'+query));assert.equal(r.status,200);return r.json()};
 await asAccess('qa-hr@ifranchise.in');
 const first=await list('type=job&received=2024-03-02&sync=pending');
 assert.equal(first.total,30);assert.equal(first.records.length,25);
 const second=await list('page=2&type=job&received=2024-03-02&sync=pending');
 assert.equal(second.total,30);assert.equal(second.records.length,5);
 assert.equal(new Set([...first.records,...second.records].map(r=>r.id)).size,30);
 for(const query of ['type=privacy','type=brand','sync=private']){const filtered=await list(query);assert.equal(filtered.total,0);assert.deepEqual(filtered.records,[])}
 assert.equal((await intakeGet(new Request(origin+'/api/admin/intake?received=2026-02-30'))).status,422);
 assert.equal((await intakeGet(new Request(origin+'/api/admin/intake?type=unknown'))).status,422);
 if(import.meta.env.DEV)await as('abdul@ifranchise.in');else await asAccess('abdul@ifranchise.in');
 assert.equal((await list('received=2024-03-02&sync=private')).total,1);
 assert.equal((await list('type=brand&received=2024-03-02&sync=synced')).total,1);
 const snapshot=JSON.stringify(database.prepare('SELECT * FROM website_submissions ORDER BY id').all());
 await list('type=job&sync=pending');
 assert.equal(JSON.stringify(database.prepare('SELECT * FROM website_submissions ORDER BY id').all()),snapshot,'filtering does not change submissions');
 console.log('PASS Inbox filters, IST day, complete pagination, invalid inputs, private status and role isolation.');
}
database.close();
