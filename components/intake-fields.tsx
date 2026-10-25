'use client';
import {useEffect,useRef,useState} from 'react';
export {LocationFields} from './location-fields';
import {NOTICE_VERSION} from '../lib/intake/constants.mjs';
import {getAttribution,readConsent} from '../lib/measurement.mjs';
export function useIntake(){
 const id=useRef(''),session=useRef<Promise<string>|null>(null);const [ready,setReady]=useState(false);
 async function initialise(){const r=await fetch('/api/intake/session',{method:'POST'});const d:any=await r.json();if(!r.ok)throw Error(d.error||'The form is unavailable. Please try again.');return d.token as string;}
 useEffect(()=>{id.current=crypto.randomUUID();session.current=initialise();session.current.catch(()=>{});setReady(true)},[]);
 async function payload(form:HTMLFormElement,kind:string){
  const fd=new FormData(form);if(!session.current)session.current=initialise();let token;try{token=await session.current}catch(e){session.current=null;throw e}
  return {...Object.fromEntries(fd.entries()),id:id.current,token,kind,consent:kind==='job'?fd.get('consent')==='on':fd.get('enquiryConsent')==='on',adult:kind==='job'?fd.get('adult')==='on':fd.get('enquiryConsent')==='on',sourcePage:location.pathname,source:getAttribution(window,readConsent(localStorage))};
 }
 return {ready,payload};
}
export function IntakeConsent({job=false}:{job?:boolean}){return <>
 <input type="hidden" name="noticeVersion" value={NOTICE_VERSION}/>
 {job&&<label className="checkbox-label"><input type="checkbox" name="adult" required/><span>I am 18 or older.</span></label>}
 <label className="checkbox-label"><input type="checkbox" name={job?'consent':'enquiryConsent'} required/><span>{job?'I agree to iFranchise using my details and resume to assess this application.':'I am 18 or older and agree to iFranchise using my contact details and preferences to respond to this enquiry.'} <a href={'/privacy-policy#'+(job?'applications':'enquiries')} target="_blank" rel="noreferrer">Privacy notice</a> · <a href="/privacy-choices" target="_blank" rel="noreferrer">Privacy choices</a></span></label>
 <div className="honeypot" aria-hidden="true"><label>Leave this empty<input name="trap" tabIndex={-1} autoComplete="off"/></label></div>
 </>}

export async function readReceipt(r:Response){const d:any=await r.json();if(!r.ok||d.received!==true)throw Error(d.error||'Your submission could not be confirmed. Please try again.');return d;}
