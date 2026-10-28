'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {ArrowUpRight,ChevronDown,Menu,X,Mail,Phone} from 'lucide-react';
import {SITE} from '../lib/site';
import {useSiteSettings,phoneLabel} from './site-settings';
import {whatsappUrl} from '../lib/contact';
import {Icon} from './icons';
import {BrandIdentity} from './brand-identity';
const menus={company:{label:'Company',links:[['/about-us','About us'],['/careers','Careers']]},resources:{label:'Resources',links:[['/resources','All resources'],['/resources/blogs','Blogs'],['/resources/articles','Articles'],['/resources/videos','Videos'],['/resources/saved','Saved resources']]}};
export function SocialLinks({label=false}:{label?:boolean}){const {socialLinks}=useSiteSettings();return <div className="social-links" aria-label="iFranchise social media">{socialLinks.filter((s:any)=>s.visible!==false).map((s:any)=><a href={s.href} key={s.name} target="_blank" rel="noopener noreferrer" aria-label={'iFranchise on '+s.name} title={s.name}><Icon name={s.icon}/>{label&&<span>{s.name}</span>}</a>)}</div>}
export function Header(){const [mobile,setMobile]=useState(false),[open,setOpen]=useState<string|null>(null),root=useRef<HTMLElement>(null),wordmark=useRef<HTMLDivElement>(null),toggle=useRef<HTMLButtonElement>(null),path=usePathname();
 const hoveredMenu=useRef<string|null>(null);
 const hasPhotoHero=path==='/'||['/about-us','/list-your-brand','/careers','/resources','/resources/blogs','/resources/articles','/resources/videos'].includes(path);
 const [headerState,setHeaderState]=useState({path,scrolled:false,overHero:hasPhotoHero,darkHero:hasPhotoHero,protectBrand:false,joinedHeight:0});
 const {scrolled,overHero,darkHero,protectBrand,joinedHeight}=headerState.path===path?headerState:{scrolled:false,overHero:hasPhotoHero,darkHero:hasPhotoHero,protectBrand:false,joinedHeight:0};
 useEffect(()=>{setMobile(false);setOpen(null);hoveredMenu.current=null},[path]);
 useEffect(()=>{
  const query=matchMedia('(max-width: 767px)');
  const update=()=>{
   const color=query.matches&&overHero&&darkHero&&!mobile?'#101010':'#ffffff';
   document.querySelector('meta[name="theme-color"]')?.setAttribute('content',color);
  };
  update();query.addEventListener('change',update);
  return()=>query.removeEventListener('change',update);
 },[overHero,darkHero,mobile,path]);

 useEffect(()=>{
  let userScrollUntil=0;
  document.documentElement.removeAttribute('data-wordmark-motion');
  const arm=()=>{userScrollUntil=performance.now()+1200};
  const key=(event:KeyboardEvent)=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)&&!(event.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true]'))arm()};
  const size=()=>{if(performance.now()>userScrollUntil)return;const value=window.scrollY>8?'compact':'large';if(document.documentElement.dataset.wordmarkSize===value)return;document.documentElement.dataset.wordmarkMotion='scroll';document.documentElement.dataset.wordmarkSize=value;try{sessionStorage.setItem('ifranchise-wordmark-size',value)}catch{}};
  window.addEventListener('wheel',arm,{passive:true});window.addEventListener('touchmove',arm,{passive:true});window.addEventListener('keydown',key);window.addEventListener('scroll',size,{passive:true});
  return()=>{window.removeEventListener('wheel',arm);window.removeEventListener('touchmove',arm);window.removeEventListener('keydown',key);window.removeEventListener('scroll',size)};
 },[path]);

 useLayoutEffect(()=>{
  const header=root.current;
  let hero:Element|null=null,sectionBar:Element|null=null,frame=0;
  const resize=new ResizeObserver(()=>schedule());
  const update=()=>{
   frame=0;
   // Routes may stream their hero after the shared header has hydrated.
   const nextHero=document.querySelector('.p-video-hero,.p-photo-hero,.opportunities-hero,.p-about-intro');
   if(nextHero!==hero){if(hero)resize.unobserve(hero);hero=nextHero;if(hero)resize.observe(hero);}
   const nextBar=document.querySelector('.dossier-nav,.reader-toolbar,.p-brand-nav,.profile-section-nav'+(innerWidth>=1024?',.opportunity-filters':''));
   if(nextBar!==sectionBar){if(sectionBar)resize.unobserve(sectionBar);sectionBar=nextBar;if(sectionBar)resize.observe(sectionBar);}
   const height=header?.getBoundingClientRect().height||80;
   header?.style.setProperty('--menu-panel-height',(mobile?(header.querySelector('.p-navigation')?.getBoundingClientRect().height||0):0)+'px');
   const barRect=sectionBar?.getBoundingClientRect();
   const combinedHeight=!mobile&&barRect&&Math.abs(barRect.top-height)<2?height+barRect.height:0;
   const over=!!hero&&hero.getBoundingClientRect().bottom>height;
   const brand=wordmark.current?.querySelector('.identity-lockup')?.getBoundingClientRect();
   // Switch before hero copy reaches the logo. Keep it readable through the
   // remaining copy, instead of flickering between treatments in line gaps.
   const copyReachedBrand=over&&!!brand&&Array.from(hero!.querySelectorAll('h1,h2,h3,p,a,button')).some(element=>{
    const rect=element.getBoundingClientRect();
    return rect.width>0&&rect.height>0&&rect.right>brand.left&&rect.left<brand.right&&rect.top<=height+12;
   });
   const next={path,scrolled:window.scrollY>8,overHero:over,darkHero:!!hero?.matches('.p-video-hero,[data-hero-tone="dark"]'),protectBrand:copyReachedBrand,joinedHeight:combinedHeight};
   setHeaderState(current=>current.path===next.path&&current.scrolled===next.scrolled&&current.overHero===next.overHero&&current.darkHero===next.darkHero&&current.protectBrand===next.protectBrand&&current.joinedHeight===next.joinedHeight?current:next);
  };
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  // Form validation and dropdown changes must not remeasure the whole header.
  const content=new MutationObserver(records=>{if(records.some(record=>Array.from(record.addedNodes).some(node=>node instanceof Element&&(node.matches('main,.p-photo-hero,.p-video-hero,.profile-section-nav')||node.querySelector('.p-photo-hero,.p-video-hero,.profile-section-nav')))))schedule()});
  content.observe(document.querySelector('.p-site')||document.body,{childList:true,subtree:true});
  if(header){resize.observe(header);const navigation=header.querySelector('.p-navigation');if(navigation)resize.observe(navigation);}
  update();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  window.addEventListener('pageshow',schedule);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);window.removeEventListener('pageshow',schedule);content.disconnect();resize.disconnect();};
 },[path,mobile]);
 useEffect(()=>{function dismiss(e:PointerEvent){if(root.current&&!root.current.contains(e.target as Node)){setMobile(false);setOpen(null)}}function escape(e:KeyboardEvent){if(e.key==='Escape'){const key=open;setOpen(null);if(key)root.current?.querySelector<HTMLButtonElement>('#p-nav-'+key)?.focus();else{setMobile(false);toggle.current?.focus()}}}document.addEventListener('pointerdown',dismiss);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('keydown',escape)}},[open]);
 function link(href:string,label:string){return <a className="p-menu-row" href={href} aria-current={path===href?'page':undefined} onClick={()=>{setMobile(false);setOpen(null)}}><span>{label}</span></a>}
 function dropdown(key:keyof typeof menus){const m=menus[key];return <div className={'p-nav-group'+(open===key?' is-open':'')} onPointerEnter={e=>{if(e.pointerType==='mouse'&&matchMedia('(min-width: 1280px)').matches){hoveredMenu.current=key;setOpen(key)}}} onPointerLeave={e=>{if(e.pointerType==='mouse'&&matchMedia('(min-width: 1280px)').matches){hoveredMenu.current=null;setOpen(null)}}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(v=>v===key?null:v)}}><button className="p-menu-row" id={'p-nav-'+key} aria-expanded={open===key} aria-controls={'p-drop-'+key} onClick={e=>setOpen(current=>e.detail>0&&hoveredMenu.current===key?key:current===key?null:key)} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setOpen(key);requestAnimationFrame(()=>root.current?.querySelector<HTMLAnchorElement>('#p-drop-'+key+' a')?.focus())}}}><span>{m.label}</span><ChevronDown size={14}/></button><div className="p-dropdown" id={'p-drop-'+key} hidden={open!==key}>{m.links.map(([href,label])=><a key={href} href={href} onClick={()=>{setMobile(false);setOpen(null)}} aria-current={path===href?'page':undefined}><span>{label}</span><ArrowUpRight size={15}/></a>)}</div></div>}
 return <><a className="skip-link" href="#main">Skip to content</a><header className={'p-header'+(scrolled?' is-scrolled':'')+(overHero?' is-on-hero':'')+(protectBrand?' is-brand-protected':'')+(joinedHeight?' has-section-glass':'')+(mobile?' is-menu-open':'')+(darkHero&&overHero&&!mobile?' is-over-hero':'')} ref={root}><div className="p-header-inner"><span className="p-brand-space" aria-hidden="true"/><nav id="p-navigation" className={'p-navigation'+(mobile?' is-open':'')} aria-label="Main navigation">{link('/','Home')}{link('/franchise-opportunities','Franchise opportunities')}{link('/list-your-brand','List your Brand')}{dropdown('resources')}{dropdown('company')}<a className="p-mobile-contact p-menu-row" href="/contact-us"><span>Contact us</span><ArrowUpRight size={18}/></a></nav><div className="p-header-tools"><a className="p-contact-button" href="/contact-us">Contact us<ArrowUpRight size={16}/></a><button ref={toggle} className="p-menu-button" aria-expanded={mobile} aria-controls="p-navigation" aria-label={mobile?'Close navigation':'Open navigation'} onClick={()=>setMobile(!mobile)}>{mobile?<X size={23}/>:<Menu size={23}/>}</button></div></div></header>{joinedHeight>0&&<div className="p-navigation-glass" aria-hidden="true" style={{height:joinedHeight}}/>}<div ref={wordmark} className={'p-floating-brand'+(overHero&&darkHero&&!mobile?' is-on-dark-hero':'')}><BrandIdentity wordmark/></div></>}
