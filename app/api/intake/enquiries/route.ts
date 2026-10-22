import {acceptSubmission,jsonBody,receipt,intakeFailure} from '../../../../lib/intake/server';
import {CmsError} from '../../../../lib/cms/auth';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{const p=await jsonBody(req);if(p.kind==='job')throw new CmsError(400,'Use the application form.');return await receipt(await acceptSubmission(req,p),p.token)}catch(e){return intakeFailure(e)}}
