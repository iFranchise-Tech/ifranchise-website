import {Icon} from '../components/icons';
import {HeroSculpture,MotionControl} from '../components/experience';
import {SITE} from '../lib/site';
import {socialLinks} from '../lib/contact';
export const metadata={alternates:{canonical:'/'}};
export default function Home(){
 const schema={'@context':'https://schema.org','@type':'Organization',name:'iFranchise',url:SITE.url,areaServed:'India',email:SITE.email,telephone:SITE.phone,logo:SITE.url+'/assets/wordmark.svg',sameAs:socialLinks.map(s=>s.href)};
 return <main id="main" className="refined-home">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
  <section className="signature-hero">
   <HeroSculpture/>
   <div className="signature-content">
    <h1>Start a franchise.<br/><em>Expand your<br/>business.</em></h1>
    <p className="hero-intro">Compare franchise opportunities, understand the investment and plan your business expansion with iFranchise.</p>
    <div className="hero-actions"><a className="button light" href="/franchise-opportunities">Explore franchises <Icon name="arrow"/></a><a className="text-link on-dark" href="/franchise-solutions">Franchise solutions <Icon name="arrow"/></a></div>
   </div>
   <div className="hero-footnote"><span>Bengaluru-based. Working across India.</span><MotionControl/></div>
  </section>
  <section className="section home-support">
   <div className="home-support-photo"><img src="/stock/business-consultation.jpg" alt="Professionals reviewing business information together" width="1600" height="1067" loading="lazy"/></div>
   <div className="home-support-copy"><h2>Support for investors<br/>and business owners</h2><p>Franchise decisions involve the business, the people running it and the terms of the partnership. We help you work through those details.</p><div className="home-audiences"><div><h3>For investors</h3><p>Compare business formats, review costs and clarify your involvement before choosing an opportunity.</p></div><div><h3>For brands</h3><p>Develop your franchise model, prepare partner information and plan how to support new locations.</p></div></div><a className="text-link" href="/about-us">About iFranchise <Icon name="arrow"/></a></div>
  </section>
  <section className="home-process"><div className="section"><div className="home-section-heading"><h2>Our consulting process</h2><p>The scope depends on your business and where you are in the decision.</p></div><ol className="home-process-list">{[['Understand your requirements','We start with your preferred location, investment range and operating involvement, or your brand’s current operations and expansion plans.'],['Review the business and model','We work through the format, costs, responsibilities and information needed to assess the next step.'],['Prepare the next steps','We organise the questions, documentation and partner discussions relevant to your requirements.']].map(([title,copy],i)=><li key={title}><span>0{i+1}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol></div></section>
  <section className="section home-resources"><div><h2>Franchise guides<br/>and resources</h2><p>Read about operating models, investment planning and the preparation involved in franchising a business.</p><a className="text-link" href="/insights">Browse insights & resources <Icon name="arrow"/></a></div><ul>{[['Franchise models','How FOFO, FOCO and FICO divide ownership and operations.'],['Investor preparation','Questions to ask about costs, support and agreement terms.'],['Brand development','Documentation, operating standards and partner readiness.']].map(([title,copy])=><li key={title}><h3>{title}</h3><p>{copy}</p></li>)}</ul></section>
 </main>;
}
