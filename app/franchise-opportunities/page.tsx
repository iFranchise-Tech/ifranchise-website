import {published} from '../../lib/cms/public';
export const dynamic='force-dynamic';
import {Catalogue} from '../../components/catalogue';
import {Breadcrumb} from '../../components/ui';
export const metadata={title:'Explore Franchise Opportunities in India',description:'Compare franchise brands in India by sector, starting investment and operating model. View business details and send an enquiry.',alternates:{canonical:'/franchise-opportunities'}};
import {OpportunitiesPage} from '../../components/opportunities-page';
import {publishedFaq} from '../../lib/cms/public';
export default async function Page(){const [brands,faqs,industries]=await Promise.all([published('franchises'),publishedFaq('opportunities'),published('industries')]);return <OpportunitiesPage brands={brands} faqs={faqs} industries={industries}/>;}
