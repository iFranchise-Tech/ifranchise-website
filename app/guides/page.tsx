import {guides} from '../../lib/site';
import {Breadcrumb} from '../../components/ui';
import {Icon} from '../../components/icons';
export const metadata={title:'Franchise Guides & Insights',description:'Understand franchise models, prepare for your first enquiry and explore brand readiness with iFranchise guides.',alternates:{canonical:'/guides'}};
export default function Guides(){return <main id="main" className="page-wrap"><Breadcrumb label="Franchise guides"/><div className="page-intro"><h1>Franchise guides</h1><p>Information on franchise operating models, investment enquiries and preparing a business for franchising.</p></div><div className="perspective-grid guide-index">{guides.map(g=><a className="perspective-card guide-text-card" href={'/guides/'+g.slug} key={g.slug}><div className="perspective-copy"><h2>{g.title}</h2><p>{g.intro}</p></div><span className="guide-read">Read guide <Icon name="arrow"/></span></a>)}</div></main>}
