import {ArrowUpRight,ArrowDown,Plus} from 'lucide-react';
export function PremiumLink({href,children,secondary=false,className='',arrow=true}:{href:string;children:React.ReactNode;secondary?:boolean;className?:string;arrow?:boolean}){return <a className={`p-button ${secondary?'p-button-secondary':''} ${className} ${arrow?'':'p-button-centered'}`} href={href}><span>{children}</span>{arrow&&<ArrowUpRight size={19}/>}</a>}
export function InlineLink({href,children}:{href:string;children:React.ReactNode}){return <a className="p-link" href={href}>{children}<ArrowUpRight size={19}/></a>}
export function Crumb({label}:{label:string}){return <nav className="p-crumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>{label}</span></nav>}
export function SectionHeading({label,title,children}:{label?:string;title:React.ReactNode;children?:React.ReactNode}){return <div className="p-section-heading" data-reveal><div><h2>{title}</h2></div>{children&&<div>{children}</div>}</div>}
export function Questions({items}:{items:{q:string;a:string}[]}){return <div className="p-questions">{items.map(f=><details key={f.q}><summary>{f.q}<Plus size={20}/></summary><p>{f.a}</p></details>)}</div>}
export function ScrollLink({href,children}:{href:string;children:React.ReactNode}){return <a className="p-scroll-link" href={href}>{children}<ArrowDown size={18}/></a>}
