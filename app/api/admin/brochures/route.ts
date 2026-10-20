import {env} from 'cloudflare:workers';
import {adminIdentity,assertOrigin,boundedBody,CmsError,db,failure,response} from '../../../../lib/cms/auth';
import archive from '../../../../content/brochure-archive.json';
const completedKey='migrations/original-brochures-complete';
async function importActor(req:Request){
 const token=req.headers.get('x-brochure-import-token');
 if(token){
  // One-purpose, owner-provisioned migration credential. It cannot read files,
  // change content or grant admin access, and is consumed after the archive import.
  const expected=(env as any).CMS_BROCHURE_IMPORT_TOKEN;
  if(!expected||token.length>256)throw new CmsError(401,'Import unavailable.');
  const hash=async(s:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
  const [a,b]=await Promise.all([hash(token),hash(expected)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];
  if(diff)throw new CmsError(401,'Import unavailable.');
  if(await env.BUCKET?.head(completedKey))throw new CmsError(410,'The archive migration is complete.');
  return 'Website archive migration';
 }
 const me=await adminIdentity();if(me.role!=='super_admin')throw new CmsError(403,'Only a Super Admin can import the archive.');return me.email;
}
export async function POST(req:Request){try{assertOrigin(req);const actor=await importActor(req);
 const bytes=await boundedBody(req,9*1024*1024);const f=await new Request(req.url,{method:'POST',headers:{'Content-Type':req.headers.get('content-type')||''},body:bytes as any}).formData();const file=f.get('file');if(!(file instanceof File))throw new CmsError(422,'Select a brochure PDF.');const expected=(archive as any)[file.name];if(!expected)throw new CmsError(422,'This file is not in the original brochure archive.');const data=await file.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data))).map(n=>n.toString(16).padStart(2,'0')).join('');if(hash!==expected.sha256)throw new CmsError(422,'This file does not match the original brochure. Use the brand editor for new files.');
 if(!env.BUCKET)throw new CmsError(503,'Media storage is unavailable.');await env.BUCKET.put('brochures/'+file.name,data,{httpMetadata:{contentType:'application/pdf'}});await db().prepare('INSERT INTO cms_events (id,record_id,action,actor,note,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),'franchises:'+expected.slug,'secure brochure import',actor,file.name,new Date().toISOString()).run();
 const items=await Promise.all(Object.keys(archive).map(name=>env.BUCKET!.head('brochures/'+name)));if(items.every(Boolean))await env.BUCKET.put(completedKey,new Date().toISOString());
 return response({name:file.name,imported:true,complete:items.every(Boolean)});
 }catch(e){return failure(e)}}
