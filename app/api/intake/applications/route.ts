import {acceptSubmission,receipt,intakeFailure} from '../../../../lib/intake/server';
import {assertOrigin,boundedBody,CmsError} from '../../../../lib/cms/auth';
import {MAX_RESUME} from '../../../../lib/intake/validation.mjs';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 assertOrigin(req);if(!req.headers.get('content-type')?.startsWith('multipart/form-data'))throw new CmsError(415,'Use the application form.');
 const bytes=await boundedBody(req,MAX_RESUME+30000);const form=await new Response(bytes,{headers:{'Content-Type':req.headers.get('content-type')!}}).formData();
 let p;try{p=JSON.parse(String(form.get('payload')||''))}catch{throw new CmsError(400,'Invalid application.')}
 if(p.kind!=='job')throw new CmsError(400,'Use the application form.');
 const file=form.get('resume');if(!file||typeof file==='string'||!file.size)throw new CmsError(422,'Upload your resume.');
 const record=await acceptSubmission(req,p,{bytes:new Uint8Array(await file.arrayBuffer()),name:file.name.replace(/[^a-zA-Z0-9 ._-]/g,'').slice(0,120)});
 return await receipt(record,p.token);
 }catch(e){return intakeFailure(e)}}
