import {env} from 'cloudflare:workers';
import {adminIdentity,db,CmsError,failure} from '../../../../../../lib/cms/auth';
import {canViewSubmission} from '../../../../../../lib/intake/access';
export const dynamic='force-dynamic';
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){try{const me=await adminIdentity(),{id}=await params;const row:any=await db().prepare("SELECT * FROM website_submissions WHERE id=? AND kind='job'").bind(id).first();if(!row||!canViewSubmission(me,'job'))throw new CmsError(404,'Application unavailable.');const file=await env.BUCKET?.get(row.resume_key);if(!file)throw new CmsError(404,'Résumé unavailable.');return new Response(file.body,{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="'+(row.resume_name||'resume.pdf').replace(/[^a-zA-Z0-9 ._-]/g,'')+'"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}catch(e){return failure(e)}}
