import {published} from '../../lib/cms/public';
export const dynamic='force-dynamic';
import {Catalogue} from '../../components/catalogue';
import {Breadcrumb} from '../../components/ui';
export const metadata={title:'Explore Franchise Opportunities in India',description:'Compare franchise brands in India by sector, starting investment and operating model. View business details, brochures and enquiry options.',alternates:{canonical:'/franchise-opportunities'}};
import {OpportunitiesPage} from '../../components/opportunities-page';
import {publishedFaq} from '../../lib/cms/public';
export default async function Page(){return <OpportunitiesPage brands={await published('franchises')} faqs={await publishedFaq('opportunities')} industries={await published('industries')}/>;}
