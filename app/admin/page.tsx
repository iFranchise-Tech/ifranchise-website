import {AdminPortal} from '../../components/admin/portal';
import {adminIdentity,CmsError} from '../../lib/cms/auth';
import {BrandIdentity} from '../../components/brand-identity';
import {chatGPTSignInPath,chatGPTSignOutPath} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Admin(){
 let me;try{me=await adminIdentity()}catch(e){const error=e instanceof CmsError?e.message:'The admin portal is temporarily unavailable.';return <main className="cms-access"><header><BrandIdentity/></header><section><span className="cms-kicker">Website admin</span><h1>{e instanceof CmsError&&e.status===401?'Sign in':'Access unavailable'}</h1><p>{error}</p><a className="cms-button cms-primary" href={e instanceof CmsError&&e.status===401?chatGPTSignInPath('/admin'):chatGPTSignOutPath('/admin')} target="_top">{e instanceof CmsError&&e.status===401?'Continue to sign in':'Switch account'}</a><a className="cms-link" href="/">Return to website</a></section></main>}
 return <AdminPortal me={me}/>;
}
