import {finishDelivery} from './context';
import {env} from 'cloudflare:workers';
import {CmsError,db,assertOrigin,boundedBody,response} from '../cms/auth';
import {published} from '../cms/public';
import {validateIntake,sheetEntry,MAX_RESUME} from './validation.mjs';
const config=()=>env as any;
export function intakeFailure(e:any){return response({error:e instanceof CmsError?e.message:'Your submission could not be saved. Please try again.'},e instanceof CmsError?e.status:503)}
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
 const {SHEETS_WEBHOOK_URL:url,INTAKE_SIGNING_KEY:key}=config();if(!url||!key)return false;
 try{
  const body=JSON.stringify({...sheetEntry(record,origin),timestamp:Date.now()});
  const privateKey=await crypto.subtle.importKey('jwk',JSON.parse(key),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
  const sig=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',privateKey,new TextEncoder().encode(body));
  const signature=btoa(String.fromCharCode(...new Uint8Array(sig))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({body,signature}),signal:AbortSignal.timeout(20000)});
  const receipt:any=await r.json();if(!r.ok||receipt.ok!==true||receipt.reference!==record.reference)throw Error('Unconfirmed delivery');
  await db().prepare("UPDATE website_submissions SET sheet_status='synced',synced_at=?,attempts=attempts+1 WHERE id=?").bind(new Date().toISOString(),record.id).run();return true;
 }catch{await db().prepare('UPDATE website_submissions SET attempts=attempts+1 WHERE id=?').bind(record.id).run();return false;}
}
export async function retryPending(origin:string,max=5){const rows=await db().prepare("SELECT * FROM website_submissions WHERE sheet_status='pending' ORDER BY created_at LIMIT ?").bind(max).all();let synced=0;for(const r of rows.results)if(await deliver(r,origin))synced++;return synced;}
export async function acceptSubmission(req:Request,p:any,resume?:{bytes:Uint8Array;name:string}){
 assertOrigin(req);
 let data:any;try{data=validateIntake(p)}catch(e:any){throw new CmsError(422,e.message)}
 const session:any=await db().prepare('SELECT * FROM intake_sessions WHERE id=?').bind(String(p.token||'')).first();
 if(!session||session.expires_at<Date.now()||session.ip_hash!==await ipHash(req))throw new CmsError(419,'Your form expired. Reload the page and try again.');
 const existing:any=await db().prepare('SELECT * FROM website_submissions WHERE id=? OR session_id=?').bind(p.id,p.token).first();
 if(existing){if(existing.id!==p.id)throw new CmsError(409,'This form has already been submitted.');if(existing.sheet_status!=='synced')await finishDelivery(deliver(existing,new URL(req.url).origin));return existing;}
 if(Date.now()-session.created_at<1500)throw new CmsError(429,'Please review your details before sending.');
 await limit(req,'submit',12);
 if(data.kind==='investor'&&data.brandSlug){const brand=(await published('franchises')).find(b=>b.slug===data.brandSlug);if(!brand)throw new CmsError(422,'Select an available franchise.');data.brandName=brand.name;if(data.brochureRequested&&(!brand.brochure||brand.brochureEnabled===false))throw new CmsError(422,'This brochure is unavailable.');}
 if(data.kind==='job'){const job=(await published('jobs')).find(j=>(j.slug===data.jobSlug||j.id===data.jobSlug)&&j.active!==false);if(!job)throw new CmsError(422,'This role is no longer accepting applications.');data.jobTitle=job.title;if(!resume)throw new CmsError(422,'Upload your résumé as a PDF.');}
 const resumeKey=resume?'applications/'+p.id+'/resume.pdf':null;
 if(resume){if(resume.bytes.length>MAX_RESUME||new TextDecoder().decode(resume.bytes.slice(0,5))!=='%PDF-')throw new CmsError(422,'Upload a PDF résumé up to 5 MB.');if(!env.BUCKET)throw new CmsError(503,'File uploads are unavailable.');await env.BUCKET.put(resumeKey!,resume.bytes,{httpMetadata:{contentType:'application/pdf'}});}
 const row={id:p.id,reference:'IF-'+p.id,session_id:p.token,kind:data.kind,payload:JSON.stringify(data),resume_key:resumeKey,resume_name:resume?.name||null,created_at:new Date().toISOString(),sheet_status:'pending'};
 try{await db().prepare('INSERT INTO website_submissions (id,reference,session_id,kind,payload,resume_key,resume_name,created_at,sheet_status,attempts) VALUES (?,?,?,?,?,?,?,?,?,0)').bind(row.id,row.reference,row.session_id,row.kind,row.payload,row.resume_key,row.resume_name,row.created_at,'pending').run();}
 catch(e){const saved:any=await db().prepare('SELECT * FROM website_submissions WHERE id=? AND session_id=?').bind(p.id,p.token).first();if(saved)return saved;throw e;}
 await finishDelivery(Promise.all([deliver(row,new URL(req.url).origin),retryPending(new URL(req.url).origin,2)]));
 return row;
}
export async function receipt(record:any,token:string){
 const data=JSON.parse(record.payload);
 return response({received:true,reference:record.reference,event_id:record.id,message:record.kind==='job'?'Your application has been received.':'Your enquiry has been received.',...(data.brochureRequested?{brochureUrl:'/api/intake/brochure/'+record.id}:{}),token});
}
