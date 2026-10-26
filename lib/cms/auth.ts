import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../app/chatgpt-auth';
import {workEmail} from './policy.mjs';
import {CmsError} from './errors';
export {CmsError} from './errors';
export function db(){if(!env.DB)throw new CmsError(503,'The content service is unavailable.');return env.DB;}
export function memberFromRow(r:any){return {...r,userId:r.user_id,scopes:Array.isArray(JSON.parse(r.scopes))?JSON.parse(r.scopes):Object.keys(JSON.parse(r.scopes)).filter(k=>JSON.parse(r.scopes)[k].view),permissions:Array.isArray(JSON.parse(r.scopes))?undefined:JSON.parse(r.scopes),expiresAt:r.expires_at,updatedAt:r.updated_at};}
export async function getMembers(){return (await db().prepare('SELECT * FROM cms_members ORDER BY name').all()).results.map(memberFromRow);}
export async function adminIdentity(){
 let user=await getChatGPTUser();
 if(!user)throw new CmsError(401,'Sign in to continue.');
 // This is the portable starter's local preview identity. Vite removes this branch from production.
 if(import.meta.env.DEV&&user.userId==='local_seedy')user={...user,email:'preview@ifranchise.in',displayName:'Preview Admin',fullName:'Preview Admin'};
 const email=user.email.toLowerCase().trim();if(!workEmail(email))throw new CmsError(403,'This account does not have access.');
 const owner=import.meta.env.DEV?'preview@ifranchise.in':(env as any).CMS_SUPER_ADMIN_EMAIL?.toLowerCase();
 if(email===owner){const now=new Date().toISOString();await db().prepare("INSERT INTO cms_members (email,user_id,name,role,scopes,manager,status,version,created_at,updated_at) SELECT ?,?,?,'super_admin','[]',NULL,'active',1,?,? WHERE NOT EXISTS (SELECT 1 FROM cms_members WHERE role='super_admin') ON CONFLICT(email) DO NOTHING").bind(email,user.userId,user.fullName||'Abdul',now,now).run();}
 let row:any=await db().prepare('SELECT * FROM cms_members WHERE email=?').bind(email).first();
 if(!row||row.status==='suspended')throw new CmsError(403,'This account does not have access.');
 if(row.user_id&&row.user_id!==user.userId)throw new CmsError(403,'This account does not match the invited identity.');
 if(row.status==='invited'){
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
