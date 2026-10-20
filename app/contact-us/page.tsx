import {published} from '../../lib/cms/public';
import {EnquiryForm} from '../../components/enquiry';
import {Crumb} from '../../components/premium';
import {ArrowUpRight,Phone,Mail} from 'lucide-react';
import {Icon} from '../../components/icons';
import {SocialLinks} from '../../components/shell';
import {whatsappUrl} from '../../lib/contact';
export const dynamic='force-dynamic';
export const metadata={title:'Contact iFranchise',description:'Talk to iFranchise about choosing a franchise, developing your franchise programme or planning business expansion.',alternates:{canonical:'/contact-us'}};
import {ContactPage} from '../../components/contact-page';
import {publishedFaq} from '../../lib/cms/public';
export default async function Page(){return <ContactPage brands={await published('franchises')} faqs={await publishedFaq('contact-us')}/>;}
