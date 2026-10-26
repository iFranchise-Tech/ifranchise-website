'use client';
import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent,type KeyboardEvent as ReactKeyboardEvent} from 'react';
import {createPortal} from 'react-dom';
import {ArrowUpRight,ChevronLeft,ChevronRight,Mail,X} from 'lucide-react';
import {EnquiryForm} from './enquiry';
import {Icon} from './icons';
import {useSiteSettings} from './site-settings';
import {whatsappUrl} from '../lib/contact';


export function BrandSectionNav({hasQuestions}:{hasQuestions:boolean}){
 const [active,setActive]=useState('gallery'),nav=useRef<HTMLElement>(null);
 const sections=[['gallery','Gallery'],['overview','Overview'],['investment','Investment & format'],['returns','Returns'],...(hasQuestions?[['questions','FAQs']]:[])];
 useEffect(()=>{let frame=0;function update(){frame=0;const line=(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-height'))||80)+(nav.current?.offsetHeight||54)+28;let current='gallery';for(const [id] of sections){if((document.getElementById(id)?.getBoundingClientRect().top??Infinity)<=line)current=id;}setActive(current)}function schedule(){if(!frame)frame=requestAnimationFrame(update)}update();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule)}},[hasQuestions]);
 return <nav ref={nav} className="profile-section-nav" aria-label="On this brand page"><div className="profile-section-nav-inner">{sections.map(([id,label])=><a key={id} href={'#'+id} aria-current={active===id?'location':undefined}>{label}</a>)}<a href="#enquire" onClick={event=>{if(matchMedia('(max-width: 1023px)').matches)event.preventDefault();window.dispatchEvent(new Event('open-brand-enquiry'))}}>Enquire<ArrowUpRight size={15}/></a></div></nav>;
}

export function BrandEnquiryPanel({name,slug}:{name:string;slug:string}){
 const [mobile,setMobile]=useState(false),[open,setOpen]=useState(false),[collapsed,setCollapsed]=useState(false);
 const panel=useRef<HTMLElement>(null),dialog=useRef<HTMLDialogElement>(null);
 const rail=useRef<HTMLDivElement>(null),drag=useRef<{id:number;start:number;center:number;moved:boolean}|null>(null),suppressClick=useRef(false),position=useRef(.5);
 const [dragging,setDragging]=useState(false);
 const placeRail=(center:number)=>{
  const el=rail.current;if(!el)return;
  const viewport=window.visualViewport,top=viewport?.offsetTop||0,height=viewport?.height||innerHeight;
  const half=el.offsetHeight/2,header=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-height'))||80;
  const min=top+Math.min(header+12,height/3)+half,max=top+height-half-12;
  const next=Math.max(Math.min(min,max),Math.min(max,center));
  el.style.top=next+'px';position.current=(next-top)/height;
 };
 const savePosition=()=>{try{sessionStorage.setItem('ifranchise-enquiry-position',String(position.current))}catch{}};
 useEffect(()=>{
  if(!mobile||open||!rail.current)return;
  try{const saved=Number(sessionStorage.getItem('ifranchise-enquiry-position'));if(saved>0&&saved<1)position.current=saved}catch{}
  const measure=()=>placeRail((visualViewport?.offsetTop||0)+(visualViewport?.height||innerHeight)*position.current);
  const observer=new ResizeObserver(measure);observer.observe(rail.current);measure();
  window.addEventListener('resize',measure);visualViewport?.addEventListener('resize',measure);visualViewport?.addEventListener('scroll',measure);
  return()=>{observer.disconnect();window.removeEventListener('resize',measure);visualViewport?.removeEventListener('resize',measure);visualViewport?.removeEventListener('scroll',measure)};
 },[mobile,open]);
 const dragStart=(event:ReactPointerEvent<HTMLButtonElement>)=>{
  if(!event.isPrimary||event.button!==0||!rail.current)return;
  const rect=rail.current.getBoundingClientRect();suppressClick.current=false;
  drag.current={id:event.pointerId,start:event.clientY,center:rect.top+rect.height/2,moved:false};
  event.currentTarget.setPointerCapture(event.pointerId);
 };
 const dragMove=(event:ReactPointerEvent<HTMLButtonElement>)=>{
  const active=drag.current;if(!active||active.id!==event.pointerId)return;
  if(Math.abs(event.clientY-active.start)>6){active.moved=true;suppressClick.current=true;setDragging(true)}
  if(active.moved){event.preventDefault();placeRail(active.center+event.clientY-active.start)}
 };
 const dragEnd=(event:ReactPointerEvent<HTMLButtonElement>)=>{
  if(drag.current?.id!==event.pointerId)return;
  suppressClick.current=drag.current.moved;drag.current=null;setDragging(false);savePosition();
  if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
 };
 const moveWithKeyboard=(event:ReactKeyboardEvent<HTMLButtonElement>)=>{
  if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key)||!rail.current)return;
  event.preventDefault();const rect=rail.current.getBoundingClientRect();
  placeRail(event.key==='Home'?0:event.key==='End'?innerHeight:rect.top+rect.height/2+(event.key==='ArrowUp'?-40:40));savePosition();
 };
 const contact=useSiteSettings();
 const mail='mailto:'+contact.email+'?subject='+encodeURIComponent(name+' franchise enquiry')+'&body='+encodeURIComponent('Hello iFranchise,\n\nI’m interested in the '+name+' franchise. Please share the investment details, available locations and next steps.\n\nThank you.');
 useEffect(()=>{const query=matchMedia('(max-width: 1023px)');const resize=()=>setMobile(query.matches);resize();query.addEventListener('change',resize);const show=()=>setOpen(true);const hash=()=>{if(location.hash==='#enquire')show()};window.addEventListener('open-brand-enquiry',show);window.addEventListener('hashchange',hash);hash();return()=>{query.removeEventListener('change',resize);window.removeEventListener('open-brand-enquiry',show);window.removeEventListener('hashchange',hash)}},[]);
 useEffect(()=>{if(!mobile||!dialog.current)return;if(open&&!dialog.current.open)dialog.current.showModal();if(!open&&dialog.current.open)dialog.current.close();if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[open,mobile]);
 useEffect(()=>{if(mobile||!panel.current)return;const el=panel.current;const measure=()=>{const top=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-height'))+18;el.style.setProperty('--enquiry-sticky-top',Math.min(top,innerHeight-el.offsetHeight-18)+'px')};const observer=new ResizeObserver(measure);observer.observe(el);window.addEventListener('resize',measure);measure();return()=>{observer.disconnect();window.removeEventListener('resize',measure)}},[mobile]);
 const contacts=<div className="brand-enquiry-contacts"><a href={whatsappUrl(name,contact.phone)} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp"/>WhatsApp<ArrowUpRight size={14}/></a><a href={mail}><Mail size={18}/>Email<ArrowUpRight size={14}/></a></div>;
 const contents=<><header className="brand-enquiry-heading"><div><span>Let’s talk about your plans</span><h2 id="brand-enquiry-title">Enquire about {name}</h2></div>{mobile&&<button type="button" className="brand-enquiry-close" aria-label="Close enquiry form" onClick={()=>setOpen(false)}><X size={22}/></button>}</header><EnquiryForm compact brandSlug={slug} items={[{slug,name}]}/>{!mobile&&contacts}</>;
 if(mobile)return createPortal(<><dialog ref={dialog} className="p-site brand-enquiry-dialog" aria-labelledby="brand-enquiry-title" onCancel={()=>setOpen(false)} onClose={()=>setOpen(false)} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)setOpen(false)}}}><div className="brand-enquiry-card">{contents}</div></dialog>{!open&&<div ref={rail} className={'brand-mobile-contact'+(collapsed?' is-collapsed':'')+(dragging?' is-dragging':'')} role="group" aria-label="Brand enquiry options"><div id="brand-contact-actions" className="brand-contact-actions" inert={collapsed} aria-hidden={collapsed}><button type="button" className="brand-contact-enquire" onClick={()=>setOpen(true)} aria-haspopup="dialog" aria-label={'Enquire about '+name}><span>Enquire</span></button><a href={whatsappUrl(name,contact.phone)} target="_blank" rel="noopener noreferrer" aria-label={'WhatsApp enquiry about '+name} title="Enquire on WhatsApp"><Icon name="whatsapp"/></a><a href={mail} aria-label={'Email enquiry about '+name} title="Enquire by email"><Mail size={20}/></a></div><button type="button" className="brand-contact-toggle" onPointerDown={dragStart} onPointerMove={dragMove} onPointerUp={dragEnd} onPointerCancel={dragEnd} onLostPointerCapture={dragEnd} onKeyDown={moveWithKeyboard} aria-describedby="brand-rail-help" aria-expanded={!collapsed} aria-controls="brand-contact-actions" aria-label={collapsed?'Expand enquiry options':'Collapse enquiry options'} title={collapsed?'Show enquiry options · drag to move':'Minimise enquiry options · drag to move'} onClick={()=>{if(suppressClick.current){suppressClick.current=false;return}setCollapsed(value=>!value)}}>{collapsed?<ChevronLeft size={18}/>:<ChevronRight size={18}/>}</button><span id="brand-rail-help" className="sr-only">Drag this button up or down to move the enquiry options. With the keyboard, use Up and Down arrows, or Home and End.</span></div>}</>,document.body);
 return <aside ref={panel} id="enquire" className="brand-enquiry-card is-sticky" aria-labelledby="brand-enquiry-title">{contents}</aside>;
}
