import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
import {env} from 'cloudflare:workers';
import {localD1} from './local-d1.mjs';
import {setHeaders} from './cms-auth-headers.mjs';
import {outboxStatement,flushEmails,receiveWebhook,emailReady,emailOrigin,emailLimit,retryEmail} from '../lib/email/service.ts';
import {seal,unseal} from '../lib/email/crypto.mjs';
import {accessHelpEmail,websiteEmail} from '../lib/email/templates.mjs';
import {acceptInvitation} from '../lib/email/invitations.ts';
import {adminIdentity} from '../lib/cms/auth.ts';
import {POST as team} from '../app/api/admin/route.ts';
import {GET as deliveries,POST as processEmails} from '../app/api/admin/email/route.ts';
import {POST as help} from '../app/api/cms/access-help/route.ts';
import {POST as webhook} from '../app/api/email/webhook/route.ts';
import {POST as activate} from '../app/api/admin/invitations/accept/route.ts';
import {finishDelivery,withIntakeContext} from '../lib/intake/context.ts';
import {NOTICE_VERSION} from '../lib/intake/constants.mjs';
const {DB,database}=localD1();
for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())database.exec(readFileSync('drizzle/'+file,'utf8'));
Object.assign(env,{DB,EMAIL_MODE:'resend',EMAIL_ENVIRONMENT:'preview',EMAIL_PUBLIC_ORIGIN:'https://preview.example',EMAIL_ALLOWED_RECIPIENTS:'staff@ifranchise.in,it@ifranchise.in,contact@ifranchise.in',EMAIL_OUTBOX_KEY:Buffer.alloc(32,9).toString('base64'),RESEND_API_KEY:'test-only-never-a-live-key',RESEND_WEBHOOK_SECRET:'whsec_'+Buffer.alloc(32,5).toString('base64'),ACCESS_TEAM_DOMAIN:'https://test.cloudflareaccess.com',ACCESS_AUD:'b'.repeat(64)});
const {privateKey,publicKey}=await generateKeyPair('RS256'),jwk={...await exportJWK(publicKey),kid:'email-test',alg:'RS256',use:'sig'};
const calls=[];let mode='success',earlyEvent=null;
globalThis.fetch=async(url,options)=>{
 if(String(url)===env.ACCESS_TEAM_DOMAIN+'/cdn-cgi/access/certs')return Response.json({keys:[jwk]});
 assert.equal(url,'https://api.resend.com/emails','tests must never contact other services');
 assert.equal(options.redirect,'error');assert.equal(options.headers.Authorization,'Bearer '+env.RESEND_API_KEY);
 calls.push(options);
 if(mode==='timeout')throw new TypeError('Network failed with a sensitive provider response');
 if(mode==='rate')return Response.json({secret:'must never be logged'},{status:429});
 if(mode==='invalid')return Response.json({secret:'must never be logged'},{status:422});
 const id='provider-'+calls.length;if(earlyEvent)await event(earlyEvent,id);
 return Response.json({id});
};
const request=(path,body,origin='https://preview.example')=>new Request(origin+path,{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
async function identity(email){const jwt=await new SignJWT({email}).setProtectedHeader({alg:'RS256',kid:jwk.kid}).setSubject('workspace:'+email).setIssuer(env.ACCESS_TEAM_DOMAIN).setAudience(env.ACCESS_AUD).setIssuedAt().setExpirationTime('5m').sign(privateKey);setHeaders({host:'preview.example','cf-access-jwt-assertion':jwt});}
async function event(type,provider,time=Date.now(),id=crypto.randomUUID()){
 const body=JSON.stringify({type,created_at:new Date(time).toISOString(),data:{email_id:provider}}),timestamp=String(Math.floor(Date.now()/1000));
 const signature=createHmac('sha256',Buffer.from(env.RESEND_WEBHOOK_SECRET.slice(6),'base64')).update(`${id}.${timestamp}.${body}`).digest('base64');
 const req=new Request('https://preview.example/api/email/webhook',{method:'POST',headers:{'svix-id':id,'svix-timestamp':timestamp,'svix-signature':'v1,'+signature},body});
 await receiveWebhook(env,req,body);return {req,body};
}
function quota(){database.prepare('DELETE FROM email_limits').run();}
async function queued(key='test-'+crypto.randomUUID(),to='staff@ifranchise.in'){
 const q=await outboxStatement(env,{key,kind:'access-help',source:'synthetic',message:accessHelpEmail({email:to,origin:env.EMAIL_PUBLIC_ORIGIN})});await q.statement.run();return q.id;
}
const row=id=>database.prepare('SELECT * FROM email_outbox WHERE id=?').get(id);
const beforeLogs=[];const savedLog=console.info;console.info=message=>beforeLogs.push(message);
try{
 // Permanent deduplication in D1 + provider idempotency across an uncertain send.
 const id=await queued('retry-test');await queued('retry-test');assert.equal(database.prepare("SELECT count(*) n FROM email_outbox WHERE dedupe_key='retry-test'").get().n,1);
 mode='timeout';await flushEmails(env,1);assert.equal(row(id).status,'retry');assert.equal(row(id).attempts,1);const original=calls.at(-1);
 quota();database.prepare('UPDATE email_outbox SET next_attempt_at=0 WHERE id=?').run(id);mode='success';await flushEmails(env,1);
 assert.equal(row(id).status,'accepted');assert.equal(calls.at(-1).headers['Idempotency-Key'],original.headers['Idempotency-Key']);assert.equal(calls.at(-1).body,original.body);
 quota();const sent=calls.length;await flushEmails(env);assert.equal(calls.length,sent);
 // Verified webhook receipts are deduplicated and may arrive before the API response.
 const provider=row(id).provider_id,now=Date.now();await event('email.delivered',provider,now,'duplicate-event');await event('email.delivered',provider,now,'duplicate-event');
 assert.equal(database.prepare("SELECT count(*) n FROM email_delivery_events WHERE id='duplicate-event'").get().n,1);
 await event('email.sent',provider,now-1000);assert.equal(row(id).status,'delivered');
 await event('email.complained',provider,now+1000);await event('email.delivered',provider,now+2000);assert.equal(row(id).status,'complained');
 quota();const race=await queued();earlyEvent='email.delivered';await flushEmails(env,1);earlyEvent=null;assert.equal(row(race).status,'delivered');
 assert.equal((await webhook(new Request('https://preview.example/api/email/webhook',{method:'POST',body:'{}'}))).status,400);
 // Rate limits, terminal errors, allowlists and uncertain deliveries beyond the safe retry window.
 quota();const rate=await queued();mode='rate';await flushEmails(env,1);assert.equal(row(rate).status,'retry');assert.equal(row(rate).last_error,'resend_http_429');
 database.prepare("UPDATE email_outbox SET status='manual_review' WHERE id=?").run(rate);
 quota();const invalid=await queued();mode='invalid';await flushEmails(env,1);assert.equal(row(invalid).status,'failed');
 await retryEmail(env,invalid,'abdul@ifranchise.in');quota();mode='success';await flushEmails(env,1);assert.equal(row(invalid).status,'accepted');await assert.rejects(()=>retryEmail(env,invalid,'abdul@ifranchise.in'),e=>e.status===409);
 quota();const blocked=await queued(undefined,'outsider@ifranchise.in');mode='success';const prior=calls.length;await flushEmails(env,1);assert.equal(row(blocked).status,'blocked');assert.equal(calls.length,prior);
 quota();const expired=await queued();database.prepare('UPDATE email_outbox SET first_attempt_at=?,attempts=1 WHERE id=?').run(Date.now()-24*3600000,expired);await flushEmails(env,1);assert.equal(row(expired).status,'manual_review');
 quota();const concurrent=await queued();await Promise.all([flushEmails(env,1),flushEmails(env,1)]);assert.equal(row(concurrent).attempts,1);
 // A different invocation can update a selected batch before this worker gets
 // the lease. Dispatch must use the current payload, attempt count and window.
 async function afterBatchSelected(update){
  let updated=false;
  env.DB={...DB,prepare(sql){
   const wrap=statement=>({...statement,bind:(...values)=>wrap(statement.bind(...values)),async all(){
    const result=await statement.all();
    if(!updated&&sql.startsWith('SELECT * FROM email_outbox WHERE')){updated=true;await update();}
    return result;
   }});return wrap(DB.prepare(sql));
  }};
  try{quota();await flushEmails(env,1);assert(updated);}finally{env.DB=DB;}
 }
 const stalePayload=await queued();
 const frozenMessage={...accessHelpEmail({email:'staff@ifranchise.in',origin:env.EMAIL_PUBLIC_ORIGIN}),subject:'Already frozen before this lease'};
 const frozenPayload=await seal(frozenMessage,env.EMAIL_OUTBOX_KEY,stalePayload);
 await afterBatchSelected(()=>database.prepare("UPDATE email_outbox SET payload=?,attempts=1,first_attempt_at=? WHERE id=?").run(frozenPayload,Date.now()-1000,stalePayload));
 assert.deepEqual(JSON.parse(calls.at(-1).body),frozenMessage);assert.equal(row(stalePayload).attempts,2);
 for(const limit of ['window','attempts']){
  const stale=await queued(),sent=calls.length;
  await afterBatchSelected(()=>database.prepare('UPDATE email_outbox SET first_attempt_at=?,attempts=? WHERE id=?').run(Date.now()-(limit==='window'?24*3600000:1000),limit==='attempts'?8:1,stale));
  assert.equal(calls.length,sent);assert.equal(row(stale).status,'manual_review');
 }
 quota();await emailLimit(env,'example',1);await assert.rejects(()=>emailLimit(env,'example',1),e=>e.status===429);
 env.EMAIL_MODE='capture';if(import.meta.env.DEV){quota();const captured=await queued();await flushEmails(env,1);assert.equal(row(captured).status,'captured');}else assert.throws(()=>emailReady(env));env.EMAIL_MODE='resend';
 const allowed=env.EMAIL_ALLOWED_RECIPIENTS;env.EMAIL_ALLOWED_RECIPIENTS='';assert.throws(()=>emailReady(env));env.EMAIL_ALLOWED_RECIPIENTS=allowed;
 env.EMAIL_PUBLIC_ORIGIN='https://preview.example/evil';assert.throws(()=>emailOrigin(env));env.EMAIL_PUBLIC_ORIGIN='https://preview.example';
 // Both owners retain privileges. New invitations require the email link AND matching Access identity.
 for(const email of ['abdul@ifranchise.in','sumanth.reddy@ifranchise.in']){await identity(email);assert.equal((await adminIdentity()).role,'super_admin');}
 const owner='sumanth.reddy@ifranchise.in';await identity(owner);quota();
 async function invite(version=0){return team(request('/api/admin',{action:'member',version,payload:{name:'Synthetic staff',email:'staff@ifranchise.in',role:'editor',scopes:['articles'],manager:owner,status:'invited'}}));}
 let result=await invite();assert.equal(result.status,200,await result.text());
 async function token(){const out=database.prepare("SELECT * FROM email_outbox WHERE kind='invitation' AND source_ref='staff@ifranchise.in' AND status!='cancelled' ORDER BY created_at DESC LIMIT 1").get();return (await unseal(out.payload,env.EMAIL_OUTBOX_KEY,out.id)).text.match(/#token=([A-Za-z0-9_-]{43})/)[1];}
 const old=await token();await identity('staff@ifranchise.in');await assert.rejects(adminIdentity,e=>e.status===403);
 await identity('wrong@ifranchise.in');await assert.rejects(()=>acceptInvitation(old),e=>e.status===422);
 await identity(owner);quota();result=await invite(1);assert.equal(result.status,200,await result.text());const current=await token();assert.notEqual(current,old);
 await identity('staff@ifranchise.in');await assert.rejects(()=>acceptInvitation(old),e=>e.status===422);
 database.prepare('UPDATE cms_invitation_tokens SET expires_at=? WHERE used_at IS NULL').run(Date.now()-1);await assert.rejects(()=>acceptInvitation(current),e=>e.status===422);
 database.prepare('UPDATE cms_invitation_tokens SET expires_at=? WHERE used_at IS NULL').run(Date.now()+600000);
 const cross=request('/api/admin/invitations/accept',{token:current});cross.headers.set('origin','https://attacker.example');assert.equal((await activate(cross)).status,403);
 await acceptInvitation(current);await assert.rejects(()=>acceptInvitation(current),e=>e.status===422);assert.equal((await adminIdentity()).role,'editor');
 assert.equal((await deliveries()).status,403);assert.equal((await processEmails(request('/api/admin/email',{}))).status,403);
 assert.equal((await team(request('/api/admin',{action:'member',version:0,payload:{email:'escalate@ifranchise.in',role:'super_admin'}}))).status,403);
 await identity(owner);const visible=await (await deliveries()).json();assert(visible.emails.length);assert(!JSON.stringify(visible).includes(current));assert(!JSON.stringify(visible).includes('payload'));
 setHeaders({host:'preview.example'});assert.equal((await deliveries()).status,401);
 quota();const known=await help(request('/api/cms/access-help',{email:'staff@ifranchise.in'})),unknown=await help(request('/api/cms/access-help',{email:'unknown@ifranchise.in'}));assert.equal(known.status,202);assert.equal(unknown.status,202);assert.deepEqual(await known.json(),await unknown.json());
 assert(!beforeLogs.join('').includes('staff@ifranchise.in'));assert(!beforeLogs.join('').includes(env.RESEND_API_KEY));assert(!beforeLogs.join('').includes(current));assert(!beforeLogs.join('').includes('sensitive provider'));
 // Historical D1 leads and their pending notification pairs must remain deliverable.
 // NEW leads use Sheets-only persistence, covered by sheets-delivery.mjs.
 async function historicalLead(form){
  const id=crypto.randomUUID(),created_at=new Date().toISOString();
  const payload=JSON.stringify({...form,name:'Synthetic Test',email:'synthetic@outlook.com',phone:'+14155552671',phoneCountry:'US',city:'Bengaluru',state:'Karnataka',consent:true,adult:true,noticeVersion:NOTICE_VERSION,sourcePage:'/contact-us',source:{}});
  database.prepare("INSERT INTO website_submissions(id,reference,session_id,kind,payload,created_at,sheet_status) VALUES (?,?,?,?,?,?,'synced')").run(id,'IF-'+id,crypto.randomUUID(),form.kind,payload,created_at);
  for(let retry=0;retry<2;retry++){
   const pair=await Promise.all(['website','website-confirmation'].map(kind=>outboxStatement(env,{key:kind+':'+id,kind,source:id})));
   await DB.batch(pair.map(item=>item.statement));
  }
  assert.equal(database.prepare('SELECT count(*) n FROM email_outbox WHERE source_ref=?').get(id).n,2);
  return id;
 }
 const forms=[{kind:'investor',budget:'Exploring',timeframe:'Just exploring'},{kind:'brand',companyName:'Synthetic business',companyWebsite:'https://example.invalid',timeframe:'Just exploring'},{kind:'general',message:'Synthetic integration enquiry.'},{kind:'job',jobTitle:'Historical role',experienceType:'experienced',experienceYears:'2',experienceMonths:'6',noticePeriod:'30 days',employmentStatus:'Currently employed',qualification:'Bachelor’s degree',course:'B.Com',educationStatus:'Completed',institution:'Test College'}];
 for(const form of forms){
  env.EMAIL_MODE='disabled';const id=await historicalLead(form);
  const snapshot=database.prepare('SELECT * FROM website_submissions WHERE id=?').get(id);
  database.prepare("UPDATE email_outbox SET status='cancelled' WHERE source_ref!=? AND status IN ('queued','retry')").run(id);
  env.EMAIL_MODE='resend';mode='success';env.EMAIL_ALLOWED_RECIPIENTS=allowed+',synthetic@outlook.com';
  for(let i=0;i<2;i++){quota();await flushEmails(env,1)}
  const messages=database.prepare('SELECT * FROM email_outbox WHERE source_ref=?').all(id);
  for(const message of messages){assert.equal(message.status,'accepted');const rendered=await unseal(message.payload,env.EMAIL_OUTBOX_KEY,message.id);assert.deepEqual(rendered.to,[message.kind==='website'?'contact@ifranchise.in':'synthetic@outlook.com']);assert.equal(rendered.from,'iFranchise <contact@ifranchise.in>');}
  const sentCount=calls.length;quota();await flushEmails(env,2);assert.equal(calls.length,sentCount);
  assert.deepEqual(database.prepare('SELECT * FROM website_submissions WHERE id=?').get(id),snapshot,'Delivery must preserve historical lead data');
 }
 { // Historical customer confirmations still require the preview recipient allowlist.
 env.EMAIL_ALLOWED_RECIPIENTS=allowed;
 const id=await historicalLead({kind:'general',message:'Historical customer recipient restrictions.'});
 for(let i=0;i<2;i++){quota();await flushEmails(env,1)}
 assert.equal(database.prepare("SELECT status FROM email_outbox WHERE source_ref=? AND kind='website-confirmation'").get(id).status,'blocked');
 assert.equal(database.prepare("SELECT status FROM email_outbox WHERE source_ref=? AND kind='website'").get(id).status,'accepted');
 // Post-persistence delivery failures are safe in both local and Worker execution contexts.
 const oldWarn=console.warn;const warnings=[];console.warn=s=>warnings.push(s);
 try{await finishDelivery(Promise.reject(Error('sensitive details')));let background;await withIntakeContext({waitUntil:p=>{background=p}},()=>finishDelivery(Promise.reject(Error('secret'))));await background;assert.equal(warnings.length,2);assert(!warnings.join('').includes('sensitive'));}finally{console.warn=oldWarn}
 }
 { // Resend account ownership cannot change the website lead destination, even on retries.
 const record=database.prepare("SELECT * FROM website_submissions WHERE kind='general' LIMIT 1").get();assert(record);
 const before=database.prepare('SELECT count(*) n FROM website_submissions').get().n;
 env.EMAIL_ALLOWED_RECIPIENTS=allowed+',marketing@ifranchise.in';mode='success';env.EMAIL_MODE='resend';
 const correct=websiteEmail({to:['contact@ifranchise.in'],record,origin:env.EMAIL_PUBLIC_ORIGIN});
 for(const wrong of ['it@ifranchise.in','marketing@ifranchise.in','contact@ifranchise.in,it@ifranchise.in']){
  env.WEBSITE_NOTIFICATION_TO=wrong;
  const q=await outboxStatement(env,{key:'wrong-config-'+crypto.randomUUID(),kind:'website',source:record.id});await q.statement.run();
  const sent=calls.length;quota();await flushEmails(env,1);
  assert.equal(calls.length,sent);assert.equal(row(q.id).status,'blocked');assert.equal(row(q.id).attempts,0);
  assert.equal(row(q.id).last_error,'website_notification_identity_mismatch');
 }
 env.WEBSITE_NOTIFICATION_TO='contact@ifranchise.in';
 for(const message of [
  {...correct,to:['it@ifranchise.in']},
  {...correct,to:['marketing@ifranchise.in']},
  {...correct,to:['contact@ifranchise.in','marketing@ifranchise.in']},
  {...correct,from:'iFranchise <it@ifranchise.in>'},
  {...correct,from:'iFranchise <marketing@ifranchise.in>'},
 ]){
  const q=await outboxStatement(env,{key:'wrong-frozen-'+crypto.randomUUID(),kind:'website',source:record.id,message});await q.statement.run();
  // A retry with an already encrypted body must pass the same identity checks.
  database.prepare("UPDATE email_outbox SET status='retry' WHERE id=?").run(q.id);
  const sent=calls.length;quota();await flushEmails(env,1);
  assert.equal(calls.length,sent);assert.equal(row(q.id).status,'blocked');assert.equal(row(q.id).attempts,0);
  assert.equal(row(q.id).last_error,'website_notification_identity_mismatch');
 }
 for(const message of [undefined,correct]){
  const q=await outboxStatement(env,{key:'correct-identity-'+crypto.randomUUID(),kind:'website',source:record.id,message});await q.statement.run();
  const sent=calls.length;quota();await flushEmails(env,1);
  assert.equal(calls.length,sent+1);assert.equal(row(q.id).status,'accepted');
  const sentMessage=JSON.parse(calls.at(-1).body);assert.equal(sentMessage.from,'iFranchise <contact@ifranchise.in>');assert.deepEqual(sentMessage.to,['contact@ifranchise.in']);
 }
 assert.equal(database.prepare('SELECT count(*) n FROM website_submissions').get().n,before);
 assert(!beforeLogs.join('').includes('marketing@ifranchise.in'));assert(!beforeLogs.join('').includes(env.RESEND_API_KEY));
 delete env.WEBSITE_NOTIFICATION_TO;env.EMAIL_ALLOWED_RECIPIENTS=allowed;
 }
 console.log('PASS email integration: durable retries, deduplication, signature verification, ordering, capture isolation, rate limits, role validation, both owners, invitation binding/expiry/renewal/replay, access-help and log redaction.');
}finally{console.info=savedLog;database.close();}
