import {env} from 'cloudflare:workers';
import {boundedBody,response,failure} from '../../../../lib/cms/auth';
import {receiveWebhook} from '../../../../lib/email/service';
export async function POST(req:Request) {
  try {
    const raw=new TextDecoder().decode(await boundedBody(req,65536));
    await receiveWebhook(env,req,raw);
    return response({received:true});
  } catch(error) {return failure(error);}
}
