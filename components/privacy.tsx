'use client';
import {useEffect,useRef,useState} from 'react';
import {readConsent,writeConsent,applyConsent,consentExpiresAt,CONSENT_KEY} from '../lib/measurement.mjs';
export function CookieSettingsButton({className=''}:{className?:string}){return <button type="button" className={className} onClick={()=>window.dispatchEvent(new Event('open-privacy'))}>Cookie settings</button>}
export function Privacy(){
 const [open,setOpen]=useState(false),[hasChoice,setHasChoice]=useState(false),previous=useRef<HTMLElement|null>(null);
 function storage(){try{return localStorage}catch{return undefined}}
 useEffect(()=>{
  let timer:ReturnType<typeof setTimeout>;
  function refresh(){
   clearTimeout(timer);const c=readConsent(storage());setHasChoice(!!c);if(!c)setOpen(true);applyConsent(window,c);window.dispatchEvent(new Event('privacy-status-refreshed'));
   if(c)timer=setTimeout(refresh,Math.min(2147483647,Math.max(1,consentExpiresAt(c)!-Date.now())));
  }
  const show=()=>{previous.current=document.activeElement as HTMLElement;setOpen(true)};
  const sync=(event:StorageEvent)=>{if(event.key&&event.key!==CONSENT_KEY)return;refresh();window.dispatchEvent(new Event('consent-updated'))};
  const visible=()=>{if(document.visibilityState==='visible')refresh()};
  refresh();window.addEventListener('open-privacy',show);window.addEventListener('storage',sync);window.addEventListener('consent-updated',refresh);window.addEventListener('pageshow',refresh);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',visible);
  return()=>{clearTimeout(timer);window.removeEventListener('open-privacy',show);window.removeEventListener('storage',sync);window.removeEventListener('consent-updated',refresh);window.removeEventListener('pageshow',refresh);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',visible)};
 },[]);
 function choose(optional:boolean){const c=writeConsent(storage(),{analytics:optional,advertising:optional});applyConsent(window,c);setOpen(false);setHasChoice(true);previous.current?.focus();window.dispatchEvent(new Event('consent-updated'));if((window as any).__ifrGtmLoaded)location.reload()}
 if(!open)return null;
 return <section className="privacy-panel resource-cookie" role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-description"><div><h2 id="cookie-title">Cookies on this website</h2><p id="cookie-description">We use necessary storage to keep the website working and remember your settings. Optional cookies help measure website use and advertising when those services are active.</p><a href="/privacy-policy#cookies">Privacy Policy</a></div><div className="privacy-actions"><button type="button" className="cookie-choice" onClick={()=>choose(true)}>Accept all cookies</button><button type="button" className="cookie-choice" onClick={()=>choose(false)}>Necessary only</button>{hasChoice&&<button className="cookie-dismiss" aria-label="Close cookie settings without changing your choice" onClick={()=>setOpen(false)}>×</button>}</div></section>;
}

export function ConsentStatus(){
 const [choice,setChoice]=useState<ReturnType<typeof readConsent>>(null);
 useEffect(()=>{const refresh=()=>{try{setChoice(readConsent(localStorage))}catch{setChoice(null)}};refresh();window.addEventListener('consent-updated',refresh);window.addEventListener('privacy-status-refreshed',refresh);window.addEventListener('focus',refresh);return()=>{window.removeEventListener('consent-updated',refresh);window.removeEventListener('privacy-status-refreshed',refresh);window.removeEventListener('focus',refresh)}},[]);
 const date=(time:number)=>new Date(time).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
 return <p className="consent-status">{choice?<>Your choice: {choice.analytics||choice.advertising?'optional cookies allowed':'necessary cookies only'}. Saved on {date(choice.savedAt)}. We’ll ask again by {date(consentExpiresAt(choice)!)} or sooner if the notice changes.</>:<>No current cookie preference is saved in this browser. Your choice is remembered for up to 180 days.</>}</p>;
}
