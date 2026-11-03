import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {generateKeyPairSync,verify} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {localD1} from './local-d1.mjs';
import {env} from 'cloudflare:workers';
import {NOTICE_VERSION} from '../lib/intake/constants.mjs';
import {acceptSubmission,retryPending} from '../lib/intake/server.ts';
import {saveToSheets} from '../lib/intake/sheets.ts';
import {withIntakeContext} from '../lib/intake/context.ts';
import {POST as enquiry} from '../app/api/intake/enquiries/route.ts';
import {POST as application} from '../app/api/intake/applications/route.ts';

const {DB,database}=localD1();
for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())database.exec(readFileSync('drizzle/'+file,'utf8'));
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
let mode='ok',emailMode='ok',uploads=0;
const rows=new Map(),requests=[],emails=[],logs=[];
const server=createServer(async(req,res)=>{
 const chunks=[];for await(const chunk of req)chunks.push(chunk);
 const envelope=JSON.parse(Buffer.concat(chunks).toString()),body=JSON.parse(envelope.body);
 assert(verify('RSA-SHA256',Buffer.from(envelope.body),publicKey,Buffer.from(envelope.signature,'base64url')));
 assert(Math.abs(Date.now()-body.timestamp)<300000);
 requests.push(body);
 const reply=data=>{res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(data));};
 if(mode==='fail'){res.writeHead(503);res.end('unavailable');return;}
 if(mode==='html'){res.writeHead(200,{'content-type':'text/html'});res.end('<!DOCTYPE html>');return;}
 if(mode==='json'){res.writeHead(200,{'content-type':'application/json'});res.end('{');return;}
 if(mode==='false'){reply({ok:false});return;}
 if(mode==='mismatch'){reply({ok:true,reference:'IF-other'});return;}
 if(mode==='bad-duplicate'){reply({ok:true,reference:body.row[0],duplicate:'true'});return;}
 const duplicate=rows.has(body.row[0]);
 if(!duplicate)rows.set(body.row[0],body);
 if(mode==='lost-response'){req.socket.destroy();return;}
 reply({ok:true,reference:body.row[0],...(duplicate?{duplicate:true}:{})});
});
const realFetch=globalThis.fetch,realInfo=console.info;
let sequence=1;
const base={kind:'general',name:'QA Visitor',phone:'+14155552671',phoneCountry:'US',email:'qa.visitor@gmail.com',state:'Karnataka',city:'Bengaluru',adult:true,consent:true,noticeVersion:NOTICE_VERSION,sourcePage:'/contact-us?token=PRIVATE#form',message:'Please discuss <our plans> & expansion.',source:{utm_campaign:'untrusted'},trap:''};
async function input(extra={}){
 const token=crypto.randomUUID(),ip='198.51.100.'+sequence++;
 const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+new Date().toISOString().slice(0,10)))).toString('hex');
 await DB.prepare('INSERT INTO intake_sessions (id,ip_hash,created_at,expires_at) VALUES (?,?,?,?)').bind(token,hash,Date.now()-10000,Date.now()+7200000).run();
 const payload={...base,id:crypto.randomUUID(),token,...extra};
 const req=new Request('http://127.0.0.1:3019/api/intake/enquiries',{method:'POST',headers:{origin:'http://127.0.0.1:3019','cf-connecting-ip':ip,'content-type':'application/json'},body:JSON.stringify(payload)});
 return {payload,req};
}
async function submit(extra={}){const {req,payload}=await input(extra);return acceptSubmission(req,payload);}
function noCopies(){assert.equal(database.prepare('SELECT count(*) n FROM website_submissions').get().n,0);assert.equal(database.prepare('SELECT count(*) n FROM email_outbox').get().n,0);assert.equal(uploads,0);}

