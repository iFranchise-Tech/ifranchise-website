import {finishDelivery} from './context';
import {env} from 'cloudflare:workers';
import {CmsError,db,assertOrigin,boundedBody,response} from '../cms/auth';
import {published} from '../cms/public';
import {validateIntake} from './validation.mjs';
import {validateResume} from './resume.mjs';
import {saveToSheets} from './sheets';
import {notifySavedLead} from '../email/lead-notification';
const config=()=>env as any;
class IntakeUnavailable extends CmsError {constructor(public code:string){super(503,'Your submission could not be confirmed. Please try again.')}}
export function intakeFailure(e:any){return response({error:e instanceof CmsError?e.message:'Your submission could not be saved. Please try again.',...(e instanceof IntakeUnavailable?{code:e.code}:{})},e instanceof CmsError?e.status:503)}
async function hash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(v=>v.toString(16).padStart(2,'0')).join('')}
async function ipHash(req:Request){return hash((req.headers.get('cf-connecting-ip')||'local')+new Date().toISOString().slice(0,10))}
async function limit(req:Request,action:string,max:number){
 const hour=Math.floor(Date.now()/3600000),id=await ipHash(req)+':'+action+':'+hour;
 const r:any=await db().prepare('INSERT INTO intake_limits (id,count,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(id,(hour+2)*3600000).first();
 if(r.count>max)throw new CmsError(429,'Please wait a while before sending another request.');
}
export async function createSession(req:Request){
 assertOrigin(req);await limit(req,'session',40);
 const now=Date.now(),id=crypto.randomUUID();
 await db().batch([db().prepare('DELETE FROM intake_sessions WHERE expires_at<?').bind(now),db().prepare('DELETE FROM intake_limits WHERE expires_at<?').bind(now)]);
 await db().prepare('INSERT INTO intake_sessions (id,ip_hash,created_at,expires_at) VALUES (?,?,?,?)').bind(id,await ipHash(req),now,now+7200000).run();
 return response({token:id});
}
export async function jsonBody(req:Request){if(!req.headers.get('content-type')?.includes('application/json'))throw new CmsError(415,'Use the website form.');try{return JSON.parse(new TextDecoder().decode(await boundedBody(req,24000)))}catch(e){if(e instanceof CmsError)throw e;throw new CmsError(400,'Invalid submission.')}}
export async function deliver(record:any,origin:string){
 if(record.kind==='privacy')return false;
 const {SHEETS_WEBHOOK_URL:url,INTAKE_SIGNING_KEY:key}=config();if(!url||!key)return false;
 try{
  await saveToSheets(config(),record,origin);
  await db().prepare("UPDATE website_submissions SET sheet_status='synced',synced_at=?,attempts=attempts+1 WHERE id=?").bind(new Date().toISOString(),record.id).run();return true;
 }catch{await db().prepare('UPDATE website_submissions SET attempts=attempts+1 WHERE id=?').bind(record.id).run();return false;}
}
export async function retryPending(origin:string,max=5,excludeId=''){const rows=await db().prepare("SELECT * FROM website_submissions WHERE sheet_status='pending' AND id!=? ORDER BY created_at LIMIT ?").bind(excludeId,max).all();let synced=0;for(const r of rows.results)if(await deliver(r,origin))synced++;return synced;}
export async function acceptSubmission(req:Request,p:any,resume?:{bytes:Uint8Array;name:string;type?:string}){
 assertOrigin(req);
 let data:any;try{data=validateIntake(p)}catch(e:any){throw new CmsError(422,e.message)}
 const session:any=await db().prepare('SELECT * FROM intake_sessions WHERE id=?').bind(String(p.token||'')).first();
 if(!session||session.expires_at<Date.now()||session.ip_hash!==await ipHash(req))throw new CmsError(419,'Your form expired. Reload the page and try again.');
 const existing:any=await db().prepare('SELECT * FROM website_submissions WHERE id=? OR session_id=?').bind(p.id,p.token).first();
 // Honor retries of historical D1 submissions without inserting another record.
 if(existing){
  if(existing.id!==p.id||existing.session_id!==p.token)throw new CmsError(409,'This form has already been submitted.');
  if(existing.kind==='privacy')throw new IntakeUnavailable('privacy_unavailable');
  if(existing.sheet_status!=='synced'&&!await deliver(existing,new URL(req.url).origin))throw new IntakeUnavailable('sheets_unconfirmed');
  return existing;
 }
 if(data.kind==='privacy')throw new IntakeUnavailable('privacy_unavailable');
 if(Date.now()-session.created_at<1500)throw new CmsError(429,'Please review your details before sending.');
 await limit(req,'submit',12);
 if(data.kind==='investor'&&data.brandSlug){const brand=(await published('franchises')).find(b=>b.slug===data.brandSlug);if(!brand)throw new CmsError(422,'Select an available franchise.');data.brandName=brand.name;}
 if(data.kind==='job'){const job=(await published('jobs')).find(j=>(j.slug===data.jobSlug||j.id===data.jobSlug)&&j.active!==false);if(!job)throw new CmsError(422,'This role is no longer accepting applications.');data.jobTitle=job.title;if(!resume)throw new CmsError(422,'Upload your resume as a PDF.');}
 if(resume){if(data.kind!=='job')throw new CmsError(422,'Use the job application form to upload a résumé.');try{validateResume(resume)}catch{throw new CmsError(422,'Upload a complete PDF résumé up to 5 MB.')}}
 // Use the server-issued session, not the visitor's freely changeable ID, as
 // the stable Reference. The script's lock provides concurrent deduplication.
 const row={id:session.id,reference:'IF-'+session.id,session_id:session.id,kind:data.kind,payload:JSON.stringify(data),created_at:new Date().toISOString(),sheet_status:'synced'};
 let saved;
 try{saved=await saveToSheets(config(),row,new URL(req.url).origin,resume)}
 catch{throw new IntakeUnavailable(data.kind==='job'?'application_unconfirmed':'sheets_unconfirmed')}
 if(!saved.duplicate)await finishDelivery(notifySavedLead(env,{...row,...(saved.resumeUrl?{resume_name:saved.resumeName,resume_url:saved.resumeUrl}:{})}));

 return row;
}
export async function receipt(record:any,token:string){
 return response({received:true,reference:record.reference,event_id:record.id,message:record.kind==='job'?'Your application has been received.':'Your enquiry has been received.',token});
}
