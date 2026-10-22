'use client';
import {useEffect,useRef,useState} from 'react';
import {indianStates} from '../lib/locations.mjs';
import {getAttribution,readConsent} from '../lib/measurement.mjs';
export function useIntake(){
 const id=useRef(''),session=useRef<Promise<string>|null>(null);const [ready,setReady]=useState(false);
 async function initialise(){const r=await fetch('/api/intake/session',{method:'POST'});const d:any=await r.json();if(!r.ok)throw Error(d.error||'The form is unavailable. Please try again.');return d.token as string;}
 useEffect(()=>{id.current=crypto.randomUUID();session.current=initialise();session.current.catch(()=>{});setReady(true)},[]);
 async function payload(form:HTMLFormElement,kind:string){
  const fd=new FormData(form);if(!session.current)session.current=initialise();let token;try{token=await session.current}catch(e){session.current=null;throw e}
  return {...Object.fromEntries(fd.entries()),id:id.current,token,kind,consent:fd.get('consent')==='on',sourcePage:location.pathname,source:getAttribution(window,readConsent(localStorage))};
 }
 return {ready,payload};
}
export function LocationFields({id,preferred=false}:{id:string;preferred?:boolean}){return <div className="field-row"><div className="field"><label htmlFor={id+'-state'}>{preferred?'Preferred state / UT':'State / UT'} *</label><select id={id+'-state'} name="state" required defaultValue="" autoComplete="address-level1"><option value="" disabled>Select state / UT</option>{indianStates.map(s=><option key={s}>{s}</option>)}</select></div><div className="field"><label htmlFor={id+'-city'}>{preferred?'Preferred city':'City'} *</label><input id={id+'-city'} name="city" required minLength={2} maxLength={120} autoComplete="address-level2"/></div></div>}
export function IntakeConsent({job=false}:{job?:boolean}){return <><label className="checkbox-label"><input type="checkbox" name="consent" required/><span>{job?'I agree to the use of my details and résumé for this application.':'I agree to be contacted about this enquiry.'} <a href="/privacy-policy#privacy" target="_blank" rel="noreferrer">Privacy policy</a></span></label><div className="honeypot" aria-hidden="true"><label>Leave this empty<input name="trap" tabIndex={-1} autoComplete="off"/></label></div></>}
export async function readReceipt(r:Response){const d:any=await r.json();if(!r.ok||d.received!==true)throw Error(d.error||'Your submission could not be confirmed. Please try again.');return d;}
