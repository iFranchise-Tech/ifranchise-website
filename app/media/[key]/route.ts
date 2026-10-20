import {env} from 'cloudflare:workers';
import {adminIdentity,db} from '../../../lib/cms/auth';
import {canView} from '../../../lib/cms/policy.mjs';
export async function GET(req:Request,{params}:{params:Promise<{key:string}>}){
 const {key}=await params;if(!/^[a-f0-9-]{36}\.(png|jpg|webp|pdf)$/.test(key))return new Response('Not found',{status:404});
 const meta:any=await db().prepare('SELECT * FROM cms_media WHERE id=?').bind(key).first();if(!meta)return new Response('Not found',{status:404});
 const live=await db().prepare('SELECT id FROM cms_records WHERE live IS NOT NULL AND instr(live,?)>0 LIMIT 1').bind('"/media/'+key+'"').first();
 if(!live||meta.mime==='application/pdf'){try{if(!canView(await adminIdentity(),meta.scope))return new Response('Not found',{status:404})}catch{return new Response('Not found',{status:404})}}
 const obj=await env.BUCKET?.get('cms/'+key);if(!obj)return new Response('Not found',{status:404});
 return new Response(obj.body,{headers:{'Content-Type':meta.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",'Content-Disposition':'inline'}});
}
