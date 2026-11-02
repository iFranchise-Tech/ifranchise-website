import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {env} from 'cloudflare:workers';
import {setHeaders} from './cms-auth-headers.mjs';
import {localD1} from './local-d1.mjs';
import {issueLocalAdminToken,LOCAL_ADMIN_COOKIE} from '../lib/local-admin.mjs';
import {adminIdentity} from '../lib/cms/auth.ts';
import {acceptInvitation} from '../lib/email/invitations.ts';
import {unseal} from '../lib/email/crypto.mjs';
import {POST,GET} from '../app/api/admin/route.ts';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
const {DB,database}=localD1();
for(const file of readdirSync('drizzle').filter(file=>file.endsWith('.sql')).sort())database.exec(readFileSync('drizzle/'+file,'utf8'));
database.exec(readFileSync('database/content.sql','utf8'));
database.exec("INSERT INTO website_submissions (id,reference,session_id,kind,payload,created_at,sheet_status) VALUES ('retained','IF-retained','retained-session','general','{}','2026-01-01T00:00:00Z','synced')");
database.exec("INSERT INTO cms_members (email,name,role,scopes,manager,status,expires_at,version,created_at,updated_at) VALUES ('retained@ifranchise.in','Retained staff','editor','[\"articles\"]','abdul@ifranchise.in','invited','2099-01-01T00:00:00Z',1,'2026-01-01T00:00:00Z','2026-01-01T00:00:00Z')");
const preserved=()=>JSON.stringify({content:database.prepare('SELECT * FROM cms_records ORDER BY id').all(),submissions:database.prepare('SELECT * FROM website_submissions ORDER BY id').all(),member:database.prepare("SELECT * FROM cms_members WHERE email='retained@ifranchise.in'").get()});
const before=preserved();
Object.assign(env,{EMAIL_MODE:import.meta.env.DEV?'capture':'resend',EMAIL_ENVIRONMENT:'preview',EMAIL_PUBLIC_ORIGIN:import.meta.env.DEV?'http://localhost:3021':'https://preview.example',EMAIL_OUTBOX_KEY:Buffer.alloc(32,7).toString('base64'),RESEND_API_KEY:'test-only-not-a-key',EMAIL_ALLOWED_RECIPIENTS:'editor@ifranchise.in,viewer@ifranchise.in,it@ifranchise.in',DB,LOCAL_ADMIN_EMAIL:'editor@ifranchise.in,uninvited@ifranchise.in',LOCAL_ADMIN_SECRET:'test-only-local-auth-secret-32-characters',CMS_SUPER_ADMIN_EMAIL:'abdul@ifranchise.in,sumanth.reddy@ifranchise.in'});
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
async function asAccess(email){
 const token=await new SignJWT({email}).setProtectedHeader({alg:'RS256',kid:jwk.kid}).setSubject('workspace:'+email).setIssuer(env.ACCESS_TEAM_DOMAIN).setAudience(env.ACCESS_AUD).setIssuedAt().setExpirationTime('5m').sign(privateKey);
 setHeaders({host:'preview.example','cf-access-jwt-assertion':token});
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
database.close();
