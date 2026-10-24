import {CareersPage} from './careers-page';
import {published} from '../lib/cms/public';
import {Breadcrumb} from './ui';
import {Icon} from './icons';
import {AboutPage,Leadership} from './about-page';
export async function CompanyPage({path}:{path:string}){
 const jobs=await published('jobs');
 if(path==='/about-us')return <AboutPage/>;
 if(path==='/team')return <main id="main" className="about-page"><section className="editorial-hero"><div className="page-wrap"><Breadcrumb label="Leadership"/><div className="leadership-intro"><h1>Leadership at iFranchise</h1><p>Meet the founders who lead our work with you and the businesses we support.</p></div></div></section><Leadership/></main>;
 return <CareersPage jobs={jobs}/>;
}
