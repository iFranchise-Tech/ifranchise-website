'use client';
import {useEffect,useRef,useState} from 'react';
import {readConsent,writeConsent,applyConsent} from '../lib/measurement.mjs';
export function CookieSettingsButton({className=''}:{className?:string}){return <button type="button" className={className} onClick={()=>window.dispatchEvent(new Event('open-privacy'))}>Cookie settings</button>}
export function Privacy(){
 const [open,setOpen]=useState(false),[hasChoice,setHasChoice]=useState(false),previous=useRef<HTMLElement|null>(null);
 function storage(){try{return localStorage}catch{return undefined}}
 useEffect(()=>{const c=readConsent(storage());setOpen(!c);setHasChoice(!!c);applyConsent(window,c);const show=()=>{previous.current=document.activeElement as HTMLElement;setOpen(true)};const sync=()=>{const c=readConsent(storage());setOpen(!c);setHasChoice(!!c);applyConsent(window,c);window.dispatchEvent(new Event('consent-updated'))};window.addEventListener('open-privacy',show);window.addEventListener('storage',sync);return()=>{window.removeEventListener('open-privacy',show);window.removeEventListener('storage',sync)}},[]);
 function choose(optional:boolean){const c=writeConsent(storage(),{analytics:optional,advertising:optional});applyConsent(window,c);setOpen(false);setHasChoice(true);previous.current?.focus();window.dispatchEvent(new Event('consent-updated'));if((window as any).__ifrGtmLoaded)location.reload()}
 if(!open)return null;
 return <section className="privacy-panel resource-cookie" role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-description"><div><h2 id="cookie-title">Cookies on this website</h2><p id="cookie-description">We use necessary storage to keep the website working and remember your settings. Optional cookies help measure website use and advertising when those services are active.</p><a href="/privacy-policy#cookies">Privacy Policy</a></div><div className="privacy-actions"><button type="button" className="cookie-choice" onClick={()=>choose(true)}>Accept all cookies</button><button type="button" className="cookie-choice" onClick={()=>choose(false)}>Necessary only</button>{hasChoice&&<button className="cookie-dismiss" aria-label="Close cookie settings without changing your choice" onClick={()=>setOpen(false)}>×</button>}</div></section>;
}
