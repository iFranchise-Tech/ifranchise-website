'use client';
import {PhoneField,EmailField} from './contact-fields';
import {useEffect,useRef,useState} from 'react';

import {validateContact} from '../lib/enquiry.mjs';
import {journeyConfig,createJourneyClient,budgetOptions,timeframeOptions} from '../lib/journey-client.mjs';
import {readConsent,getAttribution,track,trackReceipt} from '../lib/measurement.mjs';
import {Icon} from './icons';
import {ArrowRight,ArrowLeft,Check} from 'lucide-react';
import {indianStates} from '../lib/locations.mjs';
export function EnquiryForm({brandSlug,items=[],journeyType}:{brandSlug?:string;items?:any[];journeyType?:'brand'|'investor'}){
 const brands=items;
 const listing=brands.find(b=>b.slug===brandSlug),embedded=Boolean(listing),id='enquiry-'+(listing?.slug||'contact');
 const [journey,setJourney]=useState(journeyType||'investor'),[brand,setBrand]=useState(listing?.slug||''),[company,setCompany]=useState(''),[website,setWebsite]=useState(''),[budget,setBudget]=useState('Exploring'),[timeframe,setTimeframe]=useState('Exploring'),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(false),[receipt,setReceipt]=useState(false),[info,setInfo]=useState<any>(null),[challenge,setChallenge]=useState(''),[ready,setReady]=useState(false);
 const [step,setStep]=useState(0);const formRef=useRef<HTMLFormElement>(null),previousStep=useRef(0);
 useEffect(()=>{if(previousStep.current===step)return;previousStep.current=step;formRef.current?.closest('.p-enquiry')?.scrollIntoView({block:'start',behavior:'auto'});formRef.current?.querySelector<HTMLInputElement>('[data-step="'+step+'"] input:not([type="hidden"]),[data-step="'+step+'"] select')?.focus({preventScroll:true});},[step]);
 const client=useRef<any>(null),widget=useRef<HTMLDivElement>(null),started=useRef(false);
 const selectedBrand=listing?.slug||brand;
 useEffect(()=>{if(!listing){const q=new URLSearchParams(location.search);setJourney(journeyType||(q.get('journey')==='brand'?'brand':'investor'));if(brands.some(b=>b.slug===q.get('brand')))setBrand(q.get('brand')!);}setReady(true);},[listing]);
 useEffect(()=>{
  if(!ready||!journeyConfig.connected||!journeyConfig.intakeEnabled)return;
  let disposed=false,widgetId:any;setInfo(null);setChallenge('');if(journeyConfig.intakeEnabled)setBusy(true);client.current=null;
  const connection=createJourneyClient({journey});
  async function init(){try{
   const f=await connection.initialize();if(disposed)return;setInfo(f);client.current=connection;if(!f.accepting)return;
   const render=()=>{if(disposed||!widget.current)return;widgetId=(window as any).turnstile.render(widget.current,{sitekey:f.site_key,action:'crm_enquiry',callback:(token:string)=>setChallenge(token),'expired-callback':()=>setChallenge(''),'error-callback':()=>{setChallenge('');setError(true);setMessage('Verification is unavailable. Please reload or contact us.');}});};
   if((window as any).turnstile)render();else{const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.onload=render;script.onerror=()=>{if(!disposed){setError(true);setMessage('Verification could not load. Please contact us.');}};document.head.appendChild(script);}
  }catch(e){if(!disposed&&journeyConfig.intakeEnabled){setError(true);setMessage((e as Error).message);}}finally{if(!disposed)setBusy(false);}}
  init();return()=>{disposed=true;if(widgetId!==undefined)(window as any).turnstile?.remove(widgetId);};
 },[ready,journey]);
 function chooseJourney(value:string){setJourney(value==='brand'?'brand':'investor');setStep(0);setMessage('');setError(false);setInfo(null);setChallenge('');started.current=false;const url=new URL(location.href);url.searchParams.set('journey',value);history.replaceState(history.state,'',url.pathname+url.search+url.hash);}
 function validateStep(n:number){const fields=formRef.current?.querySelectorAll('[data-step="'+n+'"] input,[data-step="'+n+'"] select');const controls=Array.from(fields||[]) as unknown as Array<Pick<HTMLInputElement,'willValidate'|'checkValidity'|'reportValidity'>>;const invalid=controls.find(f=>f.willValidate&&!f.checkValidity());if(invalid){invalid.reportValidity();return false}return true}
 function next(){if(validateStep(0)){setStep(1);setMessage('')}}
 async function send(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(step===0){next();return}if(!validateStep(1))return;setMessage('');setError(false);const fd=new FormData(e.currentTarget);
  try{
   const contact=validateContact({name:fd.get('name'),phone:fd.get('phone'),phoneCountry:fd.get('phoneCountry'),email:fd.get('email'),city:fd.get('city'),state:fd.get('state'),website:fd.get('website'),contactPermission:fd.get('contactPermission')==='on'});
   if(journey==='brand'&&company.trim().length<2)throw Error('Enter your brand name.');
   if(!journeyConfig.intakeEnabled||!info?.accepting){setMessage('Your details are ready to review. Nothing has been sent. Please call or message us to continue.');return;}
   setBusy(true);const result=await client.current.submit({contact,interestSlug:selectedBrand,companyName:company.trim(),companyWebsite:website,budget:journey==='investor'?budget:'Exploring',timeframe,challenge,source:getAttribution(window,readConsent(localStorage))});
   if(journeyConfig.conversionSending)trackReceipt(window,result,info.form_id);setReceipt(true);setMessage(result.message);
  }catch(e){setError(true);setMessage((e as Error).message);}finally{setBusy(false);}
 }
 const budgetField=<div className="field"><label htmlFor={id+'-budget'}>Investment range</label><select id={id+'-budget'} name="budget" value={budget} onChange={e=>setBudget(e.target.value)}>{budgetOptions.map(v=><option key={v}>{v}</option>)}</select></div>;
 const timingField=<div className="field"><label htmlFor={id+'-timeframe'}>{journey==='brand'?'Expansion timeframe':'When would you start?'}</label><select id={id+'-timeframe'} name="timeframe" value={timeframe} onChange={e=>setTimeframe(e.target.value)}>{timeframeOptions.map(v=><option key={v}>{v}</option>)}</select></div>;
 if(receipt)return <div className="enquiry-card"><h2>Thank you for your enquiry.</h2><p role="status">{message}</p><a className="text-link" href="/">Back to iFranchise →</a></div>;
 return <div className={'enquiry-card p-enquiry '+(embedded?'listing-enquiry':'contact-enquiry')} data-brand-slug={listing?.slug}>
  {!embedded&&!journeyType&&<div className="p-form-switch" aria-label="Enquiry type">{[['investor','Explore a franchise'],['brand','Expand a business']].map(([value,label])=><button key={value} type="button" aria-pressed={journey===value} onClick={()=>chooseJourney(value)}>{label}</button>)}</div>}
  <div className="p-form-heading"><h2 id={id+'-heading'}>{embedded?'Request franchise details':journey==='investor'?'Your franchise enquiry':'Your brand enquiry'}</h2><span>{step+1} / 2</span></div>
  <div className="p-form-progress" aria-label="Enquiry steps"><button type="button" onClick={()=>setStep(0)} aria-current={step===0?'step':undefined}><span>{step>0?<Check size={14}/>:1}</span>Your details</button><i/><button type="button" onClick={next} aria-current={step===1?'step':undefined}><span>2</span>{journey==='brand'?'Your business':'Your preferences'}</button></div>
  <form ref={formRef} onSubmit={send} noValidate aria-label={listing?listing.name+' franchise enquiry':journey==='investor'?'Investor enquiry':'Brand enquiry'} onFocus={()=>{if(!started.current){started.current=true;track(window,'ifranchise_form_start',{journey,brand_slug:selectedBrand});}}}>
   <input type="hidden" name="interest_slug" value={selectedBrand}/>
   <fieldset className="p-form-step" data-step="0" hidden={step!==0}><legend className="sr-only">Your details</legend>
    <div className="field"><label htmlFor={id+'-name'}>Full name *</label><input id={id+'-name'} name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder="Your full name"/></div>
    <PhoneField id={id}/><EmailField id={id}/>
   </fieldset>
   <fieldset className="p-form-step" data-step="1" hidden={step!==1}><legend className="sr-only">{journey==='brand'?'Your business':'Your preferences'}</legend>
    {!embedded&&(journey==='investor'?<div className="field"><label htmlFor={id+'-brand'}>Brand of interest</label><select id={id+'-brand'} name="brand" value={brand} onChange={e=>setBrand(e.target.value)}><option value="">Help me explore</option>{brands.map(b=><option key={b.slug} value={b.slug}>{b.name}</option>)}</select></div>:<div className="field-row"><div className="field"><label htmlFor={id+'-company'}>Brand name *</label><input id={id+'-company'} name="company_name" required minLength={2} maxLength={120} value={company} onChange={e=>setCompany(e.target.value)} placeholder="Business name" autoComplete="organization"/></div><div className="field"><label htmlFor={id+'-company-site'}>Website</label><input id={id+'-company-site'} name="company_website" type="url" maxLength={500} value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://" autoComplete="url"/></div></div>)}
    <div className="field-row"><div className="field"><label htmlFor={id+'-state'}>{journey==='brand'?'State / UT':'Preferred state / UT'} *</label><select id={id+'-state'} name="state" required defaultValue="" autoComplete="address-level1"><option value="" disabled>Select state / UT</option>{indianStates.map(s=><option key={s}>{s}</option>)}</select></div><div className="field"><label htmlFor={id+'-city'}>{journey==='brand'?'City':'Preferred city'} *</label><input id={id+'-city'} name="city" required minLength={2} maxLength={70} autoComplete="address-level2" placeholder="City"/></div></div>
    <div className="field-row">{journey==='investor'&&budgetField}{timingField}</div>
    <label className="checkbox-label"><input type="checkbox" name="contactPermission" required/><span>{info?.notice||'I agree to be contacted about this enquiry.'} <a href="/privacy-and-terms#privacy" target="_blank" rel="noreferrer">Privacy policy</a></span></label><div ref={widget}/>
   </fieldset>
   <div className="honeypot" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
   <div className="p-form-actions">{step===1&&<button className="p-form-back" type="button" onClick={()=>{setStep(0);setMessage('')}}><ArrowLeft size={18}/>Back</button>}<button className="p-button" type="submit" disabled={!ready||busy||(step===1&&info?.accepting&&!challenge)}>{step===0?'Continue':busy?'Sending…':info?.accepting?'Send enquiry':'Review enquiry'}<ArrowRight size={18}/></button></div>
   {(!journeyConfig.intakeEnabled||info&&!info.accepting)&&<p className="p-form-status">Online enquiries are currently paused.</p>}
   {message&&<p className={'form-message'+(error?' error':'')} role={error?'alert':'status'}>{message}</p>}
  </form>
 </div>;
}
