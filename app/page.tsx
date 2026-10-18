import {ExpansionBackground} from '../components/expansion-background';
import {MotionControl} from '../components/experience';
import {Icon} from '../components/icons';
import {HomeExplainer} from '../components/home-explainer';
import {SITE} from '../lib/site';
import {socialLinks} from '../lib/contact';
import {homeQuestions} from '../lib/search-content';
export const metadata={title:'Franchise Consulting Company in India',description:'Explore franchise opportunities or plan your brand expansion with us. Get franchise consulting, model development and business planning support across India.',alternates:{canonical:'/'}};
export default function Home(){
 const entity=SITE.url+'/#organization';
 const schema=[{'@context':'https://schema.org','@type':'Organization','@id':entity,name:'iFranchise',legalName:'IFRANCHISE SERVICES PRIVATE LIMITED',url:SITE.url,description:'Franchise consulting for your business investment and brand expansion across India.',areaServed:{'@type':'Country',name:'India'},email:SITE.email,telephone:SITE.phone,logo:SITE.url+'/assets/wordmark.svg',address:{'@type':'PostalAddress',streetAddress:'Innov 8 Mantri Commercio, Tower A, No 51, 5th floor, Bellandur',addressLocality:'Bengaluru',addressRegion:'Karnataka',postalCode:'560103',addressCountry:'IN'},sameAs:socialLinks.map(s=>s.href)}, {'@context':'https://schema.org','@type':'Service',name:'Franchise consulting in India',serviceType:'Franchise development, investor guidance and business expansion consulting',provider:{'@id':entity},areaServed:{'@type':'Country',name:'India'},url:SITE.url}, {'@context':'https://schema.org','@type':'FAQPage',mainEntity:homeQuestions.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))}];
 return <main id="main" className="refined-home">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
  <section className="expansion-hero" aria-labelledby="home-headline">
   <ExpansionBackground/>
   <div className="expansion-content">
    <h1 id="home-headline">Start and grow your business <em>through franchising.</em></h1>
    <p>From choosing a franchise to expanding into new locations, we help you work through the business model, investment and next steps.</p>
    <div className="expansion-actions"><a className="button light" href="/franchise-opportunities">Explore franchises <Icon name="arrow"/></a><a className="text-link on-dark" href="/list-your-brand">List your Brand <Icon name="arrow"/></a></div>
   </div>
   <div className="expansion-motion-control"><MotionControl/></div>
  </section>
  <section className="section home-support">
   <div className="home-support-photo"><img src="/stock/business-consultation.jpg" alt="Professionals reviewing a business plan and investment information" width="1600" height="1067" loading="lazy"/></div>
   <div className="home-support-copy"><h2>Support for your franchise investment or brand expansion</h2><p>Your plans are our starting point. We work with you on the investment, location, responsibilities and support you need to understand before taking the next step.</p><div className="home-audiences"><div><h3>Start a franchise business</h3><p>We help you compare opportunities against your budget, preferred location and day-to-day involvement, so you know what to ask each brand.</p></div><div><h3>Franchise your business</h3><p>We work with you to assess readiness, develop your franchise model and prepare the operations, training and support your partners will need.</p></div></div><a className="text-link" href="/about-us">About iFranchise <Icon name="arrow"/></a></div>
  </section>
  <HomeExplainer/>
  <section className="home-process"><div className="section"><div className="home-section-heading"><h2>How we work with you</h2><p>Tell us where you are in the process. We’ll agree the work around your priorities and what you need to prepare.</p></div><ol className="home-process-list">{[['Discuss your business requirements','If you’re investing, tell us your budget, preferred state and city, and the role you want to take. If you’re expanding, we’ll start with your business and its current operations.'],['Review the franchise model','We help you work through costs, commercial terms and responsibilities, and identify the questions that need further evidence or independent professional review.'],['Plan the next steps','Together, we prepare your shortlist or development plan and agree the next steps for brand discussions, documentation, market planning or partner onboarding.']].map(([title,copy],i)=><li key={title}><span>0{i+1}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol></div></section>
  <section className="section home-resources"><div><h2>Find answers to your franchise questions</h2><p>Use our guides to understand franchise costs, compare business models and prepare your questions. Choose the investor or brand collection for the decisions you’re working through.</p><a className="text-link" href="/blogs">Browse blogs & resources <Icon name="arrow"/></a></div><ul>{[['Investor guides','Plan your investment, compare franchises, assess locations and prepare to run a business.'],['Brand development guides','Assess franchise readiness, recruit partners, organise training and manage a growing network.'],['Franchise basics and industries','Understand franchise structures and the requirements of different business sectors.']].map(([title,copy])=><li key={title}><h3>{title}</h3><p>{copy}</p></li>)}</ul></section>
  <section className="home-questions"><div className="section"><h2>Your questions about franchising</h2><div>{homeQuestions.map(f=><details key={f.q}><summary>{f.q}<span aria-hidden="true">+</span></summary><p>{f.a}</p></details>)}</div></div></section>
 </main>;
}
