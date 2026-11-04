import test from 'node:test';
import assert from 'node:assert/strict';
import {websiteEmail,websiteConfirmationEmail,WEBSITE_FROM} from '../lib/email/templates.mjs';
import {captureConfirmationOrigin,showConfirmation,confirmationReturn,safeReturnPath} from '../lib/intake/confirmation.mjs';
import {readReceipt,submissionError} from '../lib/intake/receipt.mjs';
import {validateIntake} from '../lib/intake/validation.mjs';
import {NOTICE_VERSION} from '../lib/intake/constants.mjs';
const origin='https://preview.example.test',id='ebaa35bb-43db-4243-a539-9847936b01e4';
const data={name:'Ananya Rao',email:'ananya.rao@gmail.com',phone:'+919123456789',state:'Karnataka',city:'Bengaluru',brandName:'Odette',companyName:'Ananya Foods',companyWebsite:'https://example.test',budget:'₹25–50 lakh',timeframe:'Just exploring',jobTitle:'Business Development Manager',qualification:'Bachelor’s degree',course:'Commerce',educationStatus:'Completed',institution:'Sample College',experience:'2 years',employmentStatus:'Currently employed',noticePeriod:'30 days',profile:'https://example.test/profile',message:'Please discuss <my plans> & investment.',coverNote:'Interested in <this role>.',secret:'DO-NOT-INCLUDE'};
for(const kind of ['investor','brand','general','job'])test(`${kind}: internal and customer emails have separate recipients, safe details and real record links`,()=>{
 const record={id,kind,payload:JSON.stringify(data),reference:'IF-'+id,created_at:'2026-11-03T06:00:00Z',resume_key:'PRIVATE-RESUME'};
 const internal=websiteEmail({to:['contact@ifranchise.in'],record,origin}),customer=websiteConfirmationEmail({record,origin});
 assert.deepEqual(internal.to,['contact@ifranchise.in']);assert.deepEqual(customer.to,[data.email]);
 for(const email of [internal,customer]){assert.equal(email.from,WEBSITE_FROM);assert(email.html.includes('max-width:600px'));assert(email.text.includes(data.name));assert(!email.html.includes('DO-NOT-INCLUDE'));assert(!email.text.includes('PRIVATE-RESUME'));assert(!email.subject.includes(id));assert(!email.html.includes('<my plans>'));assert(!email.html.includes('<this role>'));assert(email.text.includes('Karnataka'));}
 assert(internal.text.includes(data.email));assert(internal.text.includes(data.phone));assert(internal.text.includes('3 Nov 2026'));assert(internal.text.includes('IST'));assert(internal.text.includes(`${origin}/admin/inbox/${id}`));
 assert(customer.text.includes('There’s no need to submit again'));assert(!customer.text.includes('/admin'));assert(!customer.text.includes(id));assert.equal(customer.reply_to,'contact@ifranchise.in');
 if(kind!=='job')assert(internal.html.includes('&lt;my plans&gt;'));else assert(internal.html.includes('&lt;this role&gt;'));
});
test('all public forms preserve pre-submit context, query, fragment and scroll without personal data',()=>{
 for(const kind of ['investor','brand','general','job','privacy']){
  const values=new Map(),storage={setItem:(k,v)=>values.set(k,v),getItem:k=>values.get(k)},win={sessionStorage:storage,location:{pathname:'/franchise/odette',search:'?journey=investor&brand=odette&email=private',hash:'#enquire'},scrollY:450};
  const target=captureConfirmationOrigin(win,kind);win.location.pathname='/';let next;showConfirmation(win,p=>next=p,target);
  assert.equal(next,'/thank-you');assert.deepEqual(confirmationReturn(storage),{path:'/franchise/odette?journey=investor&brand=odette#enquire',y:450,kind});assert(![...values.values()].join('').includes('private'));
 }
});
test('return destinations reject external, encoded and normalized privileged routes',()=>{
 for(const path of ['https://evil.test','//evil.test','/\\evil.test','/%2f%2fevil.test','/%5cevil.test','/%61dmin/inbox','/foo/../admin','/foo/%2e%2e/api/private','/%2561dmin','/cms/activate','/thank-you','/franchise/foo/thank-you','/a%0ab'])assert.equal(safeReturnPath(path),null,path);
 assert.equal(safeReturnPath('/resources/articles?q=business%20growth&page=2#results'),'/resources/articles?q=business%20growth&page=2#results');
});
test('HTML, redirects, malformed JSON and false receipts cannot trigger confirmation or expose raw errors',async()=>{
 for(const response of [new Response('<!DOCTYPE html>',{status:503,headers:{'content-type':'text/html'}}),new Response('not json',{headers:{'content-type':'application/json'}}),Response.json({received:false}),Response.json({received:true,reference:''}),Response.json({error:'Unexpected token <html>'},{status:400}),Response.json({error:'private stack trace'},{status:500})])await assert.rejects(()=>readReceipt(response),e=>!submissionError(e).includes('<')&&!submissionError(e).includes('stack')&&!submissionError(e).includes('Unexpected'));
 await assert.rejects(()=>readReceipt(Response.json({error:'Choose a state or union territory.'},{status:422})),/Choose a state/);
 assert.equal((await readReceipt(Response.json({received:true,reference:'IF-saved'}))).reference,'IF-saved');
});
test('server requires canonical state, accepts custom cities and drops client recipients',()=>{
 const p={...data,id,kind:'general',adult:true,consent:true,noticeVersion:NOTICE_VERSION,city:'Kengeri',to:'attacker@evil.test',recipient:'attacker@evil.test'};
 assert.equal(validateIntake(p).city,'Kengeri');assert.equal(validateIntake(p).state,'Karnataka');assert.equal(validateIntake(p).to,undefined);
 assert.throws(()=>validateIntake({...p,state:undefined}));assert.throws(()=>validateIntake({...p,state:'karnataka'}));
});
test('Sheets-only messages contain lead context without inventing a CMS record',()=>{
 for(const kind of ['investor','brand','general']){
  const record={id,kind,payload:JSON.stringify({...data,sourcePage:'/list-your-brand',source:{utm_campaign:'Approved campaign'}}),created_at:'2026-11-03T06:00:00Z'};
  const email=websiteEmail({to:['contact@ifranchise.in'],record,origin,storage:'sheets'});
  for(const value of [data.name,data.phone,data.email,data.message,'IST','/list-your-brand'])assert(email.text.includes(value),value);
  assert(!email.text.includes('/admin/'));assert(!email.text.includes(id));assert(!email.text.includes('website inbox'));
 }
});
test('unsupported receiver features and Sheets errors show approved recovery guidance only',async()=>{
 for(const [code,message] of [['privacy_unavailable','contact@ifranchise.in'],['applications_unavailable','temporarily unavailable'],['sheets_unconfirmed','Your details are still here']]){
  await assert.rejects(()=>readReceipt(Response.json({code,error:'private provider payload'},{status:503})),e=>submissionError(e).includes(message)&&!submissionError(e).includes('private provider'));
 }
 await assert.rejects(()=>readReceipt(Response.json({code:'unknown',error:'private details'},{status:503})),e=>!submissionError(e).includes('private details'));
});
