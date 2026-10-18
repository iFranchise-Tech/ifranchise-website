'use client';
import {useEffect,useRef,useState} from 'react';
import {readConsent,writeConsent,applyConsent} from '../lib/measurement.mjs';

export function CookieSettingsButton({className=''}:{className?:string}){
 return <button type="button" className={className} onClick={()=>window.dispatchEvent(new Event('open-privacy'))}>Cookie preferences</button>;
}
export function Privacy(){
 const [open,setOpen]=useState(false),[custom,setCustom]=useState(false),[analytics,setAnalytics]=useState(false),[advertising,setAdvertising]=useState(false),[hasChoice,setHasChoice]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null),previousFocus=useRef<HTMLElement|null>(null);
 function storage(){try{return window.localStorage;}catch{return undefined;}}
 useEffect(()=>{
  const saved=readConsent(storage());setOpen(!saved);setHasChoice(!!saved);setAnalytics(saved?.analytics||false);setAdvertising(saved?.advertising||false);applyConsent(window,saved);
  const show=()=>{previousFocus.current=document.activeElement as HTMLElement;const c=readConsent(storage());setAnalytics(c?.analytics||false);setAdvertising(c?.advertising||false);setHasChoice(!!c);setCustom(true);setOpen(true);};
  const sync=(e:StorageEvent)=>{if(e.key!=='ifranchise_privacy_v1'&&e.key!==null)return;const c=readConsent(storage());setAnalytics(c?.analytics||false);setAdvertising(c?.advertising||false);setHasChoice(!!c);setOpen(!c);applyConsent(window,c);window.dispatchEvent(new Event('consent-updated'));if((window as any).__ifrGtmLoaded)window.location.reload();};
  window.addEventListener('open-privacy',show);window.addEventListener('storage',sync);
  return()=>{window.removeEventListener('open-privacy',show);window.removeEventListener('storage',sync);};
 },[]);
 useEffect(()=>{if(open&&custom)heading.current?.focus();},[open,custom]);
 function close(){setOpen(false);setCustom(false);previousFocus.current?.focus();}
 function save(a:boolean,b:boolean){const c=writeConsent(storage(),{analytics:a,advertising:b});applyConsent(window,c);setAnalytics(a);setAdvertising(b);setHasChoice(true);close();window.dispatchEvent(new Event('consent-updated'));if((window as any).__ifrGtmLoaded)window.location.reload();}
 if(!open)return null;
 return <section className={'privacy-panel'+(custom?' privacy-custom':'')} role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-description" onKeyDown={e=>{if(e.key==='Escape'&&hasChoice)close();}}>
  <div className="privacy-heading"><h2 id="cookie-title" ref={heading} tabIndex={-1}>{custom?'Your cookie preferences':'Choose your cookies'}</h2>{hasChoice&&<button className="privacy-close" aria-label="Close cookie preferences without changes" onClick={close}>×</button>}</div>
  <p id="cookie-description">We use necessary storage to remember your settings and keep the site working. With your permission, optional cookies can help us understand website use and measure advertising.</p>
  <p className="privacy-status">Optional analytics and advertising are currently inactive. Accepting cookies saves your preference; it does not switch these services on.</p>
  {custom&&<div className="privacy-categories">
   <div className="privacy-category"><div><strong>Necessary</strong><p>Remembers your privacy choices and supports security and the settings you request.</p></div><span className="always-on">Always on</span></div>
   <label className="privacy-category"><span><strong>Analytics</strong><span>Helps us understand which pages are useful and improve your experience.</span></span><input type="checkbox" checked={analytics} onChange={e=>setAnalytics(e.target.checked)} aria-label="Allow analytics cookies"/></label>
   <label className="privacy-category"><span><strong>Advertising</strong><span>Supports campaign measurement and relevant ads through advertising platforms.</span></span><input type="checkbox" checked={advertising} onChange={e=>setAdvertising(e.target.checked)} aria-label="Allow advertising cookies"/></label>
  </div>}
  <p className="privacy-policy-link"><a href="/privacy-and-terms#cookies">Privacy & Terms</a><span>Change your choice through Privacy & Terms in the footer.</span></p>
  <div className="privacy-actions"><button type="button" className="cookie-choice" onClick={()=>save(false,false)}>Necessary cookies only</button><button type="button" className="cookie-choice" onClick={()=>save(true,true)}>Accept all cookies</button>{custom?<button type="button" className="cookie-manage" onClick={()=>save(analytics,advertising)}>Save my preferences</button>:<button type="button" className="cookie-manage" onClick={()=>setCustom(true)}>Manage preferences</button>}</div>
 </section>;
}
