'use client';
import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
export function PremiumMotion({children}:{children:React.ReactNode}){
 const root=useRef<HTMLDivElement>(null),path=usePathname();
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  if(media.matches||!root.current||!Element.prototype.animate)return;
  const animations=new Map<Element,Animation>();
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(entry.isIntersecting){animations.get(entry.target)?.play();observer.unobserve(entry.target)}
   }
  },{threshold:.08});
  // Avoid changing React-owned class attributes while streamed children hydrate.
  root.current.querySelectorAll('[data-reveal]').forEach(element=>{
   if(element.getBoundingClientRect().top<=innerHeight*.95)return;
   const animation=element.animate(
    [{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'none'}],
    {duration:700,easing:'ease',fill:'both'}
   );
   animation.pause();
   animation.onfinish=()=>{animation.cancel();animations.delete(element)};
   animations.set(element,animation);
   observer.observe(element);
  });
  const reset=()=>{observer.disconnect();animations.forEach(animation=>animation.cancel());animations.clear()};
  media.addEventListener('change',reset);
  return()=>{reset();media.removeEventListener('change',reset)};
 },[path]);
 return <div className="p-site" ref={root}>{children}</div>;
}
