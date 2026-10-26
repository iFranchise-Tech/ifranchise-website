import {imageDimensions} from '../../../../lib/cms/image-dimensions.mjs';
import {env} from 'cloudflare:workers';
import {adminIdentity,assertOrigin,boundedBody,CmsError,db,failure,response} from '../../../../lib/cms/auth';
import {canEdit,SCOPES} from '../../../../lib/cms/policy.mjs';
export async function POST(req:Request){try{
 assertOrigin(req);const me=await adminIdentity();if(Number(req.headers.get('content-length'))>9*1024*1024)throw new CmsError(413,'Choose a file under 8 MB.');
 const body=await boundedBody(req,9*1024*1024);const form=await new Request(req.url,{method:'POST',headers:{'Content-Type':req.headers.get('content-type')||''},body:body as any}).formData(),file=form.get('file'),scope=String(form.get('scope'));if(!SCOPES.includes(scope)||!canEdit(me,scope))throw new CmsError(403,'You cannot upload to this section.');
 if(!(file instanceof File)||file.size>8*1024*1024||file.size<8)throw new CmsError(422,'Choose a PNG, JPEG, WebP or PDF under 8 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer()),head=new TextDecoder().decode(bytes.slice(0,16));
 const mime=bytes[0]===137&&head.slice(1,4)==='PNG'?'image/png':bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':head.startsWith('RIFF')&&head.slice(8,12)==='WEBP'?'image/webp':head.startsWith('%PDF-')?'application/pdf':null;
 if(!mime)throw new CmsError(422,'Choose a PNG, JPEG, WebP or PDF.');
 let dimensions;try{if(mime.startsWith('image/'))dimensions=imageDimensions(bytes,mime)}catch(e:any){throw new CmsError(422,e.message)}
 if(!env.BUCKET)throw new CmsError(503,'Media storage is unavailable.');
 const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','application/pdf':'pdf'}[mime]!,id=crypto.randomUUID()+'.'+ext,now=new Date().toISOString();
 await env.BUCKET.put('cms/'+id,bytes,{httpMetadata:{contentType:mime}});
 try{await db().batch([db().prepare('INSERT INTO cms_media (id,name,mime,size,scope,uploaded_by,created_at) VALUES (?,?,?,?,?,?,?)').bind(id,file.name.slice(0,200),mime,file.size,scope,me.email,now),db().prepare('INSERT INTO cms_events (id,record_id,action,actor,note,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),scope+':media','upload',me.email,file.name.slice(0,200),now)]);}catch(e){await env.BUCKET.delete('cms/'+id);throw e;}
 return response({url:'/media/'+id,name:file.name,mime,...dimensions});
 }catch(e){return failure(e)}}
