'use client';

import {useEffect,useRef,useState} from 'react';
import {Pause,Play} from 'lucide-react';

const film='/assets/home-hero/franchise-journey.mp4';
const poster='/assets/home-hero/poster.webp';
type DataConnection=EventTarget & {saveData?:boolean;effectiveType?:string};

export function HeroVideo(){
 const video=useRef<HTMLVideoElement>(null);
 const intent=useRef<'auto'|'play'|'pause'>('auto');
 const [playing,setPlaying]=useState(false);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  const element=video.current;
  if(!element)return;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection=(navigator as Navigator & {connection?:DataConnection}).connection;
  let visible=false,loaded=document.readyState==='complete',disposed=false;
  const update=()=>{
   const conserve=motion.matches||connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType||'');
   const wanted=intent.current==='play'||(intent.current==='auto'&&!conserve);
   if(!visible||document.hidden||!loaded||!wanted){element.pause();return;}
   // Keep the video request out of the initial page load and respect visitor preferences.
   if(!element.getAttribute('src'))element.src=film;
   element.muted=true;
   void element.play().catch(()=>{if(!disposed)setPlaying(false);});
  };
  const onLoad=()=>{loaded=true;update();};
  const onPreference=()=>{intent.current='auto';update();};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();},{threshold:0});
  observer.observe(element);
  window.addEventListener('load',onLoad);
  document.addEventListener('visibilitychange',update);
  motion.addEventListener('change',onPreference);
  connection?.addEventListener('change',onPreference);
  return ()=>{disposed=true;observer.disconnect();element.pause();window.removeEventListener('load',onLoad);document.removeEventListener('visibilitychange',update);motion.removeEventListener('change',onPreference);connection?.removeEventListener('change',onPreference);};
 },[]);
 function toggle(){
  const element=video.current;
  if(!element)return;
  if(!element.paused){intent.current='pause';element.pause();return;}
  intent.current='play';
  if(!element.getAttribute('src'))element.src=film;
  element.muted=true;
  void element.play().catch(()=>setPlaying(false));
 }
 return <>
  <img className="p-video-hero-poster" src={poster} alt="" width="1920" height="1080" fetchPriority="high" decoding="async"/>
  <video ref={video} className="p-video-hero-video" poster={poster} muted loop playsInline preload="none" disablePictureInPicture aria-hidden="true" tabIndex={-1} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>{setFailed(true);setPlaying(false);}} hidden={failed}/>
  {!failed&&<button className="p-video-hero-toggle" type="button" onClick={toggle} aria-label={playing?'Pause background video':'Play background video'} title={playing?'Pause background video':'Play background video'}>{playing?<Pause size={18} aria-hidden="true"/>:<Play size={18} aria-hidden="true"/>}</button>}
 </>;
}
