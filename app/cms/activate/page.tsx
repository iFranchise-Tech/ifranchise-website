import {env} from 'cloudflare:workers';
import {getAccessUser} from '../../../lib/access-auth';
import {accessLoginUrl} from '../../../lib/access-login.mjs';
import {emailOrigin} from '../../../lib/email/service';
import {BrandIdentity} from '../../../components/brand-identity';
import {ActivateInvitation} from '../../../components/admin/activate-invitation';
import '../../admin/admin.css';
export const dynamic='force-dynamic';
export const metadata={title:'Accept CMS invitation',robots:{index:false,follow:false},referrer:'no-referrer'};
export default async function ActivatePage(){
  const user=await getAccessUser();let origin='';try{origin=emailOrigin(env);}catch{}
  const loginUrl=origin?accessLoginUrl({teamDomain:env.ACCESS_TEAM_DOMAIN,audience:env.ACCESS_AUD,redirectUrl:origin+'/cms/activate'}):null;
  return <div className="cms-root"><main className="cms-access"><section><BrandIdentity linked={false}/><h1>Join iFranchise CMS</h1><ActivateInvitation email={user?.email||null} loginUrl={loginUrl}/><a className="cms-access-home" href="/">Return to the website</a></section></main></div>;
}
