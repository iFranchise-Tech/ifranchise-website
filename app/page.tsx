import {FAQ} from '../components/ui';
import {Icon} from '../components/icons';
import {HeroSculpture,JourneyExplorer,MotionControl} from '../components/experience';
import {SITE,faqs} from '../lib/site';
import {socialLinks} from '../lib/contact';
export const metadata={alternates:{canonical:'/'}};
const guides=[
 ['/guides/franchise-models','FOFO, FOCO and FICO explained','Compare who owns the outlet, who operates it and how responsibilities are divided.'],
 ['/guides/franchise-enquiry-checklist','Franchise investment checklist','Review setup costs, ongoing fees, operating responsibilities and the terms to ask about.'],
 ['/guides/franchise-ready-brand','Preparing your business for franchising','Assess your operations, documentation and capacity to support franchise partners.'],
];
export default function Home(){
 const schema={'@context':'https://schema.org','@graph':[{'@type':'Organization',name:'iFranchise',url:SITE.url,areaServed:'India',email:SITE.email,telephone:SITE.phone,logo:SITE.url+'/assets/wordmark.svg',sameAs:socialLinks.map(s=>s.href)},{'@type':'FAQPage',mainEntity:faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}]};
 return <main id="main" className="bespoke-home">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
  <section className="signature-hero">
   <HeroSculpture/>
   <div className="signature-content">
    <h1>Franchise consulting<br/>for investors<br/><em>and brands.</em></h1>
    <p className="hero-intro">We help you evaluate franchise investments and prepare your business for expansion across India.</p>
    <div className="hero-actions"><a className="button light" href="/franchise-opportunities">Explore franchises <Icon name="arrow"/></a><a className="text-link on-dark" href="/for-brands">Services for brands <Icon name="arrow"/></a></div>
   </div>
   <div className="hero-footnote"><a href="#your-next-step"><span className="scroll-symbol">↓</span> How we can help</a><MotionControl/></div>
  </section>
  <JourneyExplorer/>
  <section className="section approach-section">
   <div className="approach-heading"><h2>Franchise development<br/><span>and expansion services</span></h2><div><p>We work with business owners on the model, processes and partnerships needed to operate a franchise network.</p><a className="text-link" href="/services">View all services <Icon name="arrow"/></a></div></div>
   <div className="approach-grid">
    <a href="/services" className="approach-feature">
     <div><h3>Franchise model development</h3><p>Define how the franchise will operate before introducing it to prospective partners.</p><dl className="model-scope"><div><dt>Investment structure</dt><dd>Setup costs and ongoing fees</dd></div><div><dt>Operating model</dt><dd>Ownership and responsibilities</dd></div><div><dt>Partner support</dt><dd>Training and operational assistance</dd></div></dl><span className="feature-link">View consulting services <Icon name="arrow"/></span></div>
    </a>
    <div className="approach-rows">{[['01','Operations and documentation','Document daily procedures, service standards and the training your franchise partners need.'],['02','Investor acquisition','Prepare your franchise presentation, plan outreach and evaluate prospective partner requirements.'],['03','Market and location planning','Prioritise expansion markets, property requirements and the sequence of new openings.']].map(([n,t,d])=><a href="/services" key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div><Icon name="arrow"/></a>)}</div>
   </div>
  </section>
  <section className="people-story">
   <div className="people-photo"><img src="/stock/consultation-ahmedabad.jpg" alt="Professionals reviewing business information in an office" width="1200" height="1799" loading="lazy"/></div>
   <div className="people-copy"><h2>Discuss your<br/><span>franchise plans</span></h2><p>Tell us your preferred location, budget and level of involvement. If you own a brand, we can discuss your current operations and expansion requirements.</p><a className="button light" href="/contact-us">Contact our team <Icon name="arrow"/></a><a className="quiet-link" href="/about-us">About iFranchise <Icon name="arrow" width="16"/></a></div>
  </section>
  <section className="section perspective-section">
   <div className="section-heading"><h2>Franchise guides</h2><a className="text-link" href="/blogs">Browse articles <Icon name="arrow"/></a></div>
   <div className="perspective-grid">{guides.map(([href,title,copy])=><a href={href} className="perspective-card guide-text-card" key={href}><div className="perspective-copy"><h3>{title}</h3><p>{copy}</p></div><span className="guide-read">Read guide <Icon name="arrow"/></span></a>)}</div>
  </section>
  <FAQ/>
 </main>
}
