import {SITE} from '../lib/site';
import research from '../content/brand-research.json';
import {whatsappUrl} from '../lib/contact';
import {Breadcrumb,BrandCard} from './ui';
import {Icon} from './icons';
import {BrandLogo} from './brand-logo';
import {BrandGallery} from './brand-gallery';
import {EnquiryForm} from './enquiry';
export function FranchiseDetail({brand:b,brands}:{brand:any;brands:any[]}){const slug=b.slug;
 const r={overview:b.overview||b.about||b.description,highlights:b.highlights||[],sources:b.sources||[]},f=b.facts as Record<string,any>,href='#enquire',model=b.model==='Foco Model'?'FOCO':b.model;
 const specs=[['Operating model',model],['Space requirement',f.sqFt],['Location format',f.locationType],['Franchise fee',f.franchiseFee],['Proposed agreement term',f.agreementTerm],['Lock-in period',f.lockInPeriod]].filter(([,v])=>v&&v!=='--');
 const questions=[
  ['What does the '+b.name+' investment cover?','The listed investment is '+b.budget+'. Request a current cost sheet covering franchise fees, setup, deposits, inventory, taxes and working capital. The total project cost can vary with format, location and property condition.'],
  ['Is '+b.name+' available in my city?','Availability depends on the brand’s expansion plans, existing outlets and territory arrangements. Tell us your preferred city and area, and we’ll help you check the current position with the brand.'],
  ['Who manages the outlet or business?','The proposed model is '+model+'. The current agreement should specify staffing, operations, inventory, working capital, reporting and decision-making responsibilities. Review these before committing.'],
  ['What support will the brand provide?','Ask for the current written scope of support, including location approval, setup, training, supply, marketing and ongoing operations. Product information on this page does not establish the services included in a franchise agreement.'],
  ['I already submitted an enquiry. What should I do next?','You can review this page and the available brochure while preparing your questions. To speak with us, use the WhatsApp or phone options and mention '+b.name+' and your preferred city. You do not need to complete another form just to read the details.']
 ];
 const schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage',name:b.name+' Franchise Opportunity',url:SITE.url+'/franchise/'+b.slug,description:b.description,mainEntity:{'@type':'Brand',name:b.name,logo:new URL(b.logo,SITE.url).href}},{'@type':'FAQPage',mainEntity:questions.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}]};
 const space=f.sqFt&&f.sqFt!=='--'?f.sqFt:'On request';
 const summarySpace=space.includes('\n')?'Varies by format':space;
 return <main id="main" className="franchise-page">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
  <section className="franchise-hero">
   <div className="page-wrap"><Breadcrumb label={b.name+' franchise'}/>
    <div className="franchise-hero-grid">
     <div className="franchise-hero-copy">
      <div className="franchise-brand-heading"><BrandLogo brand={b} className="landing-brand-logo"/><span className="franchise-category">{b.category}</span></div>
      <h1>{b.name}<span> franchise</span></h1><p className="franchise-intro">{b.description}</p>
      <div className="franchise-hero-actions"><a className="button light" href={href}>Enquire about this franchise <Icon name="arrow"/></a><a className="franchise-whatsapp" href={whatsappUrl(b.name)} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp"/> WhatsApp</a></div>
      <p className="franchise-advisor-note">We’re here to help you understand this opportunity.</p>
     </div>
     <div className="franchise-hero-photo"><img src={b.gallery[0]||b.logo} alt={b.name+' brand photograph'} width="1200" height="800" fetchPriority="high"/><a href="#gallery"><Icon name="expand"/><span>View {b.name} photos</span><small>{b.gallery.length} photos</small></a></div>
    </div>
   </div>
  </section>
  <div className="franchise-facts page-wrap">
   <div><span>Indicative investment</span><strong>{b.budget}</strong></div><div><span>Proposed model</span><strong>{model}</strong></div><div><span>Space requirement</span><strong>{summarySpace}</strong></div>
   <div className="franchise-brochure">{b.brochure?<a href={b.brochure} target="_blank" rel="noopener noreferrer"><Icon name="download"/><span>Brand brochure<small>View the available proposal</small></span><Icon name="arrow"/></a>:<a href={whatsappUrl(b.name)} target="_blank" rel="noopener noreferrer"><Icon name="download"/><span>Request a brochure<small>Ask for current information</small></span><Icon name="arrow"/></a>}</div>
  </div>
  <nav className="franchise-nav" aria-label="On this brand page"><div className="page-wrap"><a href="#overview">Brand overview</a><a href="#investment">Investment & format</a><a href="#gallery">Photos</a><a href="#questions">FAQs</a><a href={href}>Enquire <Icon name="arrow" width="15"/></a></div></nav>
  <div className="franchise-layout page-wrap">
   <aside className="brand-enquiry-panel" id="enquire" tabIndex={-1} aria-label={b.name+' enquiry'}>
    <EnquiryForm key={b.slug} brandSlug={b.slug} items={brands}/>
    <div className="brand-direct-contact"><p>Prefer to speak with us?</p><div><a href={whatsappUrl(b.name)} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp"/> WhatsApp</a><a href="tel:+919129130303"><Icon name="phone"/> +91 91291 30303</a></div></div>
   </aside>
   <div className="franchise-content">
    <section className="franchise-section" id="overview"><h2>About {b.name}</h2><p className="franchise-overview">{r.overview}</p><h3>Products and business format</h3><ul className="franchise-highlights">{r.highlights.map((h:string)=><li key={h}><Icon name="check"/><span>{h}</span></li>)}</ul></section>
    <section className="franchise-section" id="investment"><h2>Investment and requirements</h2><div className="franchise-investment"><span>Indicative investment</span><strong>{b.budget}</strong><p>Ask us to help you clarify the current format, costs and terms.</p></div><dl className="franchise-specs">{specs.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
     {b.slug==='lassi-n-cafe'&&<p className="proposal-note">The current listing contains different investment figures. Ask for a confirmed cost sheet before comparing this opportunity by budget.</p>}
     {b.slug==='original-burger-co'&&<p className="proposal-note">Unit franchise, master channel partner and master franchise are separate proposals. Confirm the investment and territory for the format you are considering.</p>}
     {f.investmentNote&&<p className="proposal-note">Proposal note: {f.investmentNote}</p>}
     <p className="franchise-disclaimer">Use these details as a starting point for your questions. Before you decide, confirm the investment, fees, territory and operating terms in the latest written proposal.</p>
     <div className="franchise-section-actions"><a className="text-link" href={href}>Ask about current terms <Icon name="arrow"/></a>{b.brochure&&<a className="text-link" href={b.brochure} target="_blank" rel="noopener noreferrer"><Icon name="download"/> View brochure</a>}</div>
    </section>
    <section className="franchise-section" id="gallery"><div className="franchise-section-heading"><h2>{b.name} photos</h2><span>{b.gallery.length} photos</span></div><BrandGallery name={b.name} images={b.gallery}/></section>
    <section className="franchise-section" id="questions"><h2>Frequently asked questions</h2><div className="content-faq">{questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
    <section className="franchise-section franchise-next"><h2>Discuss this opportunity</h2><p>If you already submitted an enquiry through Facebook or Instagram, you can review this page and contact us directly. There is no need to complete another form.</p><div className="franchise-next-steps">{[['01','Confirm your location','Discuss the proposed format and availability in your preferred city.'],['02','Review the proposal','Ask for current costs, operating responsibilities and the written support scope.'],['03','Evaluate the agreement','Review documents and supporting evidence before deciding whether to proceed.']].map(([n,t,d])=><div key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div></div>)}</div><a className="button" href={href}>Enquire about {b.name} <Icon name="arrow"/></a></section>
    <details className="brand-sources"><summary>Brand information sources <Icon name="chevron" width="16"/></summary><p>We checked the product and business information against these brand-published sources on 18 October 2026. Ask for the latest commercial details before you decide.</p><ul>{r.sources.map((s:any)=><li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗</a></li>)}</ul></details>
   </div>
  </div>
  <section className="section related-brands"><div className="section-heading"><h2>Compare other opportunities</h2><a className="text-link" href="/franchise-opportunities">View all <Icon name="arrow"/></a></div><div className="brand-grid">{brands.filter(x=>x.slug!==slug).sort((a,c)=>Number(c.category===b.category)-Number(a.category===b.category)||a.name.localeCompare(c.name)).slice(0,3).map(x=><BrandCard brand={x} key={x.slug}/>)}</div></section>
  <div className="franchise-mobile-cta"><span>{b.name}</span><a className="button small" href={href}>Enquire <Icon name="arrow" width="17"/></a></div>
 </main>;
}
