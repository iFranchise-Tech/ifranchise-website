'use client';
import {useEffect,useRef,useState} from 'react';
import {brands} from '../lib/site';
import {validateContact} from '../lib/enquiry.mjs';
import {journeyConfig,createJourneyClient,budgetOptions,timeframeOptions} from '../lib/journey-client.mjs';
import {readConsent,getAttribution,track,trackReceipt} from '../lib/measurement.mjs';
import {Icon} from './icons';
import {indianStates} from '../lib/locations.mjs';
export function EnquiryForm({brandSlug}:{brandSlug?:string}){
 const listing=brands.find(b=>b.slug===brandSlug),embedded=Boolean(listing),id='enquiry-'+(listing?.slug||'contact');
 const [journey,setJourney]=useState('investor'),[brand,setBrand]=useState(listing?.slug||''),[company,setCompany]=useState(''),[website,setWebsite]=useState(''),[budget,setBudget]=useState('Exploring'),[timeframe,setTimeframe]=useState('Exploring'),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(false),[receipt,setReceipt]=useState(false),[info,setInfo]=useState<any>(null),[challenge,setChallenge]=useState(''),[ready,setReady]=useState(false);
 const client=useRef<any>(null),widget=useRef<HTMLDivElement>(null),started=useRef(false);
 const selectedBrand=listing?.slug||brand;
 useEffect(()=>{if(!listing){const q=new URLSearchParams(location.search);setJourney(q.get('journey')==='brand'?'brand':'investor');if(brands.some(b=>b.slug===q.get('brand')))setBrand(q.get('brand')!);}setReady(true);},[listing]);
 useEffect(()=>{
  if(!ready||!journeyConfig.connected)return;
  let disposed=false,widgetId:any;setInfo(null);setChallenge('');if(journeyConfig.intakeEnabled)setBusy(true);client.current=null;
  const connection=createJourneyClient({journey});
  async function init(){try{
   const f=await connection.initialize();if(disposed)return;setInfo(f);client.current=connection;if(!f.accepting)return;
   const render=()=>{if(disposed||!widget.current)return;widgetId=(window as any).turnstile.render(widget.current,{sitekey:f.site_key,action:'crm_enquiry',callback:(token:string)=>setChallenge(token),'expired-callback':()=>setChallenge(''),'error-callback':()=>{setChallenge('');setError(true);setMessage('Verification is unavailable. Please reload or contact us.');}});};
   if((window as any).turnstile)render();else{const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.onload=render;script.onerror=()=>{if(!disposed){setError(true);setMessage('Verification could not load. Please contact us.');}};document.head.appendChild(script);}
  }catch(e){if(!disposed&&journeyConfig.intakeEnabled){setError(true);setMessage((e as Error).message);}}finally{if(!disposed)setBusy(false);}}
  init();return()=>{disposed=true;if(widgetId!==undefined)(window as any).turnstile?.remove(widgetId);};
 },[ready,journey]);
 function chooseJourney(value:string){setJourney(value);setMessage('');setError(false);setInfo(null);setChallenge('');started.current=false;const url=new URL(location.href);url.searchParams.set('journey',value);history.replaceState(history.state,'',url.pathname+url.search+url.hash);}
 async function send(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setMessage('');setError(false);const fd=new FormData(e.currentTarget);
  try{
   const contact=validateContact({name:fd.get('name'),phone:fd.get('phone'),email:fd.get('email'),city:fd.get('city'),state:fd.get('state'),website:fd.get('website'),contactPermission:fd.get('contactPermission')==='on'});
   if(journey==='brand'&&company.trim().length<2)throw Error('Enter your brand name.');
   if(!journeyConfig.intakeEnabled||!info?.accepting){setMessage((listing?'Your '+listing.name+' enquiry is ready to review. ':'Your enquiry is ready to review. ')+'Online intake is off. Nothing has been sent or saved to the CRM. You can contact us by phone or WhatsApp.');return;}
   setBusy(true);const result=await client.current.submit({contact,interestSlug:selectedBrand,companyName:company.trim(),companyWebsite:website,budget:journey==='investor'?budget:'Exploring',timeframe,challenge,source:getAttribution(window,readConsent(localStorage))});
   if(journeyConfig.conversionSending)trackReceipt(window,result,info.form_id);setReceipt(true);setMessage(result.message);
  }catch(e){setError(true);setMessage((e as Error).message);}finally{setBusy(false);}
 }
 const budgetField=<div className="field"><label htmlFor={id+'-budget'}>Investment range</label><select id={id+'-budget'} name="budget" value={budget} onChange={e=>setBudget(e.target.value)}>{budgetOptions.map(v=><option key={v}>{v}</option>)}</select></div>;
 const timingField=<div className="field"><label htmlFor={id+'-timeframe'}>{journey==='brand'?'Expansion timeframe':'When would you start?'}</label><select id={id+'-timeframe'} name="timeframe" value={timeframe} onChange={e=>setTimeframe(e.target.value)}>{timeframeOptions.map(v=><option key={v}>{v}</option>)}</select></div>;
 if(receipt)return <div className="enquiry-card"><h2>Thank you for your enquiry.</h2><p role="status">{message}</p><a className="text-link" href="/">Back to iFranchise →</a></div>;
 return <div className={'enquiry-card '+(embedded?'listing-enquiry':'contact-enquiry')} data-brand-slug={listing?.slug}>
  {!embedded&&<div className="form-toggle" aria-label="Enquiry type">{[['investor','Investor enquiry'],['brand','Brand enquiry']].map(([value,label])=><button key={value} type="button" aria-pressed={journey===value} onClick={()=>chooseJourney(value)}>{label}</button>)}</div>}
  <div className={embedded?'listing-form-heading':'contact-form-heading'}>{embedded&&<span className="enquiry-context">{listing!.name}</span>}<h2 id={id+'-heading'}>{embedded?'Request franchise details':journey==='investor'?'Explore a franchise investment':'Discuss your brand'}</h2><p>{journey==='investor'?'Tell us where you’d like to open and the investment range you’re considering.':'Tell us about your business and when you are looking to expand.'}</p></div>
  {(!journeyConfig.intakeEnabled||info&&!info.accepting)&&<p className="paused-status">Preview form · Online enquiries are paused.</p>}
  <form onSubmit={send} aria-label={listing?listing.name+' franchise enquiry':journey==='investor'?'Investor enquiry':'Brand enquiry'} onFocus={()=>{if(!started.current){started.current=true;track(window,'ifranchise_form_start',{journey,brand_slug:selectedBrand});}}}>
   <input type="hidden" name="interest_slug" value={selectedBrand}/>
   {!embedded&&<fieldset className="enquiry-fieldset"><legend>{journey==='investor'?'Your franchise preferences':'Your business'}</legend>{journey==='investor'?<><div className="field"><label htmlFor={id+'-brand'}>Brand of interest</label><select id={id+'-brand'} name="brand" value={brand} onChange={e=>setBrand(e.target.value)}><option value="">I’d like help exploring</option>{brands.map(b=><option key={b.slug} value={b.slug}>{b.name}</option>)}</select></div><div className="field-row">{budgetField}{timingField}</div></>:<><div className="field-row"><div className="field"><label htmlFor={id+'-company'}>Brand name *</label><input id={id+'-company'} name="company_name" required minLength={2} maxLength={120} value={company} onChange={e=>setCompany(e.target.value)} placeholder="Your brand" autoComplete="organization"/></div><div className="field"><label htmlFor={id+'-company-site'}>Brand website</label><input id={id+'-company-site'} name="company_website" type="url" maxLength={500} value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://" autoComplete="url"/></div></div>{timingField}</>}</fieldset>}
   <fieldset className="enquiry-fieldset contact-fields">{!embedded&&<legend>Contact & location</legend>}
    <div className="field-row"><div className="field"><label htmlFor={id+'-name'}>Full name *</label><input id={id+'-name'} name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder="Your name"/></div><div className="field"><label htmlFor={id+'-phone'}>Mobile number *</label><input id={id+'-phone'} name="phone" type="tel" autoComplete="tel" required placeholder="+91" maxLength={20}/></div></div>
    <div className="field"><label htmlFor={id+'-email'}>Email address</label><input id={id+'-email'} name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com"/></div>
    <div className="field-row"><div className="field"><label htmlFor={id+'-state'}>{journey==='brand'?'State / UT':'Preferred state / UT'} *</label><select id={id+'-state'} name="state" required defaultValue="" autoComplete="address-level1"><option value="" disabled>Select state / UT</option>{indianStates.map(s=><option key={s}>{s}</option>)}</select></div><div className="field"><label htmlFor={id+'-city'}>{journey==='brand'?'Your city':'Preferred city'} *</label><input id={id+'-city'} name="city" required minLength={2} maxLength={70} autoComplete="address-level2" placeholder="Enter your city"/></div></div>
    {embedded&&<div className="field-row">{budgetField}{timingField}</div>}
   </fieldset>
   <div className="honeypot" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
   <label className="checkbox-label"><input type="checkbox" name="contactPermission" required/><span>{info?.notice||'I agree to be contacted by iFranchise about this enquiry.'} <a href="/privacy-policy" target="_blank" rel="noreferrer">Privacy notice ↗</a></span></label><div ref={widget}/>
   <div className="form-actions"><button className="button" type="submit" disabled={!ready||busy||(info?.accepting&&!challenge)}>{busy?'Checking connection…':info?.accepting?'Send enquiry':'Review enquiry'}<Icon name="arrow"/></button></div>
   {!info?.accepting&&<p className="form-local-note">Review only. Your details stay in this page.</p>}
   {message&&<p className={'form-message'+(error?' error':'')} role={error?'alert':'status'}>{message}</p>}
  </form>
 </div>;
}
