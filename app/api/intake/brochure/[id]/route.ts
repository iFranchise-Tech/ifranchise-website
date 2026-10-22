import {env} from 'cloudflare:workers';
import {db,assertOrigin,CmsError} from '../../../../../lib/cms/auth';
import {published} from '../../../../../lib/cms/public';
import {intakeFailure,jsonBody} from '../../../../../lib/intake/server';
export const dynamic='force-dynamic';
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){try{
 assertOrigin(req);const {id}=await params,p=await jsonBody(req);
 const row:any=await db().prepare('SELECT payload FROM website_submissions WHERE id=? AND session_id=? AND kind=?').bind(id,String(p.token||''),'investor').first();if(!row)throw new CmsError(403,'Submit an enquiry to request this brochure.');
 const data=JSON.parse(row.payload);if(!data.brochureRequested)throw new CmsError(403,'This enquiry did not request a brochure.');
 const brand=(await published('franchises')).find(b=>b.slug===data.brandSlug);if(!brand?.brochure||brand.brochureEnabled===false)throw new CmsError(404,'This brochure is unavailable.');
 const key=brand.brochure.startsWith('/media/')?'cms/'+brand.brochure.slice(7):brand.brochure.replace(/^\//,'');
 const file=await env.BUCKET?.get(key);if(!file)throw new CmsError(404,'Your enquiry was received. The brochure is being updated; our team can help.');
 return new Response(file.body,{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="'+brand.slug+'-brochure.pdf"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch(e){return intakeFailure(e)}}
