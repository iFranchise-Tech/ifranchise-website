import {MotionIllustration} from './motion-illustration';
import {jobs} from '../lib/content';
import {Breadcrumb} from './ui';
import {Icon} from './icons';
import {AboutPage,Leadership} from './about-page';
export function CompanyPage({path}:{path:string}){
 if(path==='/about-us')return <AboutPage/>;
 if(path==='/team')return <main id="main" className="about-page"><section className="editorial-hero"><div className="page-wrap"><Breadcrumb label="Leadership"/><div className="leadership-intro"><h1>Leadership at iFranchise</h1><p>Meet the founders who lead our work with you and the businesses we support.</p></div></div></section><Leadership/></main>;
 return <main id="main"><section className="company-hero"><div className="page-wrap"><Breadcrumb label="Careers"/><div className="company-hero-grid"><div><h1>Careers at iFranchise</h1><p>Join us in helping investors and business owners navigate franchising. Explore roles in consulting, business development and operations.</p><a className="button" href="#open-roles">View open roles <Icon name="arrow"/></a></div><div className="company-photo motion-art-slot"><MotionIllustration scene="careers"/></div></div></div></section><section className="section careers-section" id="open-roles"><div className="section-heading"><h2>Open positions</h2></div>{jobs.map(j=><a className="job-row" key={j.id} href={'/careers/'+j.id}><div><span className="eyebrow">{j.dept}</span><h3>{j.title}</h3><span>{j.type} · {j.location}</span></div><span className="round-arrow"><Icon name="arrow"/></span></a>)}</section></main>;
}
