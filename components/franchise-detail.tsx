import {brandQuestions,brandModels,brandReturns} from '../lib/cms/catalogue-fields.mjs';
import {SITE} from '../lib/site';
import {whatsappUrl} from '../lib/contact';
import {BrandCard} from './ui';
import {Icon} from './icons';
import {BrandLogo} from './brand-logo';
import {BrandShowcase} from './brand-showcase';
import {EnquiryForm} from './enquiry';
import {PremiumLink,InlineLink,Questions,SectionHeading} from './premium';
import {ArrowLeft,ArrowUpRight,Check,Phone,ChevronRight} from 'lucide-react';

export function FranchiseDetail({brand:b,brands}:{brand:any;brands:any[]}){
 const f=b.facts||{},models=brandModels(b),model=models.join(' / '),space=f.sqFt&&f.sqFt!=='--'?f.sqFt:'On request';
 const images=[...new Set<string>((b.gallery||[]).filter((image:unknown)=>typeof image==='string'&&image))];
 const specs=[['Investment',b.budget],['Operating model',model],['Space requirement',space],['Location format',f.locationType],['Franchise fee',f.franchiseFee],['Agreement term',f.agreementTerm],['Lock-in period',f.lockInPeriod]].filter(([,v])=>v&&v!=='--');
 const questions=brandQuestions(b),returns=brandReturns(b);
 const schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage',name:b.name+' Franchise Opportunity',url:SITE.url+'/franchise/'+b.slug,description:b.description,mainEntity:{'@type':'Brand',name:b.name,logo:new URL(b.logo,SITE.url).href}},{'@type':'FAQPage',mainEntity:questions.map(({q,a}:any)=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}]};
 return <main id="main" className="p-page brand-dossier">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
  <header className="dossier-header p-container">
   <nav className="dossier-breadcrumb" aria-label="Breadcrumb"><a href="/franchise-opportunities"><ArrowLeft size={15}/>Franchise opportunities</a><ChevronRight size={13}/><span aria-current="page">{b.name}</span></nav>
   <div className="dossier-heading"><div className="dossier-identity"><BrandLogo brand={b} className="dossier-logo"/><div><p className="dossier-category">{b.category}</p><h1>{b.name}</h1></div></div><p className="dossier-description">{b.description}</p></div>
  </header>
  <nav className="dossier-nav" aria-label="On this brand page"><div className="p-container"><a href="#gallery">Gallery</a><a href="#overview">Overview</a><a href="#investment">Investment & format</a><a href="#returns">Returns</a>{questions.length>0&&<a href="#questions">FAQs</a>}<a href="#enquire">Enquire<ArrowUpRight size={15}/></a></div></nav>
  <div className="p-container dossier-layout">
   <section id="gallery" className="dossier-media" aria-label={b.name+' gallery'}>{images.length>0?<BrandShowcase key={b.slug} name={b.name} images={images}/>:<div className="dossier-image-fallback"><BrandLogo brand={b}/></div>}</section>
   <aside className="dossier-summary" aria-label="Opportunity at a glance">
    <div className="dossier-investment"><span>Indicative investment</span><strong>{b.budget}</strong></div>
    <dl className="dossier-key-facts"><div><dt>Operating model</dt><dd className="dossier-models">{models.map((m:string)=><span key={m}>{m}</span>)}</dd></div><div><dt>Space requirement</dt><dd>{space.includes('\n')?'Varies by format':space}</dd></div><div className="dossier-returns-summary"><dt>Returns</dt><dd>{returns.length>140?<a href="#returns">View return details<ArrowUpRight size={14}/></a>:returns}</dd></div></dl>
    <a className="dossier-requirements-link" href="#investment">View all requirements<ArrowUpRight size={15}/></a>
    <div className="dossier-summary-actions"><PremiumLink href="#enquire">Request details</PremiumLink></div>
    <a className="dossier-phone" href="tel:+919129130303"><Phone size={16}/>+91 91291 30303</a>
   </aside>
   <section className="dossier-overview dossier-section" id="overview"><h2>About {b.name}</h2><p>{b.overview||b.about||b.description}</p>{b.highlights?.length>0&&<ul className="dossier-highlights">{b.highlights.map((h:string)=><li key={h}><Check size={17}/><span>{h}</span></li>)}</ul>}</section>
   <section className="dossier-requirements dossier-section" id="investment"><h2>Investment & format</h2><dl className="dossier-specs">{specs.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}<div id="returns" className="dossier-returns"><dt>Returns</dt><dd>{returns}</dd></div></dl><div className="dossier-notes">{f.investmentNote&&<p>{f.investmentNote}</p>}{b.slug==='lassi-n-cafe'&&<p>The proposal contains different investment figures. Request a confirmed cost sheet.</p>}{b.slug==='original-burger-co'&&<p>Unit and master franchise proposals have separate investment and territory terms.</p>}<p>Confirm costs, fees and return terms in the latest written proposal from the brand.</p></div></section>
   {questions.length>0&&<section className="dossier-questions dossier-section" id="questions"><h2>Questions about {b.name}</h2><Questions items={questions}/></section>}
  </div>
  <section className="dossier-enquiry" id="enquire"><div className="p-container dossier-enquiry-grid"><div className="dossier-enquiry-intro"><h2>Discuss the<br/>{b.name} opportunity.</h2><p>Tell us about your plans, preferred location and investment.</p><div className="dossier-direct"><a href={whatsappUrl(b.name)} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp"/>Message our team<ArrowUpRight size={17}/></a><a href="tel:+919129130303"><Phone size={17}/>+91 91291 30303</a></div><InlineLink href="/franchise-opportunities">Explore other opportunities</InlineLink></div><EnquiryForm key={b.slug} brandSlug={b.slug} items={[{slug:b.slug,name:b.name}]}/></div></section>
  <section className="p-container p-section dossier-related"><SectionHeading title="Other opportunities"><InlineLink href="/franchise-opportunities">View all brands</InlineLink></SectionHeading><div className="p-brand-grid">{brands.filter(x=>x.slug!==b.slug).sort((a,c)=>Number(c.category===b.category)-Number(a.category===b.category)).slice(0,3).map(x=><BrandCard brand={x} key={x.slug}/>)}</div></section>
 </main>;
}
