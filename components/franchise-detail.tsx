import {brandQuestions,brandModels,brandReturns} from '../lib/cms/catalogue-fields.mjs';
import {SITE} from '../lib/site';
import {BrandCard} from './ui';
import {BrandLogo} from './brand-logo';
import {BrandShowcase} from './brand-showcase';
import {BrandEnquiryPanel,BrandSectionNav} from './brand-enquiry';
import {InlineLink,Questions,SectionHeading} from './premium';
import {ArrowLeft,Check,ChevronRight} from 'lucide-react';

export function FranchiseDetail({brand:b,brands}:{brand:any;brands:any[]}){
 const f=b.facts||{},models=brandModels(b),model=models.join(' / '),space=f.sqFt&&f.sqFt!=='--'?f.sqFt:'On request';
 const images=[...new Set<string>((b.gallery||[]).filter((image:unknown)=>typeof image==='string'&&image))];
 const specs=[['Operating model',model],['Space requirement',space],['Location format',f.locationType],['Franchise fee',f.franchiseFee],['Agreement term',f.agreementTerm],['Lock-in period',f.lockInPeriod]].filter(([,v])=>v&&v!=='--');
 const questions=brandQuestions(b),returns=brandReturns(b);
 const schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage',name:b.name+' Franchise Opportunity',url:SITE.url+'/franchise/'+b.slug,description:b.description,mainEntity:{'@type':'Brand',name:b.name,logo:new URL(b.logo,SITE.url).href}},{'@type':'FAQPage',mainEntity:questions.map(({q,a}:any)=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}]};
 return <main id="main" className="p-page brand-dossier">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
  <header className="dossier-header p-container">
   <nav className="dossier-breadcrumb" aria-label="Breadcrumb"><a href="/franchise-opportunities"><ArrowLeft size={15}/>Franchise opportunities</a><ChevronRight size={13}/><span aria-current="page">{b.name}</span></nav>
   <div className="dossier-heading"><div className="dossier-identity"><BrandLogo brand={b} className="dossier-logo"/><div><p className="dossier-category">{b.category}</p><h1>{b.name}</h1></div></div><p className="dossier-description">{b.description}</p></div>
  </header>
  <BrandSectionNav hasQuestions={questions.length>0}/>
  <div className="p-container dossier-layout">
   <section id="gallery" className="dossier-media" aria-label={b.name+' gallery'}>{images.length>0?<BrandShowcase key={b.slug} name={b.name} images={images}/>:<div className="dossier-image-fallback"><BrandLogo brand={b}/></div>}</section>
   <BrandEnquiryPanel key={b.slug} name={b.name} slug={b.slug}/>
   <section className="dossier-overview dossier-section" id="overview"><h2>About {b.name}</h2><p>{b.overview||b.about||b.description}</p>{b.highlights?.length>0&&<ul className="dossier-highlights">{b.highlights.map((h:string)=><li key={h}><Check size={17}/><span>{h}</span></li>)}</ul>}</section>
   <section className="dossier-requirements dossier-section" id="investment">
    <h2>Investment & format</h2>
    <div className="dossier-commercial">
     <div className="dossier-investment-total"><span>Indicative investment</span><strong>{b.budget}</strong>{f.investmentNote&&<p>{f.investmentNote}</p>}</div>
     <dl className="dossier-specs">{specs.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}<div id="returns" className="dossier-specs-returns"><dt>Returns</dt><dd>{returns}</dd></div></dl>
    </div>
    <div className="dossier-notes">{b.slug==='lassi-n-cafe'&&<p>The proposal contains different investment figures. Request a confirmed cost sheet.</p>}{b.slug==='original-burger-co'&&<p>Unit and master franchise proposals have separate investment and territory terms.</p>}<p>Confirm costs, fees and return terms in the latest written proposal from the brand.</p></div>
   </section>
   {questions.length>0&&<section className="dossier-questions dossier-section" id="questions"><h2>Questions about {b.name}</h2><Questions items={questions}/></section>}
  </div>

  <section className="p-container p-section dossier-related"><SectionHeading title="Other opportunities"><InlineLink href="/franchise-opportunities">View all brands</InlineLink></SectionHeading><div className="p-brand-grid">{brands.filter(x=>x.slug!==b.slug).sort((a,c)=>Number(c.category===b.category)-Number(a.category===b.category)).slice(0,3).map(x=><BrandCard brand={x} key={x.slug}/>)}</div></section>
 </main>;
}
