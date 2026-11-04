import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReceiver,PDF,applicationEnvelope} from './apps-script-harness.mjs';
import {validateResume,encodeResume} from '../lib/intake/resume.mjs';
import {MAX_RESUME} from '../lib/intake/validation.mjs';
import {readReceipt} from '../lib/intake/receipt.mjs';

const receiver=createReceiver();
const keys=receiver.keys; // One test key pair; production key is never accessed.
const setup=()=>createReceiver(keys);
const post=(r,data=applicationEnvelope(),pdf=PDF)=>r.post(data,pdf.toString('base64'));

test('PDF validation rejects malformed, oversized, mislabeled and incomplete files',async()=>{
 for(const file of [{bytes:Buffer.from('<html>error</html>'),name:'cv.pdf'},{bytes:PDF,name:'cv.exe'},{bytes:PDF,name:'cv.pdf',type:'text/html'},{bytes:Buffer.from('%PDF-1.4\ntruncated'),name:'cv.pdf'},{bytes:Buffer.alloc(MAX_RESUME+1),name:'cv.pdf'},{bytes:Buffer.alloc(0),name:'cv.pdf'}])assert.throws(()=>validateResume(file));
 for(const type of ['','application/pdf','application/octet-stream'])assert.equal(validateResume({bytes:PDF,name:'../../résumé.pdf',type}),'rsum.pdf');
 const encoded=await encodeResume({bytes:PDF,name:'resume.pdf'});assert.deepEqual(Buffer.from(encoded.base64,'base64'),PDF);assert.equal(encoded.metadata.sha256,createHash('sha256').update(PDF).digest('hex'));
});
test('5 MB PDF encoding is bounded, lossless and accepted by the actual receiver',async()=>{
 const pdf=Buffer.concat([Buffer.from('%PDF-1.7\n'),Buffer.alloc(MAX_RESUME-15,32),Buffer.from('%%EOF\n')]);assert.equal(pdf.length,MAX_RESUME);
 const encoded=await encodeResume({bytes:pdf,name:'cv.pdf'});assert.deepEqual(Buffer.from(encoded.base64,'base64'),pdf);
 const r=setup();assert.equal(post(r,applicationEnvelope(undefined,pdf),pdf).ok,true);assert.equal(r.state.files.size,1);
});
test('signed application saves private PDF before the 21-column row and returns matching proof',()=>{
 const r=setup(),data=applicationEnvelope(),ack=post(r,data);
 assert.equal(ack.ok,true);assert.equal(ack.reference,data.application.row[0]);assert.equal(ack.resume.private,true);assert.equal(ack.resume.sha256,data.application.resume.sha256);
 assert.deepEqual(r.state.operations,['file','row']);const row=r.state.rows.get('Job Applications')[0];assert.equal(row.length,21);assert.equal(row[12],ack.resume.url);assert.equal(row[3],'qa@example.test');
 const file=[...r.state.files.values()][0];assert.deepEqual(file.bytes,PDF);assert.equal(file.sharing,'PRIVATE');assert.deepEqual(file.viewers,[]);
});
test('retries including new timestamps deduplicate files and rows; changed applicant/file cannot replace them',()=>{
 const r=setup(),data=applicationEnvelope();const a=post(r,data);data.timestamp+=1;data.application.row[1]='04/11/2026 11:00 IST';const b=post(r,data);
 assert.equal(b.duplicate,true);assert.equal(b.resume.url,a.resume.url);assert.equal(r.state.files.size,1);assert.equal(r.state.rows.get('Job Applications').length,1);
 data.application.row[3]='different@example.test';assert.equal(post(r,data).ok,false);assert.equal(r.state.rows.get('Job Applications')[0][3],'qa@example.test');
 data.application.row[3]='qa@example.test';const altered=Buffer.from('%PDF-1.4\nchanged\n%%EOF');assert.equal(post(r,applicationEnvelope(undefined,altered),altered).ok,false);assert.equal(r.state.files.size,1);
});
test('file and Sheets failures never acknowledge success; identical retries recover without duplicates',()=>{
 for(const failure of ['createFailure','writeFailure','flushFailure']){
  const r=setup();r.state[failure]=true;assert.equal(post(r).ok,false);r.state[failure]=false;const ack=post(r);assert.equal(ack.ok,true);assert.equal(r.state.files.size,1);assert.equal(r.state.rows.get('Job Applications').length,1);assert.equal(r.state.locked,false);
 }
});
test('private folder is required; shared, nested and wrong-owner folders are rejected without rows/files',()=>{
 for(const changes of [{folderId:''},{folderOwner:'other@example.test'},{folderParent:'shared-parent'},{folderSharing:'ANYONE'},{folderViewers:['reader@example.test']},{folderEditors:['editor@example.test']},{owner:''}]){
  const r=setup();Object.assign(r.state,changes);assert.equal(post(r).ok,false);assert.equal(r.state.files.size,0);assert.equal(r.state.rows.get('Job Applications')?.length||0,0);
 }
});
test('duplicate success requires the original file to still exist, be private and match its signed binding',()=>{
 for(const change of [f=>{f.sharing='ANYONE'},f=>{f.viewers.push('reader@example.test')},f=>{f.bytes[10]^=1},f=>{f.trashed=true},f=>{f.parent='elsewhere'},f=>{f.name='different.pdf'}]){
  const r=setup();post(r);change([...r.state.files.values()][0]);assert.equal(post(r).ok,false);assert.equal(r.state.rows.get('Job Applications').length,1);
 }
 const r=setup();post(r);r.state.files.clear();assert.equal(post(r).ok,false);assert.equal(r.state.files.size,0);
});
test('tampering, stale signatures, invalid payloads and old job format fail before persistence',()=>{
 const r=setup();let data=applicationEnvelope();assert.equal(r.receive({body:JSON.stringify(data),signature:'fake',resume:PDF.toString('base64')}).ok,false);
 data.timestamp-=300001;assert.equal(post(r,data).ok,false);
 data=applicationEnvelope();assert.equal(post(r,data,Buffer.from('%PDF-1.4\ntampered\n%%EOF')).ok,false);
 for(const mutate of [d=>{d.application.row.pop()},d=>{d.application.row[12]='https://evil.test/resume.pdf'},d=>{d.application.resume.size=MAX_RESUME+1},d=>{d.application.resume.name='payload.exe'},d=>{d.application.tab='__proto__'},d=>{d.application.row[2]={text:'bad'}},d=>{d.version=1}]){data=applicationEnvelope();mutate(data);assert.equal(post(r,data).ok,false);}
 data=applicationEnvelope();assert.equal(r.post({...data.application,timestamp:Date.now()}).ok,false);assert.equal(r.state.files.size,0);assert.equal(r.state.rows.size,0);
});
test('existing non-job tabs, columns, formula escaping and duplicate protection remain unchanged',()=>{
 const r=setup();for(const [tab,width] of [['Franchise Enquiries',19],['Brand Expansion',18],['General Enquiries',16]]){
  const row=Array(width).fill('');row[0]='IF-00000000-0000-4000-8000-000000000002';row[2]='=DANGEROUS()';row[4]='+919876543210';
  assert.equal(r.post({timestamp:Date.now(),tab,row}).ok,true);assert.equal(r.post({timestamp:Date.now(),tab,row}).duplicate,true);assert.equal(r.state.rows.get(tab).length,1);assert.equal(r.state.rows.get(tab)[0].length,width);assert.equal(r.state.rows.get(tab)[0][2],"'=DANGEROUS()");assert.equal(r.state.rows.get(tab)[0][4],"'+919876543210");
 }assert.equal(r.state.files.size,0);
});
test('historical job rows and headers are never rewritten to fabricate a résumé',()=>{
 const r=setup(),data=applicationEnvelope(),row=data.application.row.slice();row[12]='https://example.test/admin/submissions/old';r.state.rows.set('Job Applications',[row]);assert.equal(post(r,data).ok,false);assert.deepEqual(r.state.rows.get('Job Applications'),[row]);assert.equal(r.state.files.size,0);
 const wrong=setup();wrong.state.header='Unexpected';assert.equal(post(wrong).ok,false);assert.equal(wrong.state.files.size,0);
});
test('unconfirmed résumé saves produce useful retry guidance rather than a success message',async()=>{
 await assert.rejects(()=>readReceipt(Response.json({code:'application_unconfirmed'},{status:503})),/application and résumé were saved securely/);
});
