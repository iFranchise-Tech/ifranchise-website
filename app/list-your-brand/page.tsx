import {published} from '../../lib/cms/public';
import {EnquiryForm} from '../../components/enquiry';
import {Crumb,PremiumLink,SectionHeading} from '../../components/premium';
import {Plus,Check,ArrowDown} from 'lucide-react';
import {SITE} from '../../lib/site';
export const dynamic='force-dynamic';
export const metadata={title:'List your Brand — Franchise Development & Expansion',description:'Develop your franchise model, prepare your operations and present your brand to prospective franchise partners with iFranchise.',alternates:{canonical:'/list-your-brand'}};
import {SolutionsPage} from '../../components/solutions-page';
import {publishedFaq} from '../../lib/cms/public';
export default async function Page(){return <SolutionsPage brands={await published('franchises')} faqs={await publishedFaq('list-your-brand')}/>;}
