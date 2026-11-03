// Browser QA imports this bundled harness, never the deployed intake service.
// Real API handlers, disposable D1, signed mock Sheets and mock Resend only.
import {readFileSync,readdirSync} from 'node:fs';
import {generateKeyPairSync,verify} from 'node:crypto';
import assert from 'node:assert/strict';
import {env} from 'cloudflare:workers';
import {localD1} from './local-d1.mjs';
import {POST as enquiry} from '../app/api/intake/enquiries/route.ts';
import {POST as application} from '../app/api/intake/applications/route.ts';
import {POST as session} from '../app/api/intake/session/route.ts';
export const {DB,database}=localD1();
for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())database.exec(readFileSync('drizzle/'+file,'utf8'));
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
export const rows=new Map(),emails=[];
let sheetsFailure=false;
export function failSheets(value){sheetsFailure=value;}
Object.assign(env,{DB,EMAIL_MODE:'resend',EMAIL_ENVIRONMENT:'preview',EMAIL_ALLOWED_RECIPIENTS:'contact@ifranchise.in',EMAIL_PUBLIC_ORIGIN:'https://preview.example.test',RESEND_API_KEY:'mock-only',WEBSITE_NOTIFICATION_TO:'contact@ifranchise.in',SHEETS_WEBHOOK_URL:'https://script.google.com/macros/s/ISOLATED-TEST/exec',INTAKE_SIGNING_KEY:JSON.stringify(privateKey.export({format:'jwk'})),BUCKET:{put:async()=>{throw Error('Private uploads must not reach Cloudflare');},delete:async()=>{throw Error('No storage mutations in QA');}}});
globalThis.fetch=async(url,options)=>{
 if(String(url)===env.SHEETS_WEBHOOK_URL){
  const envelope=JSON.parse(options.body),body=JSON.parse(envelope.body);
  assert(verify('RSA-SHA256',Buffer.from(envelope.body),publicKey,Buffer.from(envelope.signature,'base64url')));
  assert.equal(body.row.length,{'Franchise Enquiries':19,'Brand Expansion':18,'General Enquiries':16}[body.tab]);
  if(sheetsFailure)return Response.json({ok:false},{status:503});
  const duplicate=rows.has(body.row[0]);if(!duplicate)rows.set(body.row[0],body);
  return Response.json({ok:true,reference:body.row[0],duplicate});
 }
 assert.equal(String(url),'https://api.resend.com/emails','No external calls permitted in browser QA');
 const mail=JSON.parse(options.body);assert.equal(mail.from,'iFranchise <contact@ifranchise.in>');assert.deepEqual(mail.to,['contact@ifranchise.in']);
 assert(rows.has('IF-'+options.headers['Idempotency-Key'].split('/').at(-1)),'Save must precede email');
 emails.push(mail);return Response.json({id:'mock-delivery'});
};
export async function handle(request){
 const path=new URL(request.url).pathname;
 const result=await(path.endsWith('/session')?session:path.endsWith('/applications')?application:enquiry)(request);
 // Advance only fixture session time to exercise the production anti-bot gate without sleeps.
 if(path.endsWith('/session'))database.exec('UPDATE intake_sessions SET created_at=created_at-2000');
 return result;
}
export function assertNoLeadCopies(){
 assert.equal(database.prepare('SELECT COUNT(*) n FROM website_submissions').get().n,0);
 assert.equal(database.prepare('SELECT COUNT(*) n FROM email_outbox').get().n,0);
}