export function Footer(){const contact=useSiteSettings();const contactPage=usePathname()==='/contact-us';return <footer className="p-footer"><div className="p-container">
 <div className="p-footer-grid">
  <div className="p-footer-contact"><h2>{contactPage?'Follow us':'Contact'}</h2>{!contactPage&&<><a className="p-footer-email" href={'mailto:'+contact.email}>{contact.email}<ArrowUpRight size={18}/></a><a href={'tel:'+contact.phone}><Phone size={16}/>{phoneLabel(contact.phone)}</a></>}<SocialLinks/></div>
  <div><h2>Explore</h2><a href="/franchise-opportunities">Franchise opportunities</a><a href="/list-your-brand">List your Brand</a><a href="/resources">Resources</a></div>
  <div><h2>Company</h2><a href="/about-us">About us</a><a href="/careers">Careers</a><a href="/contact-us">Contact us</a></div>
  <div className="p-footer-office"><h2>Registered office</h2><p className="footer-company-name">iFranchise Services Private Limited</p><address>Innov 8 Mantri Commercio, Tower A, No 51,<br/>5th floor, Bellandur, Bangalore South,<br/>Bangalore 560103, Karnataka, India.</address></div>
 </div>
 <div className="p-footer-bottom"><span>© {new Date().getFullYear()} iFranchise. All rights reserved.</span><nav className="p-footer-legal" aria-label="Legal"><a href="/privacy-policy">Privacy Policy</a><a href="/terms-and-conditions">Terms &amp; Conditions</a><a href="/privacy-choices">Privacy choices</a></nav><a href="#main" className="p-back-top">Back to top<ArrowUpRight size={15}/></a></div>
 </div></footer>}
export function WhatsAppButton(){const contact=useSiteSettings();
 const path=usePathname(),[footerVisible,setFooterVisible]=useState(false);
 useEffect(()=>{const footer=document.querySelector('.p-footer');if(!footer)return;const observer=new IntersectionObserver(([entry])=>setFooterVisible(entry.isIntersecting));observer.observe(footer);return()=>observer.disconnect()},[path]);

 if(path.startsWith('/franchise/')||path==='/'||path==='/contact-us'||path==='/list-your-brand'||path==='/careers'||path.startsWith('/careers/')||footerVisible)return null;
 return <a className="whatsapp-float whatsapp-compact" href={whatsappUrl(undefined,contact.phone)} target="_blank" rel="noopener noreferrer" aria-label="Chat with iFranchise on WhatsApp"><Icon name="whatsapp" width="25"/></a>
}
