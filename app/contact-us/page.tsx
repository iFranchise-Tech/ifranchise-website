import {published} from '../../lib/cms/public';
import {ContactPage} from '../../components/contact-page';
export const dynamic='force-dynamic';
export const metadata={title:'Contact iFranchise',description:'Talk to iFranchise about choosing a franchise, developing your franchise programme or planning business expansion.',alternates:{canonical:'/contact-us'}};
export default async function Page(){return <ContactPage brands={await published('franchises')}/>;}
