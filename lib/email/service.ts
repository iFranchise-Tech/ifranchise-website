import {CmsError} from '../cms/errors';
import {seal,unseal,tokenHash,verifyWebhook} from './crypto.mjs';
import {activationEmail,adminEmail,websiteEmail} from './templates.mjs';

type Email = {from:string;to:string[];subject:string;html:string;text:string;reply_to?:string};
type Row = {id:string;kind:string;source_ref:string;payload:string|null;status:string;provider_id:string|null;attempts:number;first_attempt_at:number|null;created_at:number};
const database=(env:Cloudflare.Env)=>{if(!env.DB)throw new CmsError(503,'Email service is unavailable.');return env.DB;};
export function logEmail(id:string,status:string,code?:string) { console.info(JSON.stringify({service:'transactional_email',id,status,...(code?{code}:{})})); }
export function emailOrigin(env:Cloudflare.Env) {
  try {
    const url=new URL(env.EMAIL_PUBLIC_ORIGIN||'');
    const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
    if(url.username||url.password||url.search||url.hash||url.pathname!=='/'||(!local&&url.protocol!=='https:')||(local&&import.meta.env.DEV!==true))throw Error();
    return url.origin;
  } catch {throw new CmsError(503,'Email links are not configured for this environment.');}
}
export function emailReady(env:Cloudflare.Env) {
  emailOrigin(env);
  if(!/^[A-Za-z0-9+/]{43}=$/.test(env.EMAIL_OUTBOX_KEY||''))throw new CmsError(503,'Email delivery is not configured.');
  if(env.EMAIL_MODE==='capture'&&import.meta.env.DEV===true)return;
  if(env.EMAIL_MODE!=='resend'||!env.RESEND_API_KEY)throw new CmsError(503,'Email delivery is not configured.');
  if(!['preview','production'].includes(env.EMAIL_ENVIRONMENT||''))throw new CmsError(503,'Email environment is not configured.');
  if((env.EMAIL_ENVIRONMENT!=='production'||import.meta.env.DEV===true)&&!env.EMAIL_ALLOWED_RECIPIENTS?.trim())throw new CmsError(503,'Test email recipients are not configured.');
}
export async function emailLimit(env:Cloudflare.Env,key:string,max:number,windowMs=3600000) {
  const now=Date.now(),bucket=Math.floor(now/windowMs),id=await tokenHash(key)+':'+bucket;
  const result=await database(env).prepare('INSERT INTO email_limits(id,count,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(id,(bucket+2)*windowMs).first<{count:number}>();
  if(!result||result.count>max)throw new CmsError(429,'Please wait before making another request.');
}
export async function outboxStatement(env:Cloudflare.Env,{key,kind,source,message,condition,values=[]}:{key:string;kind:string;source:string;message?:Email;condition?:string;values?:(string|number)[]}) {
  const id=crypto.randomUUID(),now=Date.now();
  const payload=message?await seal(message,env.EMAIL_OUTBOX_KEY,id):null;
  const statement=database(env).prepare(`INSERT OR IGNORE INTO email_outbox(id,dedupe_key,kind,source_ref,payload,created_at,updated_at) SELECT ?,?,?,?,?,?,? ${condition?'WHERE '+condition:''}`).bind(id,key,kind,source,payload,now,now,...values);
  return {id,statement};
}
function recipients(value:string|undefined,fallback:string) {
  const addresses=(value||fallback).split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
  if(!addresses.length||addresses.length>10||addresses.some(v=>!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@ifranchise\.in$/.test(v)))throw Error('invalid_recipients');
  return addresses;
}
async function materialize(env:Cloudflare.Env,row:Row):Promise<Email> {
  const origin=emailOrigin(env),db=database(env);
  if(row.kind==='website') {
    const record=await db.prepare('SELECT * FROM website_submissions WHERE id=?').bind(row.source_ref).first();
    if(!record)throw Error('source_missing');
    return websiteEmail({to:recipients(env.WEBSITE_NOTIFICATION_TO,'contact@ifranchise.in'),record,origin});
  }
  if(row.kind==='activation') {
    const member=await db.prepare('SELECT email,name FROM cms_members WHERE email=?').bind(row.source_ref).first<{email:string;name:string}>();
    if(!member)throw Error('source_missing');
    return activationEmail({...member,origin});
  }
  if(row.kind==='admin') {
    const event=await db.prepare('SELECT action,actor,record_id FROM cms_events WHERE id=?').bind(row.source_ref).first<{action:string;actor:string;record_id:string}>();
    if(!event)throw Error('source_missing');
    return adminEmail({to:recipients(env.CMS_NOTIFICATION_TO,'it@ifranchise.in'),action:event.action,actor:event.actor,reference:event.record_id,origin});
  }
  throw Error('source_missing');
}
const eventStates:Record<string,{status:string;rank:number}>={
  'email.sent':{status:'sent',rank:1},'email.delivery_delayed':{status:'delayed',rank:2},
  'email.delivered':{status:'delivered',rank:3},'email.failed':{status:'failed',rank:4},
  'email.bounced':{status:'bounced',rank:4},'email.suppressed':{status:'suppressed',rank:4},'email.complained':{status:'complained',rank:5},
};
async function reconcile(env:Cloudflare.Env,providerId:string) {
  const events=await database(env).prepare('SELECT type,occurred_at FROM email_delivery_events WHERE provider_id=? ORDER BY occurred_at,id').bind(providerId).all<{type:string;occurred_at:number}>();
  for(const event of events.results) {
    const state=eventStates[event.type];if(!state)continue;
    // Terminal delivery facts cannot regress when older/lower-priority events arrive late.
    await database(env).prepare('UPDATE email_outbox SET status=?,event_at=?,event_rank=?,updated_at=? WHERE provider_id=? AND event_rank<=? AND (event_at<=? OR event_rank<?)')
      .bind(state.status,event.occurred_at,state.rank,Date.now(),providerId,state.rank,event.occurred_at,state.rank).run();
  }
}
async function dispatch(env:Cloudflare.Env,row:Row) {
  const db=database(env),now=Date.now();
  const claim=await db.prepare("UPDATE email_outbox SET status='sending',lease_until=?,updated_at=? WHERE id=? AND ((status IN ('queued','retry') AND next_attempt_at<=?) OR (status='sending' AND lease_until<?))")
    .bind(now+120000,now,row.id,now,now).run();
  if(!claim.meta.changes)return;
  let code='delivery_error',status='retry';
  try {
    if(row.first_attempt_at&&now-row.first_attempt_at>=23*3600000||row.attempts>=8) {
      await db.prepare("UPDATE email_outbox SET status='manual_review',last_error='retry_window_closed',lease_until=0,updated_at=? WHERE id=?").bind(now,row.id).run();
      logEmail(row.id,'manual_review','retry_window_closed');return;
    }
    code='message_unavailable';status='failed';
    const message:Email=row.payload?await unseal(row.payload,env.EMAIL_OUTBOX_KEY,row.id):await materialize(env,row);
    if(row.kind==='invitation') {
      const token=message.text.match(/#token=([A-Za-z0-9_-]{43})/)?.[1];
      const active=token?await db.prepare("SELECT t.token_hash FROM cms_invitation_tokens t JOIN cms_members m ON m.email=t.email WHERE t.token_hash=? AND t.email=? AND t.used_at IS NULL AND t.expires_at>? AND m.status='invited' AND m.invitation_required=1")
        .bind(await tokenHash(token),row.source_ref,now).first():null;
      if(!active){await db.prepare("UPDATE email_outbox SET status='cancelled',payload=NULL,lease_until=0,updated_at=? WHERE id=?").bind(now,row.id).run();return;}
    }
    if(!row.payload) {
      row.payload=await seal(message,env.EMAIL_OUTBOX_KEY,row.id);
      await db.prepare('UPDATE email_outbox SET payload=? WHERE id=?').bind(row.payload,row.id).run();
    }
    if(env.EMAIL_MODE==='capture') {
      await db.prepare("UPDATE email_outbox SET status='captured',lease_until=0,updated_at=? WHERE id=?").bind(now,row.id).run();
      logEmail(row.id,'captured');return;
    }
    code='delivery_error';status='retry';
    const allow=(env.EMAIL_ALLOWED_RECIPIENTS||'').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
    if(allow.length&&message.to.some(to=>!allow.includes(to.toLowerCase()))) {
      status='blocked';code='recipient_not_allowed';throw Error();
    }
    await db.prepare('UPDATE email_outbox SET attempts=attempts+1,first_attempt_at=COALESCE(first_attempt_at,?) WHERE id=?').bind(now,row.id).run();
    const result=await fetch('https://api.resend.com/emails',{
      method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),
      headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`ifranchise/${row.id}`},
      body:JSON.stringify(message),
    });
    if(!result.ok) {
      code=`resend_http_${result.status}`;
      if(![408,409,429].includes(result.status)&&result.status<500)status='failed';
      await result.body?.cancel();throw Error();
    }
    const receipt=await result.json() as {id?:unknown};
    if(typeof receipt.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(receipt.id)){code='invalid_receipt';throw Error();}
    await db.prepare("UPDATE email_outbox SET status='accepted',provider_id=?,last_error=NULL,lease_until=0,updated_at=? WHERE id=?")
      .bind(receipt.id,Date.now(),row.id).run();
    await reconcile(env,receipt.id);
    logEmail(row.id,'accepted');return;
  } catch {
    // Never log provider bodies, recipient addresses, tokens, keys or email payloads.
    await db.prepare('UPDATE email_outbox SET status=?,last_error=?,next_attempt_at=?,lease_until=0,updated_at=? WHERE id=? AND provider_id IS NULL')
      .bind(status,code,now+Math.min(3600000,60000*2**row.attempts),now,row.id).run();
    logEmail(row.id,status,code);
  }
}
export async function flushEmails(env:Cloudflare.Env,max=10) {
  try{emailReady(env);}catch{return {processed:0,configured:false};}
  const rows=await database(env).prepare("SELECT * FROM email_outbox WHERE ((status IN ('queued','retry') AND next_attempt_at<=?) OR (status='sending' AND lease_until<?)) ORDER BY created_at,id LIMIT ?").bind(Date.now(),Date.now(),Math.min(max,20)).all<Row>();
  // Sequential, with a global D1 quota shared by HTTP and scheduled invocations.
  let processed=0;
  for(const row of rows.results) {
    if(env.EMAIL_MODE!=='capture') {
      if(processed)await new Promise(resolve=>setTimeout(resolve,1050));
      try{await emailLimit(env,'resend-global-send',1,1000);}catch{break;}
    }
    await dispatch(env,row);processed++;
  }
  return {processed,configured:true};
}
export async function retryEmail(env:Cloudflare.Env,id:string,actor:string) {
  emailReady(env);
  const now=Date.now(),eventId=crypto.randomUUID();
  const result=await database(env).batch([
    database(env).prepare("UPDATE email_outbox SET status='retry',next_attempt_at=0,updated_at=? WHERE id=? AND provider_id IS NULL AND status IN ('failed','blocked') AND attempts<8 AND (first_attempt_at IS NULL OR first_attempt_at>?)")
      .bind(now,id,now-23*3600000),
    database(env).prepare("INSERT INTO cms_events(id,record_id,action,actor,note,created_at) SELECT ?,?,'retry email',?,'Requested safe delivery retry',? WHERE changes()=1")
      .bind(eventId,'email:'+id,actor,new Date(now).toISOString()),
  ]);
  if(!result[0].meta.changes)throw new CmsError(409,'This delivery cannot be retried safely. Check its provider status before taking further action.');
}
export async function maintainEmailQueue(env:Cloudflare.Env) {
  const now=Date.now();
  await database(env).batch([
    database(env).prepare('DELETE FROM email_limits WHERE expires_at<?').bind(now),
    database(env).prepare('DELETE FROM cms_invitation_tokens WHERE expires_at<?').bind(now-30*864e5),
    database(env).prepare('DELETE FROM email_delivery_events WHERE received_at<?').bind(now-90*864e5),
    database(env).prepare("UPDATE email_outbox SET payload=NULL WHERE updated_at<? AND status IN ('delivered','failed','bounced','complained','suppressed','cancelled','captured','blocked')").bind(now-30*864e5),
  ]);
  return flushEmails(env,20);
}
export async function receiveWebhook(env:Cloudflare.Env,req:Request,raw:string) {
  let id:string;
  try{id=await verifyWebhook(raw,req.headers,env.RESEND_WEBHOOK_SECRET);}catch{throw new CmsError(400,'Invalid webhook signature.');}
  let event:{type:string;created_at:string;data:{email_id:string}};
  try{event=JSON.parse(raw);}catch{throw new CmsError(400,'Invalid webhook.');}
  if(!event||typeof event.type!=='string')throw new CmsError(400,'Invalid webhook.');
  if(!eventStates[event.type])return;
  const time=Date.parse(event.created_at),provider=event.data?.email_id;
  if(!Number.isFinite(time)||typeof provider!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(provider))throw new CmsError(400,'Invalid webhook.');
  await database(env).prepare('INSERT OR IGNORE INTO email_delivery_events(id,provider_id,type,occurred_at,received_at) VALUES (?,?,?,?,?)').bind(id,provider,event.type,time,Date.now()).run();
  await reconcile(env,provider);
  logEmail(id,event.type);
}
