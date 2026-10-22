import {createSession,intakeFailure} from '../../../../lib/intake/server';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{return await createSession(req)}catch(e){return intakeFailure(e)}}
