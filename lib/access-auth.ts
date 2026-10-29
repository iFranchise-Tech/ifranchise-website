import {headers,cookies} from 'next/headers';
import {env} from 'cloudflare:workers';
import {verifyAccessToken} from './access-token.mjs';
export async function getAccessUser(){
 const h=await headers();
 // The signed session cookie also authenticates protected draft media on
 // public routes; the same signature, issuer, audience and expiry checks apply.
 const token=h.get('cf-access-jwt-assertion')||(await cookies()).get('CF_Authorization')?.value;
 return verifyAccessToken(token,env);
}
export function accessSignInPath(returnTo='/admin'){return returnTo.startsWith('/')&&!returnTo.startsWith('//')?returnTo:'/admin';}
export function accessSignOutPath(_returnTo='/'){return '/cdn-cgi/access/logout';}
