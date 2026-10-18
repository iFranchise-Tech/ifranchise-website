import {Icon} from '../components/icons';
import {HeroSculpture,MotionControl} from '../components/experience';
import {HomeExplainer} from '../components/home-explainer';
import {SITE} from '../lib/site';
import {socialLinks} from '../lib/contact';
import {homeQuestions} from '../lib/search-content';
export const metadata={title:'Franchise Consulting Company in India',description:'iFranchise helps investors explore franchise opportunities and helps brands develop and expand franchise businesses in India. Based in Bengaluru.',alternates:{canonical:'/'}};
export default function Home(){
 const entity=SITE.url+'/#organization';
 const schema=[{'@context':'https://schema.org','@type':'Organization','@id':entity,name:'iFranchise',legalName:'IFRANCHISE SERVICES PRIVATE LIMITED',url:SITE.url,description:'Franchise consulting company in Bengaluru serving investors and brands across India.',areaServed:{'@type':'Country',name:'India'},email:SITE.email,telephone:SITE.phone,logo:SITE.url+'/assets/wordmark.svg',address:{'@type':'PostalAddress',streetAddress:'Innov 8 Mantri Commercio, Tower A, No 51, 5th floor, Bellandur',addressLocality:'Bengaluru',addressRegion:'Karnataka',postalCode:'560103',addressCountry:'IN'},sameAs:socialLinks.map(s=>s.href)}, {'@context':'https://schema.org','@type':'Service',name:'Franchise consulting in India',serviceType:'Franchise development, investor guidance and business expansion consulting',provider:{'@id':entity},areaServed:{'@type':'Country',name:'India'},url:SITE.url}, {'@context':'https://schema.org','@type':'FAQPage',mainEntity:homeQuestions.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))}];
 return <main id="main" className="refined-home">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
  <section className="signature-hero franchise-network-hero">
   <HeroSculpture/>
   <div className="signature-content">
    <h1>Franchise consulting<br/><em>for business owners<br/>and investors.</em></h1>
    <p className="hero-intro">iFranchise is a franchise consulting company in India. We help you evaluate franchise opportunities, prepare your business for franchising and plan expansion into new markets.</p>
    <div className="hero-actions"><a className="button light" href="/franchise-opportunities">Explore franchises <Icon name="arrow"/></a><a className="text-link on-dark" href="/list-your-brand">List your Brand <Icon name="arrow"/></a></div>
   </div>
   <div className="hero-footnote"><span>Bengaluru-based. Working across India.</span><MotionControl/></div>
  </section>
  <section className="section home-support">
   <div className="home-support-photo"><img src="/stock/business-consultation.jpg" alt="Professionals reviewing a business plan and investment information" width="1600" height="1067" loading="lazy"/></div>
   <div className="home-support-copy"><h2>Franchise investment and brand expansion services</h2><p>Whether you want to start a business or franchise an existing one, the details matter: investment, location, operating responsibilities and the support behind the model.</p><div className="home-audiences"><div><h3>Start a franchise business</h3><p>Compare opportunities against your budget, preferred city and involvement. Understand setup costs, ongoing fees and the questions to ask each brand.</p></div><div><h3>Franchise your business</h3><p>Review business readiness, develop a franchise model, document operations and prepare to recruit and support franchise partners.</p></div></div><a className="text-link" href="/about-us">About iFranchise <Icon name="arrow"/></a></div>
  </section>
  <HomeExplainer/>
  <section className="home-process"><div className="section"><div className="home-section-heading"><h2>How our franchise consulting works</h2><p>We agree the scope around your business, requirements and stage of preparation.</p></div><ol className="home-process-list">{[['Discuss your business requirements','For investors, we start with your budget, preferred state and city, industry and role in operations. For brands, we review your current business and expansion priorities.'],['Review the franchise model','Work through investment requirements, commercial terms, operating responsibilities and support. Identify information that needs clarification or independent professional review.'],['Plan the next steps','Prepare a shortlist or franchise development plan, organise partner discussions and agree the documentation, market planning or onboarding work needed.']].map(([title,copy],i)=><li key={title}><span>0{i+1}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol></div></section>
  <section className="section home-resources"><div><h2>Franchise knowledge for investors and brands</h2><p>Find practical guides to franchise costs, business models, due diligence, operating systems and expansion. Separate collections help you find the information relevant to your role.</p><a className="text-link" href="/blogs">Browse blogs & resources <Icon name="arrow"/></a></div><ul>{[['Investor guides','Plan your investment, compare franchises, assess locations and prepare to run a business.'],['Brand development guides','Assess franchise readiness, recruit partners, organise training and manage a growing network.'],['Franchise basics and industries','Understand franchise structures and the requirements of different business sectors.']].map(([title,copy])=><li key={title}><h3>{title}</h3><p>{copy}</p></li>)}</ul></section>
  <section className="home-questions"><div className="section"><h2>Questions about franchising in India</h2><div>{homeQuestions.map(f=><details key={f.q}><summary>{f.q}<span aria-hidden="true">+</span></summary><p>{f.a}</p></details>)}</div></div></section>
 </main>;
}
