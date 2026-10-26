// Synthetic requests only; never run this against hosted or delivery-enabled environments.
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {NOTICE_VERSION} from '../lib/intake/constants.mjs';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:3018';
assert.match(origin,/^http:\/\/127\.0\.0\.1:\d+$/);
assert(!process.env.SHEETS_WEBHOOK_URL&&!process.env.INTAKE_SIGNING_KEY);
for(const file of ['.dev.vars','.dev.vars.local','.env','.env.local','.env.development','.env.development.local'])if(existsSync(file))assert(!/^\s*(?:SHEETS_WEBHOOK_URL|INTAKE_SIGNING_KEY)\s*=/m.test(readFileSync(file,'utf8')),'Use a local preview without delivery credentials.');
const headers={'Content-Type':'application/json',Origin:origin},admin={...headers,Cookie:'__sites_local_auth=1'};
let checks=0;
async function api(path,body,expected=200,auth=headers){const r=await fetch(origin+path,{method:body?'POST':'GET',headers:auth,body:body?JSON.stringify(body):undefined}),d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));checks++;return d;}
const base={id:crypto.randomUUID(),name:'Validation Test',phone:'+91 9123456789',phoneCountry:'IN',email:'validation-qa@ifranchise.in',city:'Bengaluru',state:'Karnataka',consent:true,adult:true,noticeVersion:NOTICE_VERSION,sourcePage:'/contact-us',trap:''};
const variations=[{kind:'investor',brandSlug:'emori',budget:'Exploring',timeframe:'Just exploring'},{kind:'brand',companyName:'Local validation test',timeframe:'Just exploring'},{kind:'general',message:'Local validation test only.'},{kind:'privacy',requestType:'Access my information'}];
const job={kind:'job',jobSlug:'business-development-trainee',experienceType:'fresher',qualification:'Bachelor’s degree',course:'B.Com',educationStatus:'Completed',institution:'Test College'};
async function application(payload,expected){const f=new FormData();f.set('payload',JSON.stringify(payload));f.set('resume',new Blob(['%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF'],{type:'application/pdf'}),'local-validation.pdf');const r=await fetch(origin+'/api/intake/applications',{method:'POST',headers:{Origin:origin},body:f}),d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));checks++;return d;}
for(const body of [...variations,job]){
 const send=(change,expected)=>body.kind==='job'?application({...base,...body,...change},expected):api('/api/intake/enquiries',{...base,...body,...change},expected);
 for(const email of ['user@','user@gmail','user@@gmail.com','user name@gmail.com','user..name@gmail.com','user@gmial.com','user@example.com','user@mail.invalid','user@mail.test']){const d=await send({email},422);assert(d.error);}
 if(body.kind!=='privacy')for(const phone of ['912345678','91234567890','5123456789','09123456789','919123456789','91234abc89'])await send({phone,phoneCountry:'IN'},422);
 // Valid formats pass validation but require a real, unexpired intake session.
 await send({email:' valid+test@gmail.com ',phone:'81234567',phoneCountry:'SG'},419);
}
console.log('Public APIs: malformed inputs rejected with 422; valid formats advance to session validation.');
const overview=await api('/api/admin',undefined,200,admin);assert.equal(overview.me.role,'super_admin');
const fresh=(await api('/api/admin?kind=jobs',undefined,200,admin)).blank;
const slug='contact-validation-qa-'+Date.now(),draft={...fresh,slug,title:'Local validation QA',dept:'Testing',location:'Remote',aboutRole:'Local draft only',responsibilities:['Test'],requirements:['Test']};
for(const email of ['a..b@ifranchise.in','user@@ifranchise.in','user@ifranchise','user@gmial.com','user@example.com','user@gmail.com']){
 await api('/api/admin',{action:'save',kind:'jobs',slug,version:0,payload:{...draft,applyEmail:email}},422,admin);
 await api('/api/admin',{action:'member',version:0,payload:{name:'Local QA',email,role:'editor',status:'invited',scopes:['jobs'],manager:overview.me.email}},422,admin);
}
const saved=await api('/api/admin',{action:'save',kind:'jobs',slug,version:0,payload:{...draft,applyEmail:' HR@IFRANCHISE.IN '}},200,admin);assert.equal(saved.record.draft.applyEmail,'hr@ifranchise.in');assert.equal(saved.record.live,null);
console.log('Admin APIs: invalid job/invitation email rejected; valid job email normalized in a private draft.');
for(const body of [...variations,job]){
 const {token}=await api('/api/intake/session',{},200),id=crypto.randomUUID();
 await new Promise(r=>setTimeout(r,1600));
 const p={...base,...body,token,id,email:' validation-qa@ifranchise.in ',phone:'+91 91234-56789'};
 const first=body.kind==='job'?await application(p,200):await api('/api/intake/enquiries',p);
 assert.equal(first.received,true);
 const repeat=body.kind==='job'?await application(p,200):await api('/api/intake/enquiries',p);
 assert.equal(repeat.reference,first.reference);
 const records=(await api('/api/admin/intake',undefined,200,admin)).records,stored=records.find(r=>r.id===id);assert(stored);assert.equal(stored.payload.email,'validation-qa@ifranchise.in');if(body.kind!=='privacy')assert.equal(stored.payload.phone,'+919123456789');assert.equal(stored.sheet_status,body.kind==='privacy'?'not_applicable':'pending');assert.equal(stored.attempts,0);
 console.log(body.kind+': valid submission stored locally, normalized and duplicate-safe; no external delivery.');
}
console.log('PASS '+checks+' HTTP checks, including all intake kinds and both admin email endpoints.');
