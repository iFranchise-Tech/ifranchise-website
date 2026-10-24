'use client';
import {useEffect,useState} from 'react';
import {DEFAULT_THEME,THEME_STORAGE_KEY,type Theme} from '../lib/theme';

export function ThemeToggle(){
 const [theme,setTheme]=useState<Theme>(DEFAULT_THEME);
 useEffect(()=>{
  const update=()=>setTheme(document.documentElement.dataset.theme==='light'?'light':'dark');
  update();
  const sync=(event:StorageEvent)=>{
   if(event.key!==THEME_STORAGE_KEY&&event.key!==null)return;
   const value=event.newValue==='light'||event.newValue==='dark'?event.newValue:DEFAULT_THEME;
   document.documentElement.dataset.theme=value;update();
  };
  const restore=()=>{
   try{
    const saved=localStorage.getItem(THEME_STORAGE_KEY);
    document.documentElement.dataset.theme=saved==='light'||saved==='dark'?saved:DEFAULT_THEME;
   }catch{/* Retain the current mode if browser storage is unavailable. */}
   update();
  };
  window.addEventListener('storage',sync);
  window.addEventListener('pageshow',restore);
  return()=>{window.removeEventListener('storage',sync);window.removeEventListener('pageshow',restore)};
 },[]);
 const next=theme==='light'?'dark':'light';
 function toggle(){
  document.documentElement.dataset.theme=next;
  setTheme(next);
  try{localStorage.setItem(THEME_STORAGE_KEY,next)}catch{/* Keep the selected mode for this page when storage is unavailable. */}
 }
 return <button type="button" className="theme-toggle" onClick={toggle} aria-label={'Switch to '+next+' mode'} title={'Switch to '+next+' mode'}>
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
   {theme==='light'?<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>:<path d="M20.9 13.1A9 9 0 0 1 10.9 3.1 9 9 0 1 0 20.9 13.1Z"/>}
  </svg><span>{next==='light'?'Light':'Dark'}</span>
 </button>;
}
