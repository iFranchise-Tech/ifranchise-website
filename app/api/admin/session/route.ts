import {adminIdentity,failure,response} from '../../../../lib/cms/auth';
export const dynamic='force-dynamic';
/** Lightweight revalidation; never cache authorization between requests. */
export async function GET(){
  try {const me=await adminIdentity();return response({email:me.email,version:me.version});}
  catch(error){return failure(error);}
}
