import {env} from 'cloudflare:workers';
import {adminIdentity,assertOrigin,boundedBody,CmsError,response,failure} from '../../../../lib/cms/auth';
import {emailLimit,flushEmails,retryEmail} from '../../../../lib/email/service';
async function superAdmin(){const me=await adminIdentity();if(me.role!=='super_admin')throw new CmsError(403,'Only a Super Admin can manage email delivery.');return me;}
export async function GET() {
  try {
    await superAdmin();
    const rows=await env.DB!.prepare('SELECT id,kind,status,provider_id,attempts,last_error,created_at,updated_at FROM email_outbox ORDER BY created_at DESC LIMIT 100').all();
    return response({emails:rows.results});
  } catch(error){return failure(error);}
}
export async function POST(req:Request) {
  try {
    assertOrigin(req);const me=await superAdmin();await emailLimit(env,'flush:'+me.email,10);
    if(req.headers.get('content-type')?.includes('application/json')) {
      let body;try{body=JSON.parse(new TextDecoder().decode(await boundedBody(req,2048)));}catch{throw new CmsError(400,'Invalid request.');}
      if(typeof body.id!=='string'||body.id.length>100)throw new CmsError(422,'Choose a delivery.');
      await retryEmail(env,body.id,me.email);
    }
    return response(await flushEmails(env));
  }
  catch(error){return failure(error);}
}
