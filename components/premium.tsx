import Link from 'next/link';
import {ArrowUpRight,ArrowDown,Plus} from 'lucide-react';
export function PremiumLink({href,children,secondary=false,className=''}:{href:string;children:React.ReactNode;secondary?:boolean;className?:string}){return <Link className={`p-button ${secondary?'p-button-secondary':''} ${className}`} href={href}><span>{children}</span><ArrowUpRight size={19}/></Link>}
export function InlineLink({href,children}:{href:string;children:React.ReactNode}){return <Link className="p-link" href={href}>{children}<ArrowUpRight size={19}/></Link>}
export function Crumb({label}:{label:string}){return <nav className="p-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>{label}</span></nav>}
export function SectionHeading({label,title,children}:{label?:string;title:string;children?:React.ReactNode}){return <div className="p-section-heading" data-reveal><div><h2>{title}</h2></div>{children&&<div>{children}</div>}</div>}
export function Questions({items}:{items:{q:string;a:string}[]}){return <div className="p-questions">{items.map(f=><details key={f.q}><summary>{f.q}<Plus size={20}/></summary><p>{f.a}</p></details>)}</div>}
export function RouteLines(){return <svg className="p-route-lines" viewBox="0 0 1200 650" fill="none" aria-hidden="true"><path d="M20 600C330 600 260 350 620 350S950 90 1180 90"/><path d="M20 632C330 632 260 382 620 382S950 122 1180 122"/><path className="p-route-trace" d="M20 600C330 600 260 350 620 350S950 90 1180 90"/><circle cx="620" cy="350" r="5"/><circle cx="1180" cy="90" r="5"/></svg>}
export function ScrollLink({href,children}:{href:string;children:React.ReactNode}){return <Link className="p-scroll-link" href={href}>{children}<ArrowDown size={18}/></Link>}
