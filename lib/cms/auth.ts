import {env} from 'cloudflare:workers';
import {getAccessUser} from '../access-auth';
import {ROLES,workEmail} from './policy.mjs';
import {CmsError} from './errors';
import {isConfiguredSuperAdmin} from './super-admins.mjs';
export {CmsError} from './errors';
export function db(){if(!env.DB)throw new CmsError(503,'The content service is unavailable.');return env.DB;}
export function memberFromRow(r:any){return {...r,userId:r.user_id,scopes:Array.isArray(JSON.parse(r.scopes))?JSON.parse(r.scopes):Object.keys(JSON.parse(r.scopes)).filter(k=>JSON.parse(r.scopes)[k].view),permissions:Array.isArray(JSON.parse(r.scopes))?undefined:JSON.parse(r.scopes),expiresAt:r.expires_at,updatedAt:r.updated_at};}
export async function getMembers(){return (await db().prepare('SELECT * FROM cms_members ORDER BY name').all()).results.map(memberFromRow);}
export async function adminIdentity(){
 const user=await getAccessUser();
 if(!user)throw new CmsError(401,'Your session has expired. Sign in again to continue.','session_expired');
 const email=user.email.toLowerCase().trim();if(!workEmail(email))throw new CmsError(403,'Use your invited @ifranchise.in work account. Personal email accounts cannot access this portal.','company_account_required');
 // Membership and roles come from D1, including the two pre-approved Super
 // Admin rows. Signing in must never recreate, elevate or reactivate a member.
 let row:any=await db().prepare('SELECT * FROM cms_members WHERE email=?').bind(email).first();
 if(!row)throw new CmsError(403,'This work account has not been invited. Ask your Super Admin for a CMS invitation.','invitation_required');
 if(!['active','invited'].includes(row.status))throw new CmsError(403,'Your CMS access has been disabled. Contact your Super Admin to review your access.','account_disabled');
 if(!ROLES.includes(row.role)||row.role==='super_admin'&&!isConfiguredSuperAdmin(email,env))throw new CmsError(403,'This account does not have an approved CMS role. Contact your Super Admin.','role_unavailable');
 if(row.user_id&&row.user_id!==user.userId)throw new CmsError(403,'This account does not match the invited identity. Contact your Super Admin.','identity_mismatch');
 if(row.status==='invited'){
  const now=new Date().toISOString();
  if(!row.expires_at||!Number.isFinite(Date.parse(row.expires_at))||row.expires_at<=now)throw new CmsError(403,'Your invitation has expired. Ask your Super Admin for a new invitation.','invitation_expired');
  if(row.invitation_required)throw new CmsError(403,'Open your invitation email to activate this account. Ask your Super Admin to resend it if needed.','invitation_required');
  // Legacy/pre-approved invitations already stored in D1 can bind once. The
  // conditional write also checks expiry/version against concurrent revocation.
  await db().prepare("UPDATE cms_members SET user_id=?,status='active',expires_at=NULL,updated_at=?,version=version+1 WHERE email=? AND status='invited' AND user_id IS NULL AND invitation_required=0 AND expires_at>? AND version=?").bind(user.userId,now,email,now,row.version).run();
  row=await db().prepare('SELECT * FROM cms_members WHERE email=?').bind(email).first();
 }
 if(!row||row.status!=='active'||row.user_id!==user.userId)throw new CmsError(403,'Your CMS access is unavailable. Contact your Super Admin.','account_disabled');
 return memberFromRow(row);
}
export function assertOrigin(req:Request){const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)throw new CmsError(403,'This request is not permitted.');if(req.headers.get('sec-fetch-site')==='cross-site')throw new CmsError(403,'This request is not permitted.');}
export function response(data:any,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export function failure(e:any){if(e instanceof CmsError)return response({error:e.message,...(e.code?{code:e.code}:{})},e.status);console.error('CMS error',e);return response({error:'The change could not be completed. Please try again.'},500)}
export async function boundedBody(req:Request,limit:number){
 const reader=req.body?.getReader();if(!reader)throw new CmsError(400,'The request is empty.');
 const parts:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new CmsError(413,'The request is too large.');}parts.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length;}return bytes;
}
