import {published} from '../../lib/cms/public';
export const dynamic='force-dynamic';
import {Catalogue} from '../../components/catalogue';
import {Breadcrumb} from '../../components/ui';
export const metadata={title:'Explore Franchise Opportunities in India',description:'Compare franchise brands in India by sector, starting investment and operating model. View business details, brochures and enquiry options.',alternates:{canonical:'/franchise-opportunities'}};
export default async function Opportunities(){const brands=await published('franchises');return <main id="main" className="opportunities-page"><section className="opportunities-hero"><div className="page-wrap"><Breadcrumb label="Franchise opportunities"/><div className="opportunities-intro"><h1>Franchise opportunities<br/><span>in India</span></h1><p>Find franchise opportunities that match your budget, interests and preferred role in the business. Use the filters to compare brands, then explore the costs, space and support you’ll need to discuss.</p></div></div></section><div className="page-wrap opportunities-content"><Catalogue brands={brands}/></div></main>}
