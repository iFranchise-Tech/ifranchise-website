import {headers,cookies} from 'next/headers';
import {env} from 'cloudflare:workers';
import {verifyAccessToken} from './access-token.mjs';
import {LOCAL_ADMIN_COOKIE, localAdminUserFromRequest} from './local-admin.mjs';
export async function getAccessUser(){
 const h=await headers();
 // The signed session cookie also authenticates protected draft media on
 // public routes; the same signature, issuer, audience and expiry checks apply.
 const token=h.get('cf-access-jwt-assertion')||(await cookies()).get('CF_Authorization')?.value;
 const access=await verifyAccessToken(token,env);
 if(access||import.meta.env.DEV!==true)return access;
 const host=h.get('host');
 if(!host)return null;
 const local=(await cookies()).get(LOCAL_ADMIN_COOKIE)?.value;
 if(!local)return null;
 return localAdminUserFromRequest(new Request(`http://${host}/admin`,{headers:{cookie:`${LOCAL_ADMIN_COOKIE}=${encodeURIComponent(local)}`}}),env,true);
}
export function accessSignOutPath(){return '/cdn-cgi/access/logout';}
