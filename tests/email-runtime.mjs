import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
import {env} from 'cloudflare:workers';
import {localD1} from './local-d1.mjs';
import {setHeaders} from './cms-auth-headers.mjs';
import {outboxStatement,flushEmails,receiveWebhook,emailReady,emailOrigin,emailLimit,retryEmail} from '../lib/email/service.ts';
import {unseal} from '../lib/email/crypto.mjs';
import {accessHelpEmail} from '../lib/email/templates.mjs';
import {acceptInvitation} from '../lib/email/invitations.ts';
import {adminIdentity} from '../lib/cms/auth.ts';
import {POST as team} from '../app/api/admin/route.ts';
import {GET as deliveries,POST as processEmails} from '../app/api/admin/email/route.ts';
import {POST as help} from '../app/api/cms/access-help/route.ts';
import {POST as webhook} from '../app/api/email/webhook/route.ts';
import {POST as activate} from '../app/api/admin/invitations/accept/route.ts';
import {acceptSubmission} from '../lib/intake/server.ts';
import {published} from '../lib/cms/public.ts';
import {NOTICE_VERSION} from '../lib/intake/constants.mjs';
import {tokenHash} from '../lib/email/crypto.mjs';
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
 // All four real intake workflows atomically enqueue once, even while email is disabled.
 env.EMAIL_MODE='disabled';env.BUCKET={put:async()=>{},delete:async()=>{}};
 const job=(await published('jobs'))[0];assert(job);
 const forms=[{kind:'investor',budget:'Exploring',timeframe:'Just exploring'},{kind:'brand',companyName:'Synthetic business',companyWebsite:'https://example.invalid',timeframe:'Just exploring'},{kind:'general',message:'Synthetic integration enquiry.'},{kind:'job',jobSlug:job.slug,experienceType:'experienced',experienceYears:'2',experienceMonths:'6',noticePeriod:'30 days',employmentStatus:'Currently employed',qualification:'Bachelor’s degree',course:'B.Com',educationStatus:'Completed',institution:'Test College'}];
 for(const form of forms){
  const token=crypto.randomUUID(),id=crypto.randomUUID(),ip='203.0.113.25';
  database.prepare('INSERT INTO intake_sessions(id,ip_hash,created_at,expires_at) VALUES (?,?,?,?)').run(token,await tokenHash(ip+new Date().toISOString().slice(0,10)),Date.now()-5000,Date.now()+60000);
  const req=request('/api/intake/enquiries',{});req.headers.set('cf-connecting-ip',ip);
  const data={...form,token,id,name:'Synthetic Test',email:'synthetic@outlook.com',phone:'+14155552671',phoneCountry:'US',city:'Bengaluru',state:'Karnataka',consent:true,adult:true,noticeVersion:NOTICE_VERSION,sourcePage:'/contact-us',source:{},trap:''};
  const resume=form.kind==='job'?{bytes:new TextEncoder().encode('%PDF-1.7 synthetic'),name:'test.pdf'}:undefined;
  const saved=await acceptSubmission(req,data,resume);assert.equal(saved.id,id);await acceptSubmission(req,data,resume);
  assert.equal(database.prepare("SELECT count(*) n FROM email_outbox WHERE source_ref=? AND kind='website'").get(id).n,1);
 }
 console.log('PASS email integration: durable retries, deduplication, signature verification, ordering, capture isolation, rate limits, role validation, both owners, invitation binding/expiry/renewal/replay, access-help and log redaction.');
}finally{console.info=savedLog;database.close();}
