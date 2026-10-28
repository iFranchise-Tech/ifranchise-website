'use client';
import {useEffect,useTransition} from 'react';
import {useRouter,usePathname} from 'next/navigation';
import {pageBanners} from '../lib/page-banners';
import {responsiveImage} from '../lib/responsive-image';
import {internalPage,anchorTop} from '../lib/page-navigation.mjs';
const images=new Map<string,Promise<void>>();
function warmBanner(path:string){const name=path.split(/[?#]/)[0];const banner=({'/about-us':pageBanners.about,'/list-your-brand':pageBanners.brand,'/careers':pageBanners.careers,'/resources':pageBanners.resources,'/resources/blogs':pageBanners.blogs,'/resources/articles':pageBanners.articles,'/resources/videos':pageBanners.videos} as Record<string,{mobileImage:string;image:string}>)[name];if(!banner)return Promise.resolve();const src=matchMedia('(max-width:767px)').matches?banner.mobileImage:banner.image;if(!images.has(src)){const img=new Image();if(src===banner.image){const variant=responsiveImage(src,'100vw');if('srcSet' in variant){img.srcset=variant.srcSet||'';img.sizes='100vw'}}img.src=src;images.set(src,img.decode().catch(()=>{}))}return images.get(src)!}
export function scrollToSection(id:string){const section=document.getElementById(id);if(!section)return false;const target=id==='brand-enquiry'?section.querySelector('.enquiry-card')||section:id==='open-roles'?section.querySelector('.careers-list-heading,.careers-no-results')||section:section;const header=document.querySelector('.p-header')?.getBoundingClientRect().height||parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-height'))||80;window.scrollTo({top:anchorTop(target.getBoundingClientRect().top,window.scrollY,header),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return true}
export function PageNavigation(){const router=useRouter(),path=usePathname(),[pending,startTransition]=useTransition();
 useEffect(()=>{
  let alive=true,sequence=0;const prefetched=new Set<string>();
  function target(e:Event){const a=(e.target as Element)?.closest?.('a[href]') as HTMLAnchorElement|null;if(!a||a.target&&a.target!=='_self'||a.hasAttribute('download')||a.dataset.nativeNavigation!==undefined)return null;const href=internalPage(a.href,location.href);return href?{a,href}:null}
  function warm(e:Event){const t=target(e);if(!t||t.href.startsWith(path+'#'))return;warmBanner(t.href);if(!prefetched.has(t.href)){prefetched.add(t.href);router.prefetch(t.href)}}
  function click(e:MouseEvent){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const t=target(e);if(!t)return;const u=new URL(t.a.href),same=u.pathname===location.pathname&&u.search===location.search;if(same&&u.hash){if(scrollToSection(decodeURIComponent(u.hash.slice(1)))){e.preventDefault();history.pushState(history.state,'',u.hash)}return}if(same)return;e.preventDefault();const current=++sequence;startTransition(async()=>{await Promise.race([warmBanner(t.href),new Promise(resolve=>setTimeout(resolve,900))]);if(alive&&current===sequence)router.push(t.href)})}
  document.addEventListener('pointerover',warm,{passive:true});document.addEventListener('focusin',warm);document.addEventListener('touchstart',warm,{passive:true});document.addEventListener('click',click);
  return()=>{alive=false;document.removeEventListener('pointerover',warm);document.removeEventListener('focusin',warm);document.removeEventListener('touchstart',warm);document.removeEventListener('click',click)};
 },[router,path]);
 useEffect(()=>{let target;try{target=JSON.parse(sessionStorage.getItem('ifranchise-restore-position')||'null')}catch{}if(!target||target.path.split('#')[0]!==path)return;sessionStorage.removeItem('ifranchise-restore-position');let frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>window.scrollTo({top:target.y,behavior:'instant'}))});return()=>cancelAnimationFrame(frame)},[path]);
 return pending?<div className="page-navigation-progress" role="status" aria-label="Opening page"/>:null;
}
