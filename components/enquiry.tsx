'use client';
import {showConfirmation} from '../lib/intake/confirmation.mjs';
import {PhoneField,EmailField,NameField,validatePhoneFields} from './contact-fields';
import {useEffect,useRef,useState} from 'react';
import {budgetOptions,timeframeOptions} from '../lib/journey-client.mjs';
import {ArrowRight,ArrowLeft,Check} from 'lucide-react';
import {LocationFields,IntakeConsent,useIntake,readReceipt} from './intake-fields';
export function EnquiryForm({brandSlug,items=[],journeyType,compact=false}:{compact?:boolean;brandSlug?:string;items?:any[];journeyType?:'brand'|'investor'}){
 const listing=items.find(b=>b.slug===brandSlug),embedded=Boolean(listing),id='enquiry-'+(listing?.slug||'contact');
 const [journey,setJourney]=useState<'brand'|'investor'>(journeyType||'investor'),[brand,setBrand]=useState(listing?.slug||''),[step,setStep]=useState(0),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const form=useRef<HTMLFormElement>(null),previousStep=useRef(0),sending=useRef(false),intake=useIntake();
 useEffect(()=>{if(!listing){const q=new URLSearchParams(location.search);if(!journeyType&&q.get('journey')==='brand')setJourney('brand');if(items.some(b=>b.slug===q.get('brand')))setBrand(q.get('brand')!)}},[]);
 useEffect(()=>{if(previousStep.current===step)return;previousStep.current=step;!compact&&form.current?.closest('.p-enquiry')?.scrollIntoView({block:'start',behavior:'auto'});form.current?.querySelector<HTMLElement>('[data-step="'+step+'"] legend')?.focus({preventScroll:true})},[step]);
 function validate(n:number){if(form.current)validatePhoneFields(form.current);const invalid=(Array.from(form.current?.querySelectorAll('[data-step="'+n+'"] input,[data-step="'+n+'"] select,[data-step="'+n+'"] textarea')||[]) as unknown as Array<Pick<HTMLInputElement,'willValidate'|'checkValidity'|'reportValidity'>>).find(f=>f.willValidate&&!f.checkValidity());if(invalid){invalid.reportValidity();return false}return true}
 function next(){if(validate(0)){setStep(1);setMessage('')}}
 async function send(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(sending.current)return;if(!step){next();return}if(!validate(0)){setStep(0);return}if(!validate(1))return;sending.current=true;setBusy(true);setMessage('');let redirecting=false;try{const p={...await intake.payload(e.currentTarget,journey),brandSlug:listing?.slug||brand};const r=await fetch('/api/intake/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p),signal:AbortSignal.timeout(30000)});await readReceipt(r);redirecting=true;showConfirmation(window);}catch(e:any){redirecting=false;setMessage(e.name==='TimeoutError'||e.name==='AbortError'?'The request took too long. Your details are still here—please try again.':e instanceof TypeError?'We could not send your enquiry. Your details are still here—check your connection and try again.':e.message)}finally{if(!redirecting){sending.current=false;setBusy(false)}}}

 return <div className={'enquiry-card p-enquiry '+(embedded?'listing-enquiry':'contact-enquiry')} data-brand-slug={listing?.slug}>
 {!embedded&&!journeyType&&<div className="p-form-switch intake-switch" aria-label="Enquiry type">{([['investor','Explore a franchise'],['brand','Expand a business']] as const).map(([value,label])=><button key={value} type="button" aria-pressed={journey===value} disabled={busy} onClick={()=>{if(journey===value)return;previousStep.current=0;setJourney(value);setStep(0);setMessage('')}}>{label}</button>)}</div>}
 {!embedded&&<div className="p-form-heading"><h2>{journey==='investor'?'Your franchise enquiry':'Your brand enquiry'}</h2><span>{step+1} / 2</span></div>}
 <div className="p-form-progress" aria-label="Enquiry steps"><button type="button" onClick={()=>setStep(0)} aria-current={step===0?'step':undefined}><span>{step>0?<Check size={14}/>:1}</span>Your details</button><i/><button type="button" onClick={next} aria-current={step===1?'step':undefined}><span>2</span>{journey==='brand'?'Your business':'Your preferences'}</button></div>
 <form ref={form} onSubmit={send} noValidate aria-label="Enquiry form">
 <fieldset className="p-form-step" data-step="0" hidden={step!==0}><legend className="sr-only" tabIndex={-1}>Your details</legend><NameField id={id}/><PhoneField id={id}/><EmailField id={id}/></fieldset>
 <fieldset key={journey} className="p-form-step" data-step="1" hidden={step!==1}><legend className="sr-only" tabIndex={-1}>Enquiry details</legend>
 {!embedded&&journey==='investor'&&<div className="field"><label htmlFor={id+'-brand'}>Brand of interest</label><select id={id+'-brand'} value={brand} onChange={e=>setBrand(e.target.value)}><option value="">Help me explore</option>{items.map(b=><option key={b.slug} value={b.slug}>{b.name}</option>)}</select></div>}
 {journey==='brand'&&<div className="field-row"><div className="field"><label htmlFor={id+'-company'}>Business name *</label><input id={id+'-company'} name="companyName" required minLength={2} maxLength={120} autoComplete="organization"/></div><div className="field"><label htmlFor={id+'-site'}>Business website</label><input id={id+'-site'} name="companyWebsite" type="url" maxLength={500} placeholder="https://" autoComplete="url"/></div></div>}
 <LocationFields id={id} preferred={journey==='investor'}/>
 <div className="field-row">{journey==='investor'&&<div className="field"><label htmlFor={id+'-budget'}>Investment range</label><select id={id+'-budget'} name="budget">{budgetOptions.map(v=><option key={v}>{v}</option>)}</select></div>}<div className="field"><label htmlFor={id+'-timeframe'}>{journey==='brand'?'Expansion timeframe':'When would you start?'}</label><select id={id+'-timeframe'} name="timeframe" defaultValue="Just exploring">{timeframeOptions.map(v=><option key={v}>{v}</option>)}</select></div></div>
 <div className="field enquiry-message"><label htmlFor={id+'-message'}>Message (optional)</label><textarea id={id+'-message'} name="message" rows={3} maxLength={3000} placeholder="Tell us more about your plans or what you’d like to know."/></div>
 <IntakeConsent/>
 </fieldset><div className="p-form-actions">{step===1&&<button className="p-form-back" type="button" onClick={()=>setStep(0)}><ArrowLeft size={18}/>Back</button>}<button className="p-button" type="submit" disabled={!intake.ready||busy}>{step===0?'Continue':busy?'Sending…':'Send enquiry'}<ArrowRight size={18}/></button></div>{message&&<p className="form-message error" role="alert">{message}</p>}
 </form></div>;
}
