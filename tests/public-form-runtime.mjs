// Local browser integration harness: real API handlers + isolated in-memory D1.
// No Worker credentials, live storage, Sheets delivery or email provider calls.
import {readFileSync,readdirSync} from 'node:fs';
import {env} from 'cloudflare:workers';
import {localD1} from './local-d1.mjs';
import {POST as enquiry} from '../app/api/intake/enquiries/route.ts';
import {POST as application} from '../app/api/intake/applications/route.ts';
import {POST as session} from '../app/api/intake/session/route.ts';
export const {DB,database}=localD1();
for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())database.exec(readFileSync('drizzle/'+file,'utf8'));
Object.assign(env,{DB,EMAIL_MODE:'disabled',SHEETS_WEBHOOK_URL:'',INTAKE_SIGNING_KEY:'',BUCKET:{put:async()=>{},delete:async()=>{}}});
export async function handle(request){const path=new URL(request.url).pathname;return (path.endsWith('/session')?session:path.endsWith('/applications')?application:enquiry)(request)}
