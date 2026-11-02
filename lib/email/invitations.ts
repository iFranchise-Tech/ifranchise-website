import {env} from 'cloudflare:workers';
import {getAccessUser} from '../access-auth';
import {CmsError} from '../cms/errors';
import {randomToken,tokenHash} from './crypto.mjs';
import {emailLimit,emailOrigin,emailReady,outboxStatement,flushEmails} from './service';
import {invitationEmail} from './templates.mjs';
import {finishDelivery} from '../intake/context';

export async function prepareInvitation(email:string,name:string,role:string,eventId:string) {
  emailReady(env);
  const token=randomToken(),hash=await tokenHash(token),now=Date.now();
  const guard='EXISTS (SELECT 1 FROM cms_events WHERE id=?)';
  const emailRow=await outboxStatement(env,{key:'invitation:'+eventId,kind:'invitation',source:email,
    message:invitationEmail({email,name,role,origin:emailOrigin(env),token}),condition:guard,values:[eventId]});
  return [
    env.DB!.prepare(`UPDATE cms_invitation_tokens SET used_at=? WHERE email=? AND used_at IS NULL AND ${guard}`).bind(now,email,eventId),
    env.DB!.prepare(`UPDATE email_outbox SET status='cancelled',payload=NULL WHERE kind='invitation' AND source_ref=? AND status IN ('queued','retry','captured','blocked') AND ${guard}`).bind(email,eventId),
    env.DB!.prepare(`INSERT INTO cms_invitation_tokens(token_hash,email,expires_at,created_at) SELECT ?,?,?,? WHERE ${guard}`).bind(hash,email,now+14*864e5,now,eventId),
    emailRow.statement,
  ];
}
export async function acceptInvitation(token:unknown) {
  const user=await getAccessUser();
  if(!user)throw new CmsError(401,'Sign in with your invited work account first.');
  await emailLimit(env,'activate:'+user.email,12,600000);
  if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))throw new CmsError(422,'This invitation is invalid or expired.');
  const hash=await tokenHash(token),now=Date.now(),stamp=new Date(now).toISOString(),email=user.email.trim().toLowerCase(),eventId=crypto.randomUUID();
  const welcome=await outboxStatement(env,{key:'activation:'+hash,kind:'activation',source:email,condition:'EXISTS (SELECT 1 FROM cms_events WHERE id=?)',values:[eventId]});
  const notification=await outboxStatement(env,{key:'admin:'+eventId,kind:'admin',source:eventId,condition:'EXISTS (SELECT 1 FROM cms_events WHERE id=?)',values:[eventId]});
  // The membership transition, one-time consumption, audit event and notifications
  // are one D1 transaction. A GET/email scanner never consumes an invitation.
  const result=await env.DB!.batch([
    env.DB!.prepare(`UPDATE cms_members SET status='active',user_id=?,invitation_required=0,expires_at=NULL,version=version+1,updated_at=?
      WHERE email=? AND status='invited' AND invitation_required=1 AND (user_id IS NULL OR user_id=?) AND expires_at>?
      AND EXISTS (SELECT 1 FROM cms_invitation_tokens WHERE token_hash=? AND email=? AND used_at IS NULL AND expires_at>?)`)
      .bind(user.userId,stamp,email,user.userId,stamp,hash,email,now),
    env.DB!.prepare(`INSERT INTO cms_events(id,record_id,action,actor,snapshot,note,created_at) SELECT ?,?,'accept invitation',?,NULL,'Account activated',? WHERE changes()=1`).bind(eventId,'team:'+email,email,stamp),
    env.DB!.prepare('UPDATE cms_invitation_tokens SET used_at=? WHERE token_hash=? AND EXISTS (SELECT 1 FROM cms_events WHERE id=?)').bind(now,hash,eventId),
    welcome.statement,notification.statement,
  ]);
  if(!result[0].meta.changes)throw new CmsError(422,'This invitation is invalid, expired, already used, or belongs to another account.');
  await finishDelivery(flushEmails(env));
}
