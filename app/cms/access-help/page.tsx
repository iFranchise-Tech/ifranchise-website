import {BrandIdentity} from '../../../components/brand-identity';
import {AccessHelpForm} from '../../../components/admin/access-help-form';
import '../../admin/admin.css';
export const metadata={title:'CMS access help',robots:{index:false,follow:false}};
export default function AccessHelpPage(){return <div className="cms-root"><main className="cms-access"><section><BrandIdentity/><h1>Help with CMS access</h1><p className="cms-access-lede">Your work account password is managed by Google Workspace through Cloudflare Access. We can email you the recovery guidance.</p><AccessHelpForm/><a className="cms-access-home" href="/admin">Return to CMS sign-in</a></section></main></div>;}
