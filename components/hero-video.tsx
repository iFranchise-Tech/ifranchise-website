'use client';

import {useEffect,useRef,useState} from 'react';
import {createHeroPlayback,selectHeroFilm} from '@/lib/hero-video-playback.mjs';

const poster='/assets/home-hero/plan-to-presence-hd-v2.webp';
type DataConnection=EventTarget & {saveData?:boolean;effectiveType?:string};

export function HeroVideo(){
 const video=useRef<HTMLVideoElement>(null);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  const element=video.current;
  if(!element)return;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection=(navigator as Navigator & {connection?:DataConnection}).connection;
  let visible=false,loaded=document.readyState==='complete';
  const playback=createHeroPlayback(element,{
   canPlay:()=>visible&&!document.hidden&&loaded&&!motion.matches&&!connection?.saveData&&!['slow-2g','2g'].includes(connection?.effectiveType||''),
   source:()=>selectHeroFilm(window.innerWidth,window.innerHeight,window.devicePixelRatio,connection?.effectiveType),
   onUnavailable:setFailed,
  });
  const update=()=>playback.sync();
  const resume=()=>playback.sync(true);
  const onLoad=()=>{loaded=true;update();};
  const onPreference=update;
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();},{threshold:0});
  observer.observe(element);
  window.addEventListener('load',onLoad);
  window.addEventListener('pageshow',resume);
  window.addEventListener('online',resume);
  document.addEventListener('pointerdown',resume,{passive:true});
  document.addEventListener('keydown',resume);
  document.addEventListener('visibilitychange',update);
  motion.addEventListener('change',onPreference);
  connection?.addEventListener('change',onPreference);
  return ()=>{observer.disconnect();playback.destroy();window.removeEventListener('load',onLoad);window.removeEventListener('pageshow',resume);window.removeEventListener('online',resume);document.removeEventListener('pointerdown',resume);document.removeEventListener('keydown',resume);document.removeEventListener('visibilitychange',update);motion.removeEventListener('change',onPreference);connection?.removeEventListener('change',onPreference);};
 },[]);
 return <>
  <picture>
   <source media="(max-width:767px) and (orientation:portrait)" srcSet="/assets/home-hero/plan-to-presence-portrait-v2.webp"/>
   <img className="p-video-hero-poster" src={poster} srcSet={`${poster} 1920w, /assets/home-hero/plan-to-presence-qhd-v2.webp 2560w`} sizes="100vw" alt="" width="1920" height="1080" fetchPriority="high" decoding="async"/>
  </picture>
  <video ref={video} className="p-video-hero-video" muted loop playsInline preload="none" disablePictureInPicture aria-hidden="true" tabIndex={-1} hidden={failed}/>
 </>;
}
