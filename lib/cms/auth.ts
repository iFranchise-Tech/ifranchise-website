import {env} from 'cloudflare:workers';
import {getAccessUser} from '../access-auth';
import {workEmail} from './policy.mjs';
import {CmsError} from './errors';
import {displayNameForSuperAdmin,isConfiguredSuperAdmin} from './super-admins.mjs';
export {CmsError} from './errors';
export function db(){if(!env.DB)throw new CmsError(503,'The content service is unavailable.');return env.DB;}
export function memberFromRow(r:any){return {...r,userId:r.user_id,scopes:Array.isArray(JSON.parse(r.scopes))?JSON.parse(r.scopes):Object.keys(JSON.parse(r.scopes)).filter(k=>JSON.parse(r.scopes)[k].view),permissions:Array.isArray(JSON.parse(r.scopes))?undefined:JSON.parse(r.scopes),expiresAt:r.expires_at,updatedAt:r.updated_at};}
export async function getMembers(){return (await db().prepare('SELECT * FROM cms_members ORDER BY name').all()).results.map(memberFromRow);}
export async function adminIdentity(){
 const user=await getAccessUser();
 if(!user)throw new CmsError(401,'Sign in to continue.');
 const email=user.email.toLowerCase().trim();if(!workEmail(email))throw new CmsError(403,'This account does not have access.');
 if(isConfiguredSuperAdmin(email,env)){
  const now=new Date().toISOString();
  const name=displayNameForSuperAdmin(email,user.fullName||'');
  await db().prepare(`INSERT INTO cms_members (email,user_id,name,role,scopes,manager,status,expires_at,version,created_at,updated_at)
   VALUES (?,?,?,'super_admin','[]',NULL,'active',NULL,1,?,?)
   ON CONFLICT(email) DO UPDATE SET
    user_id=CASE WHEN cms_members.user_id IS NULL THEN excluded.user_id ELSE cms_members.user_id END,
    name=CASE WHEN cms_members.name IS NULL OR trim(cms_members.name)='' THEN excluded.name ELSE cms_members.name END,
    role='super_admin',scopes='[]',manager=NULL,status='active',expires_at=NULL,
    updated_at=excluded.updated_at,version=cms_members.version+1
   WHERE (cms_members.user_id IS NULL OR cms_members.user_id=excluded.user_id)
    AND (cms_members.user_id IS NULL OR cms_members.role!='super_admin' OR cms_members.status!='active'
     OR cms_members.scopes!='[]' OR cms_members.manager IS NOT NULL OR cms_members.expires_at IS NOT NULL
     OR cms_members.name IS NULL OR trim(cms_members.name)='')`).bind(email,user.userId,name,now,now).run();
 }
 let row:any=await db().prepare('SELECT * FROM cms_members WHERE email=?').bind(email).first();
 if(!row||row.status==='suspended')throw new CmsError(403,'This account does not have access.');
 if(row.role==='super_admin'&&!isConfiguredSuperAdmin(email,env))throw new CmsError(403,'Super Admin access is restricted to the configured accounts.');
 if(row.user_id&&row.user_id!==user.userId)throw new CmsError(403,'This account does not match the invited identity.');
 if(row.status==='invited'){
  if(row.invitation_required)throw new CmsError(403,'Open your invitation email to activate this account. Ask your Super Admin to resend it if needed.');
  if(row.expires_at<new Date().toISOString())throw new CmsError(403,'Your invitation has expired. Ask your administrator to renew it.');
  await db().prepare("UPDATE cms_members SET user_id=?,status='active',updated_at=?,version=version+1 WHERE email=? AND status='invited' AND user_id IS NULL").bind(user.userId,new Date().toISOString(),email).run();
  row=await db().prepare('SELECT * FROM cms_members WHERE email=?').bind(email).first();
 }
 if(row.status!=='active'||row.user_id!==user.userId)throw new CmsError(403,'This account does not have access.');
 return memberFromRow(row);
}
export function assertOrigin(req:Request){const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)throw new CmsError(403,'This request is not permitted.');if(req.headers.get('sec-fetch-site')==='cross-site')throw new CmsError(403,'This request is not permitted.');}
export function response(data:any,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export function failure(e:any){if(e instanceof CmsError)return response({error:e.message},e.status);console.error('CMS error',e);return response({error:'The change could not be completed. Please try again.'},500)}
export async function boundedBody(req:Request,limit:number){
 const reader=req.body?.getReader();if(!reader)throw new CmsError(400,'The request is empty.');
 const parts:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new CmsError(413,'The request is too large.');}parts.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length;}return bytes;
}
