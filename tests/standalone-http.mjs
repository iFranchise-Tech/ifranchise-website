import {NOTICE_VERSION} from '../lib/intake/constants.mjs';
import assert from 'node:assert/strict';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:3019';
assert.ok(['127.0.0.1','localhost'].includes(new URL(origin).hostname),'Local test only');
const headers={'Content-Type':'application/json',Origin:origin,'cf-connecting-ip':'198.51.100.'+(1+Date.now()%250)};
const base={name:'Export Audit Test',phone:'+919123456789',phoneCountry:'IN',email:'qa-intake@ifranchise.in',city:'Bengaluru',state:'Karnataka',consent:true,adult:true,noticeVersion:NOTICE_VERSION,sourcePage:'/contact-us',trap:''};
const request=(path,p,h=headers)=>fetch(origin+path,{method:'POST',headers:h,body:JSON.stringify(p)});
async function session(){let r=await request('/api/intake/session',{});assert.equal(r.status,200);let {token}=await r.json();await new Promise(r=>setTimeout(r,1600));return token}
const ids=[];
for(const body of [{kind:'investor',brandSlug:'odette',budget:'Exploring',timeframe:'Just exploring'},{kind:'brand',companyName:'Export Test',companyWebsite:'https://ifranchise.in',timeframe:'Just exploring'},{kind:'general',message:'Local export audit only, not a genuine enquiry.'}]){
 const p={...base,...body,token:await session(),id:crypto.randomUUID()};
 for(const phone of ['+9191234567891','+91912345678','+911123456789'])assert.equal((await request('/api/intake/enquiries',{...p,phone})).status,422);
 const good=await request('/api/intake/enquiries',p), receipt=await good.json();assert.equal(good.status,200,JSON.stringify(receipt));assert.equal(receipt.received,true);
 assert.equal((await (await request('/api/intake/enquiries',p)).json()).reference,receipt.reference);ids.push(p.id);console.log(body.kind+': invalid → corrected → accepted → duplicate safe');
}
let p={...base,kind:'general',message:'International number local audit.',phone:'+14155552671',phoneCountry:'US',token:await session(),id:crypto.randomUUID()};assert.equal((await request('/api/intake/enquiries',p)).status,200);ids.push(p.id);
assert.equal((await request('/api/intake/enquiries',{}, {...headers,Origin:'https://untrusted.invalid'})).status,403);
for(const path of ['/api/admin','/api/admin/intake','/api/admin/intake/resume/00000000-0000-4000-8000-000000000000'])assert.equal((await fetch(origin+path)).status,401,path);
for(const path of ['/api/intake/brochure/00000000-0000-4000-8000-000000000000','/api/brochures/odette'])assert.equal((await fetch(origin+path)).status,410);
const job={...base,kind:'job',jobSlug:'export-test-role',token:await session(),id:crypto.randomUUID(),experienceType:'experienced',experienceYears:'2',experienceMonths:'0',employmentStatus:'Currently employed',noticePeriod:'30 days',qualification:'Bachelor’s degree',course:'B.Com',educationStatus:'Completed',institution:'Test College'};
const form=new FormData();form.set('payload',JSON.stringify(job));form.set('resume',new Blob(['%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF'],{type:'application/pdf'}),'export-test.pdf');
let jr=await fetch(origin+'/api/intake/applications',{method:'POST',headers:{Origin:origin,'cf-connecting-ip':headers['cf-connecting-ip']},body:form});let jd=await jr.json();assert.equal(jr.status,200,JSON.stringify(jd));assert.equal(jd.received,true);ids.push(job.id);
console.log('International phone, origin rejection, private admin, brochure removal and private PDF application: passed');
console.log(JSON.stringify({localTestIds:ids}));
