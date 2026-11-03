import {env} from 'cloudflare:workers';
import {assertOrigin,boundedBody,CmsError,response,failure} from '../../../../lib/cms/auth';
import {normalizeWorkEmail} from '../../../../lib/email-validation.mjs';
import {emailLimit,emailOrigin,emailReady,outboxStatement,flushEmails,logEmail} from '../../../../lib/email/service';
import {accessHelpEmail} from '../../../../lib/email/templates.mjs';
import {tokenHash} from '../../../../lib/email/crypto.mjs';
import {finishDelivery} from '../../../../lib/intake/context';
export async function POST(req:Request) {
  try {
    assertOrigin(req);
    await emailLimit(env,'help-ip:'+(req.headers.get('cf-connecting-ip')||'local'),8);
    if(!req.headers.get('content-type')?.includes('application/json'))throw new CmsError(415,'Use JSON.');
    let email:string;
    try{email=normalizeWorkEmail(JSON.parse(new TextDecoder().decode(await boundedBody(req,2048))).email);}catch{throw new CmsError(422,'Enter your iFranchise work email.');}
    // Same result and rate-limit behavior for members and unknown addresses.
    await emailLimit(env,'help-email:'+email,3);
    const reply={message:'If this address has CMS access, an access-help email will be sent. Your password is managed by Google Workspace.'};
    try{emailReady(env);}catch{logEmail('access-help','unavailable','configuration_missing');return response(reply,202);}
    const member=await env.DB!.prepare("SELECT email FROM cms_members WHERE email=? AND status IN ('active','invited')").bind(email).first();
    if(member) {
      const hour=Math.floor(Date.now()/3600000),source=await tokenHash(email);
      const queued=await outboxStatement(env,{key:`access-help:${source}:${hour}`,kind:'access-help',source,message:accessHelpEmail({email,origin:emailOrigin(env)})});
      await queued.statement.run();await finishDelivery(flushEmails(env));
    }
    return response(reply,202);
  } catch(error) {return failure(error);}
}
