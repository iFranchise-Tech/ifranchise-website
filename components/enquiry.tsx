'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {brands} from '../lib/site';
import {validateContact} from '../lib/enquiry.mjs';
import {journeyConfig,createJourneyClient,budgetOptions,timeframeOptions} from '../lib/journey-client.mjs';
import {readConsent,getAttribution,track,trackReceipt} from '../lib/measurement.mjs';
import {Icon} from './icons';
import {indianStates} from '../lib/locations.mjs';
export function EnquiryForm({brandSlug}:{brandSlug?:string}){
 const listing=brands.find(b=>b.slug===brandSlug),embedded=Boolean(listing),id=useId();
 const [journey,setJourney]=useState('investor'),[step,setStep]=useState(embedded?2:1),[brand,setBrand]=useState(listing?.slug||''),[company,setCompany]=useState(''),[website,setWebsite]=useState(''),[budget,setBudget]=useState('Exploring'),[timeframe,setTimeframe]=useState('Exploring'),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(false),[receipt,setReceipt]=useState(false),[info,setInfo]=useState<any>(null),[challenge,setChallenge]=useState(''),[ready,setReady]=useState(false);
 const client=useRef<any>(null),widget=useRef<HTMLDivElement>(null);
 const selectedBrand=listing?.slug||brand;
 useEffect(()=>{setReady(true);if(listing)return;const q=new URLSearchParams(location.search);setJourney(q.get('journey')==='brand'?'brand':'investor');if(brands.some(b=>b.slug===q.get('brand')))setBrand(q.get('brand')!);},[listing]);
 useEffect(()=>{
  if(step!==2||!journeyConfig.connected)return;
  let disposed=false,widgetId:any;setInfo(null);setChallenge('');if(journeyConfig.intakeEnabled)setBusy(true);client.current=null;
  const connection=createJourneyClient({journey});
  async function init(){try{
   const f=await connection.initialize();if(disposed)return;setInfo(f);client.current=connection;if(!f.accepting)return;
   const render=()=>{if(disposed||!widget.current)return;widgetId=(window as any).turnstile.render(widget.current,{sitekey:f.site_key,action:'crm_enquiry',callback:(token:string)=>setChallenge(token),'expired-callback':()=>setChallenge(''),'error-callback':()=>{setChallenge('');setError(true);setMessage('Verification is unavailable. Please reload or contact us.');}});};
   if((window as any).turnstile)render();else{const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.onload=render;script.onerror=()=>{if(!disposed){setError(true);setMessage('Verification could not load. Please contact us.');}};document.head.appendChild(script);}
  }catch(e){if(!disposed&&journeyConfig.intakeEnabled){setError(true);setMessage((e as Error).message);}}finally{if(!disposed)setBusy(false);}}
  init();return()=>{disposed=true;if(widgetId!==undefined)(window as any).turnstile?.remove(widgetId);};
 },[step,journey]);
 function next(e:React.FormEvent){e.preventDefault();setMessage('');setError(false);setStep(2);track(window,'ifranchise_form_start',{journey,brand_slug:selectedBrand});}
 async function send(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setMessage('');setError(false);const fd=new FormData(e.currentTarget);
  try{
   const contact=validateContact({name:fd.get('name'),phone:fd.get('phone'),email:fd.get('email'),city:fd.get('city'),state:fd.get('state'),website:fd.get('website'),contactPermission:fd.get('contactPermission')==='on'});
   if(!journeyConfig.intakeEnabled||!info?.accepting){setMessage((listing?'Your '+listing.name+' enquiry is ready to review. ':'Your enquiry is ready to review. ')+'Online intake is off. Nothing has been sent or saved to the CRM. You can contact iFranchise by phone or WhatsApp.');return;}
   setBusy(true);const result=await client.current.submit({contact,interestSlug:selectedBrand,companyName:company,companyWebsite:website,budget:journey==='investor'?budget:'Exploring',timeframe,challenge,source:getAttribution(window,readConsent(localStorage))});
   if(journeyConfig.conversionSending)trackReceipt(window,result,info.form_id);setReceipt(true);setMessage(result.message);
  }catch(e){setError(true);setMessage((e as Error).message);}finally{setBusy(false);}
 }
 const budgetField=<div className="field"><label htmlFor={id+'-budget'}>Investment range</label><select id={id+'-budget'} name="budget" value={budget} onChange={e=>setBudget(e.target.value)}>{budgetOptions.map(v=><option key={v}>{v}</option>)}</select></div>;
 const timingField=<div className="field"><label htmlFor={id+'-timeframe'}>{embedded?'When would you start?':'When are you looking to '+(journey==='brand'?'expand':'start')+'?'}</label><select id={id+'-timeframe'} name="timeframe" value={timeframe} onChange={e=>setTimeframe(e.target.value)}>{timeframeOptions.map(v=><option key={v}>{v}</option>)}</select></div>;
 if(receipt)return <div className="enquiry-card"><h2>Thank you for your enquiry.</h2><p role="status">{message}</p><a className="text-link" href="/">Back to iFranchise →</a></div>;
 return <div className={'enquiry-card'+(embedded?' listing-enquiry':'')} data-brand-slug={listing?.slug}>
  {embedded?<div className="listing-form-heading"><span className="enquiry-context">{listing!.name}</span><h2 id={id+'-heading'}>Request franchise details</h2><p>Share your preferred location and investment range with iFranchise.</p></div>:<><div className="form-toggle" aria-label="Enquiry type">{[['investor','I’m an investor'],['brand','I represent a brand']].map(([v,label])=><button key={v} aria-pressed={journey===v} onClick={()=>{setJourney(v);setStep(1);setMessage('');setError(false);}}>{label}</button>)}</div><p className="form-progress">STEP {step} OF 2 · {step===1?'YOUR INTEREST':'YOUR DETAILS'}</p><h2>{step===1?'What would you like help with?':'How can we reach you?'}</h2></>}
  <p className="paused-status">{embedded?'Preview form · Online enquiries are paused.':'Online enquiries are paused. You can explore the form; your contact details stay in this page.'}</p>
  {step===1?<form onSubmit={next}>
   {journey==='investor'?<><div className="field"><label htmlFor={id+'-brand'}>Which brand are you exploring?</label><select id={id+'-brand'} value={brand} onChange={e=>setBrand(e.target.value)}><option value="">I’d like help exploring</option>{brands.map(b=><option key={b.slug} value={b.slug}>{b.name}</option>)}</select></div>{budgetField}</>:<><div className="field"><label htmlFor={id+'-company'}>Brand name *</label><input id={id+'-company'} required maxLength={120} value={company} onChange={e=>setCompany(e.target.value)} placeholder="Your brand" autoComplete="organization"/></div><div className="field"><label htmlFor={id+'-company-site'}>Brand website</label><input id={id+'-company-site'} type="url" maxLength={500} value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://" autoComplete="url"/></div></>}
   {timingField}<div className="form-actions"><button className="button" type="submit" disabled={!ready}>Continue →</button></div>
  </form>:<form onSubmit={send} aria-label={listing?listing.name+' franchise enquiry':'Your contact details'}>
   <input type="hidden" name="interest_slug" value={selectedBrand}/>
   {journey==='brand'&&<p className="muted">Brand: {company}</p>}
   <div className={embedded?'field-row':''}><div className="field"><label htmlFor={id+'-name'}>Full name *</label><input id={id+'-name'} name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder="Your name"/></div><div className="field"><label htmlFor={id+'-phone'}>Mobile number *</label><input id={id+'-phone'} name="phone" type="tel" autoComplete="tel" required placeholder="+91" maxLength={20}/></div></div>
   <div className="field"><label htmlFor={id+'-email'}>Email address</label><input id={id+'-email'} name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com"/></div>
   <div className="field-row"><div className="field"><label htmlFor={id+'-state'}>{journey==='brand'?'State / UT':'Preferred state / UT'} *</label><select id={id+'-state'} name="state" required defaultValue="" autoComplete="address-level1"><option value="" disabled>Select state / UT</option>{indianStates.map(s=><option key={s}>{s}</option>)}</select></div><div className="field"><label htmlFor={id+'-city'}>{journey==='brand'?'Your city':'Preferred city'} *</label><input id={id+'-city'} name="city" required minLength={2} maxLength={70} autoComplete="address-level2" placeholder="e.g. Bengaluru"/></div></div>
   {embedded&&<div className="field-row">{budgetField}{timingField}</div>}
   <div className="honeypot" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
   <label className="checkbox-label"><input type="checkbox" name="contactPermission" required/><span>{info?.notice||'I agree to be contacted by iFranchise about this enquiry.'} <a href="/privacy-policy" target="_blank" rel="noreferrer">Privacy notice ↗</a></span></label><div ref={widget}/>
   <div className="form-actions">{!embedded&&<button type="button" className="button outline" onClick={()=>{setStep(1);setMessage('');}}>Back</button>}<button className="button" type="submit" disabled={!ready||busy||(info?.accepting&&!challenge)}>{busy?'Checking connection…':info?.accepting?'Send enquiry':'Review enquiry'}<Icon name="arrow"/></button></div>
   {embedded&&<p className="form-local-note">Review only. Your details stay in this page.</p>}
   {message&&<p className={'form-message'+(error?' error':'')} role={error?'alert':'status'}>{message}</p>}
   {info&&!info.accepting&&<p className="preview-note" role="status">CRM connection verified · Enquiry receiving Off · Advertising conversion sending Off.</p>}
  </form>}
 </div>;
}
