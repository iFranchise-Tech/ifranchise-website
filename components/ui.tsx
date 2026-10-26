import {responsiveImage} from '../lib/responsive-image';
import {brands,faqs} from '../lib/site';
import {Icon} from './icons';
import {BrandLogo} from './brand-logo';
export function Arrow(){return <Icon name="arrow"/>}
export function BrandCard({brand:b}:{brand:any}){const href='/franchise/'+b.slug;return <a className="opportunity-card p-brand-card" href={href} aria-label={'View '+b.name+' franchise opportunity'}><div className="p-card-image"><img {...responsiveImage(b.gallery?.[0]||b.logo,'(max-width: 650px) 92vw, (max-width: 1000px) 45vw, 30vw')} decoding="async" width="600" height="330" loading="lazy" alt={b.name+' products and spaces'}/><span className="p-card-arrow"><Arrow/></span></div><div className="p-card-body"><div className="p-card-identity"><BrandLogo brand={b} className="p-card-logo"/><span>{b.category}</span></div><h3>{b.name}</h3><dl><div><dt>Investment</dt><dd>{b.budget}</dd></div><div><dt>Model</dt><dd>{(b.models?.join(' / ')||b.model).replace(/Foco Model/i,'FOCO')}</dd></div></dl></div></a>}
export function FAQ(){return <section className="section faq" data-reveal><div><h2>Frequently asked questions</h2><p className="muted">Your questions about franchising and working with us.</p><a className="text-link" href="/faq">View all FAQs <Arrow/></a></div><div>{faqs.map(([q,a],i)=><details key={q}><summary><span className="faq-index">0{i+1}</span>{q}<span className="faq-plus" aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>}
export function CTA(){return null;}
export function Breadcrumb({label}:{label:string}){return null}
