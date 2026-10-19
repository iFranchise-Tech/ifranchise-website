import {HomeBackdrop} from '../components/home-backdrop';
import {Icon} from '../components/icons';
import {HomeExplainer} from '../components/home-explainer';
import {SITE} from '../lib/site';
import {socialLinks} from '../lib/contact';
import {homeQuestions} from '../lib/search-content';
export const metadata={title:'Franchise Consulting Company in India',description:'Explore franchise opportunities or plan your brand expansion with us. Get franchise consulting, model development and business planning support across India.',alternates:{canonical:'/'}};
export default function Home(){
 const entity=SITE.url+'/#organization';
 const schema=[{'@context':'https://schema.org','@type':'Organization','@id':entity,name:'iFranchise',legalName:'IFRANCHISE SERVICES PRIVATE LIMITED',url:SITE.url,description:'Franchise consulting for your business investment and brand expansion across India.',areaServed:{'@type':'Country',name:'India'},email:SITE.email,telephone:SITE.phone,logo:SITE.url+'/assets/wordmark.svg',address:{'@type':'PostalAddress',streetAddress:'Innov 8 Mantri Commercio, Tower A, No 51, 5th floor, Bellandur',addressLocality:'Bengaluru',addressRegion:'Karnataka',postalCode:'560103',addressCountry:'IN'},sameAs:socialLinks.map(s=>s.href)}, {'@context':'https://schema.org','@type':'Service',name:'Franchise consulting in India',serviceType:'Franchise development, investor guidance and business expansion consulting',provider:{'@id':entity},areaServed:{'@type':'Country',name:'India'},url:SITE.url}, {'@context':'https://schema.org','@type':'FAQPage',mainEntity:homeQuestions.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))}];
 return <main id="main" className="home-redesign">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
  <div className="home-opening">
   <HomeBackdrop/>
   <section className="home-lead home-width" aria-labelledby="home-headline">
    <div className="home-lead-copy">
     <h1 id="home-headline">Start and grow your business <em>through franchising.</em></h1>
     <p>From choosing a franchise to expanding into new locations, we help you work through the business model, investment and next steps.</p>
     <div className="home-lead-actions"><a className="button" href="/franchise-opportunities">Explore franchises <Icon name="arrow"/></a><a className="text-link" href="/list-your-brand">List your Brand <Icon name="arrow"/></a></div>
    </div>
   </section>
   <section className="home-overview home-width" aria-labelledby="home-support-heading">
    <div className="home-overview-heading"><h2 id="home-support-heading">What would you <br/>like to do next?</h2><p>Your plans are our starting point. We work through the costs, responsibilities and preparation with you, so you can understand what comes next.</p></div>
    <div className="home-routes">
     <article><span className="home-route-number" aria-hidden="true">01</span><div><h3>Start a franchise business</h3><p>Compare opportunities around your budget, preferred location and the role you want to take in the business.</p><ul><li>Franchise selection</li><li>Investment planning</li><li>Brand discussions</li></ul></div></article>
     <article><span className="home-route-number" aria-hidden="true">02</span><div><h3>Franchise your business</h3><p>Assess your readiness, develop your franchise model and prepare the operations, training and support your partners will need.</p><ul><li>Franchise development</li><li>Partner preparation</li><li>Expansion planning</li></ul></div></article>
    </div>
    <a className="text-link home-about-link" href="/about-us">Get to know iFranchise <Icon name="arrow"/></a>
   </section>
  </div>
  <HomeExplainer/>
  <section className="home-working home-width" aria-labelledby="home-working-heading">
   <div className="home-working-intro"><h2 id="home-working-heading">How we work <br/>with you</h2><p>Start with a conversation about where you are now. We’ll agree the work around your priorities and what you need to prepare.</p></div>
   <ol className="home-working-steps">{[
    ['Understand your requirements','Tell us about your budget, location and involvement, or your business and its current operations. We begin with what you want to achieve.'],
    ['Work through the details','Together, we review the franchise model, costs, responsibilities and proposed support. We identify the questions that need evidence or independent professional review.'],
    ['Prepare your next steps','We help you develop a shortlist or expansion plan, then prepare for brand discussions, documentation, market planning or partner onboarding.']
   ].map(([title,copy],i)=><li key={title}><span aria-hidden="true">0{i+1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>
  </section>
  <section className="home-reading" aria-labelledby="home-reading-heading"><div className="home-width">
   <div className="home-reading-heading"><h2 id="home-reading-heading">Understand franchising <br/>before your next step.</h2><div><p>Practical guides to help you ask better questions, compare your options and prepare for the decisions ahead.</p><a className="text-link" href="/blogs">Browse blogs & resources <Icon name="arrow"/></a></div></div>
   <div className="home-reading-topics">{[
    ['Franchise investment','Budgeting, business selection, locations and the responsibilities of running a franchise.'],
    ['Brand development','Readiness, franchise models, partner recruitment, training and expansion.'],
    ['Franchise basics','Understand the terms, structures and relationships behind a franchise business.'],
    ['Industry guides','Explore the operating requirements of food, retail, education, healthcare and service businesses.']
   ].map(([title,copy],i)=><article key={title}><span aria-hidden="true">0{i+1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
  </div></section>
  <section className="home-faq home-width" aria-labelledby="home-faq-heading"><div className="home-faq-heading"><h2 id="home-faq-heading">Your questions <br/>about franchising</h2><p>A few answers to help you get started.</p></div><div className="home-faq-list">{homeQuestions.map(f=><details key={f.q}><summary>{f.q}<span aria-hidden="true">+</span></summary><p>{f.a}</p></details>)}</div></section>
 </main>;
}
