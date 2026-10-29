import {headers} from 'next/headers';
import {env} from 'cloudflare:workers';
import {BrandIdentity} from '../brand-identity';
import {accessSignOutPath} from '../../lib/access-auth';
import {describeStaffSignIn} from '../../lib/access-login.mjs';

export async function StaffSignIn({status, message, returnPath}: {status: number; message: string; returnPath: string}) {
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || 'localhost';
  const protocol = requestHeaders.get('x-forwarded-proto') || 'http';
  const signIn = describeStaffSignIn({teamDomain: env.ACCESS_TEAM_DOMAIN, audience: env.ACCESS_AUD, requestUrl: `${protocol}://${host}${returnPath}`});
  const denied = status !== 401;
  return <main className="cms-access"><header><BrandIdentity/></header><section><span className="cms-kicker">Staff portal</span><h1>{denied ? 'Access unavailable' : signIn.title}</h1><p>{denied ? message : signIn.explanation}</p>{!denied && signIn.href ? <a className="cms-button cms-primary" href={signIn.href} target="_top">Continue with Cloudflare Access</a> : null}{denied ? <a className="cms-button cms-primary" href={accessSignOutPath()} target="_top">Switch account</a> : null}<a className="cms-link" href="/">Return to the website</a></section></main>;
}
