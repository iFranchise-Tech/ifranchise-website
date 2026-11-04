'use client';
import {useEffect,useRef,useState,useTransition} from 'react';
import {useRouter,usePathname} from 'next/navigation';
import {safeReturnPath} from '../lib/intake/confirmation.mjs';
import {pageBanners} from '../lib/page-banners';
import {responsiveImage} from '../lib/responsive-image';
import {internalPage,anchorTop} from '../lib/page-navigation.mjs';
const images=new Map<string,Promise<void>>();
function warmBanner(path:string){const name=path.split(/[?#]/)[0];const banner=({'/about-us':pageBanners.about,'/list-your-brand':pageBanners.brand,'/careers':pageBanners.careers,'/resources':pageBanners.resources,'/resources/blogs':pageBanners.blogs,'/resources/articles':pageBanners.articles,'/resources/videos':pageBanners.videos,'/faq':pageBanners.faq} as Record<string,{mobileImage:string;tabletImage?:string;image:string}>)[name];if(!banner)return Promise.resolve();const src=matchMedia('(max-width:767px)').matches?banner.mobileImage:banner.tabletImage&&matchMedia('(max-width:1100px)').matches?banner.tabletImage:banner.image;if(!images.has(src)){const img=new Image();if(src===banner.image){const variant=responsiveImage(src,'100vw');if('srcSet' in variant){img.srcset=variant.srcSet||'';img.sizes='100vw'}}img.src=src;images.set(src,img.decode().catch(()=>{}))}return images.get(src)!}
export function scrollToSection(id:string){
 const section=document.getElementById(id);if(!section)return false;
 const target=id==='brand-enquiry'?section.querySelector('.enquiry-card')||section:id==='open-roles'?section.querySelector('.careers-list-heading,.careers-no-results')||section:section;
 const header=document.querySelector('.p-header')?.getBoundingClientRect().height||parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-height'))||80;
 // The brand's content tabs remain below the main header when these sections scroll into view.
 const brandTabs=target.closest('.profile-content')?.querySelector('.profile-section-nav');
 const tabsHeight=brandTabs&&['overview','investment','returns','questions'].includes(id)?brandTabs.getBoundingClientRect().height:0;
 window.scrollTo({top:anchorTop(target.getBoundingClientRect().top,window.scrollY,header+tabsHeight),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return true;
}
function NavigationProgress(){const [visible,setVisible]=useState(false);useEffect(()=>{const timer=setTimeout(()=>setVisible(true),180);return()=>clearTimeout(timer)},[]);return visible?<div className="page-navigation-progress" role="status" aria-label="Opening page"/>:null}
export function PageNavigation(){const router=useRouter(),path=usePathname(),[pending,startTransition]=useTransition(),sectionNavigation=useRef<string|null>(null);
 useEffect(()=>{
  const prefetched=new Set<string>();
  function target(e:Event){const a=(e.target as Element)?.closest?.('a[href]') as HTMLAnchorElement|null;if(!a||a.target&&a.target!=='_self'||a.hasAttribute('download')||a.dataset.nativeNavigation!==undefined)return null;const href=internalPage(a.href,location.href);return href?{a,href}:null}
  function warm(e:Event){const t=target(e),connection=(navigator as Navigator&{connection?:{saveData?:boolean;effectiveType?:string}}).connection;if(!t||connection?.saveData||/2g/.test(connection?.effectiveType||''))return;const href=t.href.split('#')[0];if(href===location.pathname+location.search)return;void warmBanner(href);if(!prefetched.has(href)){prefetched.add(href);router.prefetch(href)}}
  function click(e:MouseEvent){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const t=target(e);if(!t)return;const u=new URL(t.a.href),same=u.pathname===location.pathname&&u.search===location.search;if(same&&u.hash){if(scrollToSection(decodeURIComponent(u.hash.slice(1)))){e.preventDefault();history.pushState(history.state,'',u.hash)}return}if(same)return;e.preventDefault();void warmBanner(t.href);sectionNavigation.current=u.hash?t.href:null;startTransition(()=>router.push(t.href,{scroll:!u.hash}))}
  document.addEventListener('pointerover',warm,{passive:true});document.addEventListener('focusin',warm);document.addEventListener('touchstart',warm,{passive:true});document.addEventListener('click',click);
  return()=>{document.removeEventListener('pointerover',warm);document.removeEventListener('focusin',warm);document.removeEventListener('touchstart',warm);document.removeEventListener('click',click)};
 },[router,path]);
 // Cross-page anchors use the same measured navbar offset as in-page links.
 // Wait for the route to commit before measuring the destination, and disable
 // the router's competing scroll-to-element behavior for this navigation.
 useEffect(()=>{
  const destination=sectionNavigation.current;
  if(pending||!destination||destination!==location.pathname+location.search+location.hash)return;
  let frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{
   if(sectionNavigation.current!==destination||destination!==location.pathname+location.search+location.hash)return;
   sectionNavigation.current=null;
   try{if(!scrollToSection(decodeURIComponent(location.hash.slice(1))))window.scrollTo({top:0,behavior:'instant'})}catch{window.scrollTo({top:0,behavior:'instant'})}
  })});
  return()=>cancelAnimationFrame(frame);
 },[path,pending]);
 useEffect(()=>{let target;try{target=JSON.parse(sessionStorage.getItem('ifranchise-restore-position')||'null')}catch{}if(!target||!safeReturnPath(target.path)||!Number.isFinite(target.y)||target.path.split('#')[0]!==path+location.search)return;sessionStorage.removeItem('ifranchise-restore-position');let frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>window.scrollTo({top:target.y,behavior:'instant'}))});return()=>cancelAnimationFrame(frame)},[path]);
 return pending?<NavigationProgress/>:null;
}