test('Sheets-only lead delivery and existing receiver contract',async t=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 Object.assign(env,{DB,SHEETS_WEBHOOK_URL:`http://127.0.0.1:${server.address().port}/`,INTAKE_SIGNING_KEY:JSON.stringify(privateKey.export({format:'jwk'})),EMAIL_MODE:'resend',EMAIL_ENVIRONMENT:'preview',EMAIL_ALLOWED_RECIPIENTS:'contact@ifranchise.in',EMAIL_PUBLIC_ORIGIN:'https://preview.example.test',RESEND_API_KEY:'mock-key-only',WEBSITE_NOTIFICATION_TO:'contact@ifranchise.in',BUCKET:{put:async()=>{uploads++;},delete:async()=>{uploads++;}}});
 console.info=value=>logs.push(value);
 globalThis.fetch=async(url,options)=>{
  if(String(url)==='https://api.resend.com/emails'){
   assert.equal(options.headers.Authorization,'Bearer mock-key-only');
   emails.push({body:options.body,key:options.headers['Idempotency-Key'],savedRows:rows.size});
   if(emailMode==='network')throw Error('private provider details');
   if(emailMode==='temporary')return Response.json({error:'private provider details'},{status:503});
   if(emailMode==='rejected')return Response.json({error:'private provider details'},{status:403});
   if(emailMode==='retry'){emailMode='ok';throw Error('connection lost after provider acceptance');}
   return Response.json({id:'mock-delivery'});
  }
  assert.equal(String(url),env.SHEETS_WEBHOOK_URL,'QA must never call a remote endpoint');
  return realFetch(url,options);
 };
 try{
  await t.test('investor, brand and general save exact columns, then generate safe fixed-recipient email',async()=>{
   for(const extra of [{kind:'investor',brandSlug:'odette',budget:'Exploring',timeframe:'Just exploring'}, {kind:'brand',companyName:'QA Company',companyWebsite:'https://example.com',timeframe:'Just exploring'},{}]){
    const before=emails.length,saved=await submit(extra),sheet=rows.get(saved.reference);
    assert.deepEqual([sheet.tab,sheet.row.length],extra.kind==='investor'?['Franchise Enquiries',19]:extra.kind==='brand'?['Brand Expansion',18]:['General Enquiries',16]);
    assert.equal(saved.reference,'IF-'+saved.session_id);assert.equal(sheet.row[4],base.phone);assert(sheet.row.includes('http://127.0.0.1:3019/contact-us'));assert(!JSON.stringify(sheet).includes('PRIVATE'));assert(!JSON.stringify(sheet).includes('untrusted'));
    if(extra.kind)assert.equal(sheet.row.at(-1),'Visitor message:\n'+base.message);
    const mail=JSON.parse(emails[before].body);
    assert.equal(mail.from,'iFranchise <contact@ifranchise.in>');assert.deepEqual(mail.to,['contact@ifranchise.in']);assert.equal(mail.reply_to,base.email);
    for(const text of [base.name,base.email,base.phone,base.message,'IST','/contact-us'])assert(mail.text.includes(text),text);
    assert(mail.html.includes('&lt;our plans&gt;'));assert(!mail.html.includes('<our plans>'));assert(!mail.text.includes('/admin/'));assert(!mail.text.includes('PRIVATE'));assert(!mail.text.includes(saved.id));
    assert.equal(emails.length,before+1);assert(emails[before].savedRows>0);noCopies();
   }
  });
  await t.test('failure, HTML, malformed JSON, false/mismatched acknowledgements never report success or send email',async()=>{
   for(mode of ['fail','html','json','false','mismatch','bad-duplicate']){
    const before=emails.length,{req}=await input();const response=await enquiry(req);
    assert.equal(response.status,503);const result=await response.json();assert.equal(result.code,'sheets_unconfirmed');assert.equal(result.received,undefined);assert.equal(emails.length,before);noCopies();
   }mode='ok';
  });
  await t.test('concurrent/repeated requests and changed client IDs preserve one row and one notification',async()=>{
   const {req,payload}=await input(),beforeRows=rows.size,beforeEmails=emails.length;
   const [a,b]=await Promise.all([acceptSubmission(req,payload),acceptSubmission(req,{...payload,id:crypto.randomUUID()})]);
   const c=await acceptSubmission(req,{...payload,message:'Changed retry content must not send another notification.'});
   assert.equal(a.reference,b.reference);assert.equal(a.reference,c.reference);assert.equal(rows.size,beforeRows+1);assert.equal(emails.length,beforeEmails+1);noCopies();
  });
  await t.test('failed Sheets request can retry successfully without hidden D1 persistence',async()=>{
   const {req,payload}=await input(),before=rows.size;mode='fail';await assert.rejects(()=>acceptSubmission(req,payload),e=>e.status===503);noCopies();mode='ok';
   await acceptSubmission(req,payload);assert.equal(rows.size,before+1);noCopies();
  });
  await t.test('lost Sheets acknowledgement retries without duplicate rows or invented email recovery',async()=>{
   const {req,payload}=await input(),before=rows.size,beforeEmails=emails.length;mode='lost-response';
   await assert.rejects(()=>acceptSubmission(req,payload),e=>e.status===503);mode='ok';await acceptSubmission(req,payload);
   assert.equal(rows.size,before+1);assert.equal(emails.length,beforeEmails,'Existing contract cannot prove original notification state');noCopies();
  });
  await t.test('transient Resend retry keeps the exact body and idempotency key; exhausted failure preserves lead',async()=>{
   for(const next of ['retry','temporary','network','rejected']){
    emailMode=next;const before=emails.length,beforeRows=rows.size;await submit();const sent=emails.slice(before);
    assert.equal(rows.size,beforeRows+1);assert.equal(sent.length,next==='rejected'?1:2);
    if(sent.length===2){assert.equal(sent[0].body,sent[1].body);assert.equal(sent[0].key,sent[1].key);}noCopies();
   }emailMode='ok';
  });
  await t.test('disabled mode, missing credentials and recipient restrictions never redirect mail or persist payloads',async()=>{
   const before=emails.length;
   for(const [key,value] of [['EMAIL_MODE','disabled'],['RESEND_API_KEY',''],['WEBSITE_NOTIFICATION_TO','attacker@example.com'],['EMAIL_ALLOWED_RECIPIENTS','qa.visitor@gmail.com'],['EMAIL_ENVIRONMENT','']]){
    const previous=env[key];env[key]=value;await submit({to:'attacker@example.com',recipient:'attacker@example.com'});env[key]=previous;
   }assert.equal(emails.length,before);noCopies();
  });
  await t.test('Worker responds to persisted leads while notifications finish in waitUntil',async()=>{
   let background;const {req,payload}=await input();
   const result=await withIntakeContext({waitUntil:p=>{background=p;}},()=>acceptSubmission(req,payload));
   assert(rows.has(result.reference));assert(background);await background;noCopies();
  });
  await t.test('privacy and résumé applications fail clearly without D1/R2 fallback',async()=>{
   const before=requests.length;
   const privacy=await input({kind:'privacy',requestType:'Access my information'}),pr=await enquiry(privacy.req);
   assert.equal(pr.status,503);assert.equal((await pr.json()).code,'privacy_unavailable');
   const job=await input({kind:'job',jobSlug:'business-development-trainee',experienceType:'fresher',qualification:'Bachelor’s degree',educationStatus:'Completed',course:'Commerce',institution:'QA College'});
   for(const [file,expected] of [['%PDF-1.4\nsynthetic',503],['not pdf',422]]){
    const form=new FormData();form.set('payload',JSON.stringify(job.payload));form.set('resume',new Blob([file],{type:'application/pdf'}),'test.pdf');
    const headers=new Headers(job.req.headers);headers.delete('content-type');
    const res=await application(new Request(job.req.url.replace('enquiries','applications'),{method:'POST',headers,body:form}));
    assert.equal(res.status,expected);const body=await res.json();assert.equal(body.received,undefined);if(expected===503)assert.equal(body.code,'applications_unavailable');
   }assert.equal(requests.length,before);noCopies();
  });
  await t.test('validation, origin, expiry and rate limits remain enforced before delivery',async()=>{
   const {req,payload}=await input(),before=requests.length;
   await assert.rejects(()=>acceptSubmission(new Request(req.url,{method:'POST',headers:{origin:'https://evil.test'}}),payload),e=>e.status===403);
   for(const changes of [{email:'bad'},{phone:'+1415'},{consent:false},{state:'karnataka'},{brandSlug:'not-real',kind:'investor',budget:'Exploring',timeframe:'Just exploring'}])await assert.rejects(()=>acceptSubmission(req,{...payload,...changes}),e=>e.status===422);
   await assert.rejects(()=>acceptSubmission(req,{...payload,token:crypto.randomUUID()}),e=>e.status===419);
   await DB.prepare('UPDATE intake_sessions SET expires_at=0 WHERE id=?').bind(payload.token).run();await assert.rejects(()=>acceptSubmission(req,payload),e=>e.status===419);
   assert.equal(requests.length,before);noCopies();
   const rate=await input();for(let n=0;n<12;n++)await acceptSubmission(rate.req,rate.payload);
   await assert.rejects(()=>acceptSubmission(rate.req,rate.payload),e=>e.status===429);noCopies();
  });
  await t.test('missing/invalid endpoint, signing key and timed-out Sheets calls fail closed',async()=>{
   const record={id:crypto.randomUUID(),reference:'IF-test',kind:'general',payload:JSON.stringify(base),created_at:new Date().toISOString()};
   for(const cfg of [{},{...env,SHEETS_WEBHOOK_URL:'https://evil.test/exec'},{...env,INTAKE_SIGNING_KEY:'invalid'}])await assert.rejects(()=>saveToSheets(cfg,record,'https://example.test'));
   const previous=globalThis.fetch;globalThis.fetch=async()=>{throw new DOMException('timeout','TimeoutError');};
   try{await assert.rejects(()=>submit(),e=>e.status===503);}finally{globalThis.fetch=previous;}noCopies();
  });
  await t.test('historical D1 rows remain intact and can still sync without creating lead/email copies',async()=>{
   const id=crypto.randomUUID();await DB.prepare('INSERT INTO website_submissions (id,reference,session_id,kind,payload,created_at,sheet_status,attempts) VALUES (?,?,?,?,?,?,?,0)').bind(id,'IF-'+id,crypto.randomUUID(),'general',JSON.stringify(base),'2026-11-01T00:00:00Z','pending').run();
   const before=emails.length;assert.equal(await retryPending('https://example.test',2),1);
   const old=await DB.prepare('SELECT * FROM website_submissions WHERE id=?').bind(id).first();assert.equal(old.sheet_status,'synced');assert.equal(old.attempts,1);assert.equal(old.payload,JSON.stringify(base));assert.equal(emails.length,before);
   assert.equal(database.prepare('SELECT count(*) n FROM website_submissions').get().n,1);assert.equal(database.prepare('SELECT count(*) n FROM email_outbox').get().n,0);
  });
  assert(!logs.join('').includes(base.email));assert(!logs.join('').includes(base.phone));assert(!logs.join('').includes('mock-key'));assert(!logs.join('').includes('private provider'));
 }finally{globalThis.fetch=realFetch;console.info=realInfo;await new Promise(resolve=>server.close(resolve));}
});
