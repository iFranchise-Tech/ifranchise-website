import {assertOrigin,boundedBody,response,failure,CmsError} from '../../../../../lib/cms/auth';
import {acceptInvitation} from '../../../../../lib/email/invitations';
export async function POST(req:Request) {
  try {
    assertOrigin(req);
    if(!req.headers.get('content-type')?.includes('application/json'))throw new CmsError(415,'Use JSON.');
    let body;try{body=JSON.parse(new TextDecoder().decode(await boundedBody(req,2048)));}catch{throw new CmsError(400,'Invalid request.');}
    await acceptInvitation(body.token);
    return response({activated:true});
  } catch(error) {return failure(error);}
}
