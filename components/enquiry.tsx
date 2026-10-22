'use client';
import {PhoneField,EmailField} from './contact-fields';
import {useEffect,useRef,useState} from 'react';
import {budgetOptions,timeframeOptions} from '../lib/journey-client.mjs';
import {ArrowRight,ArrowLeft,Check} from 'lucide-react';
import {LocationFields,IntakeConsent,useIntake,readReceipt} from './intake-fields';
export function EnquiryForm({brandSlug,items=[],journeyType}:{brandSlug?:string;items?:any[];journeyType?:'brand'|'investor'}){
 const listing=items.find(b=>b.slug===brandSlug),embedded=Boolean(listing),id='enquiry-'+(listing?.slug||'contact');
 const [journey,setJourney]=useState<'brand'|'investor'>(journeyType||'investor'),[brand,setBrand]=useState(listing?.slug||''),[step,setStep]=useState(0),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[receipt,setReceipt]=useState<any>(null);
 const form=useRef<HTMLFormElement>(null),previousStep=useRef(0),intake=useIntake();
 useEffect(()=>{if(!listing){const q=new URLSearchParams(location.search);if(!journeyType&&q.get('journey')==='brand')setJourney('brand');if(items.some(b=>b.slug===q.get('brand')))setBrand(q.get('brand')!)}},[]);
 useEffect(()=>{if(previousStep.current===step)return;previousStep.current=step;form.current?.closest('.p-enquiry')?.scrollIntoView({block:'start',behavior:'auto'});form.current?.querySelector<HTMLElement>('[data-step="'+step+'"] input:not([type="hidden"]),[data-step="'+step+'"] select,[data-step="'+step+'"] textarea')?.focus({preventScroll:true})},[step]);
 function validate(n:number){const invalid=(Array.from(form.current?.querySelectorAll('[data-step="'+n+'"] input,[data-step="'+n+'"] select,[data-step="'+n+'"] textarea')||[]) as unknown as Array<Pick<HTMLInputElement,'willValidate'|'checkValidity'|'reportValidity'>>).find(f=>f.willValidate&&!f.checkValidity());if(invalid){invalid.reportValidity();return false}return true}
 function next(){if(validate(0)){setStep(1);setMessage('')}}
 async function send(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(!step){next();return}if(!validate(0)){setStep(0);return}if(!validate(1))return;setBusy(true);setMessage('');try{const p={...await intake.payload(e.currentTarget,journey),brandSlug:listing?.slug||brand};const r=await fetch('/api/intake/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});setReceipt(await readReceipt(r));}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}
 if(receipt)return <div className="enquiry-card intake-success"><Check size={32}/><h2>Enquiry received.</h2><p role="status">Our team will get in touch with you.</p><small>Reference: {receipt.reference}</small>{message&&<p role="alert" className="form-message error">{message}</p>}<a className="text-link" href="/">Back to iFranchise →</a></div>;
 return <div className={'enquiry-card p-enquiry '+(embedded?'listing-enquiry':'contact-enquiry')} data-brand-slug={listing?.slug}>
 {!embedded&&!journeyType&&<div className="p-form-switch intake-switch" aria-label="Enquiry type">{([['investor','Explore a franchise'],['brand','Expand a business']] as const).map(([value,label])=><button key={value} type="button" aria-pressed={journey===value} onClick={()=>{setJourney(value);setStep(0);setMessage('')}}>{label}</button>)}</div>}
 {!embedded&&<div className="p-form-heading"><h2>{journey==='investor'?'Your franchise enquiry':'Your brand enquiry'}</h2><span>{step+1} / 2</span></div>}
 <div className="p-form-progress" aria-label="Enquiry steps"><button type="button" onClick={()=>setStep(0)} aria-current={step===0?'step':undefined}><span>{step>0?<Check size={14}/>:1}</span>Your details</button><i/><button type="button" onClick={next} aria-current={step===1?'step':undefined}><span>2</span>{journey==='brand'?'Your business':'Your preferences'}</button></div>
 <form ref={form} onSubmit={send} noValidate aria-label="Enquiry form">
 <fieldset className="p-form-step" data-step="0" hidden={step!==0}><legend className="sr-only">Your details</legend><div className="field"><label htmlFor={id+'-name'}>Full name *</label><input id={id+'-name'} name="name" autoComplete="name" required minLength={2} maxLength={120}/></div><PhoneField id={id}/><EmailField id={id}/></fieldset>
 <fieldset className="p-form-step" data-step="1" hidden={step!==1}><legend className="sr-only">Enquiry details</legend>
 {!embedded&&journey==='investor'&&<div className="field"><label htmlFor={id+'-brand'}>Brand of interest</label><select id={id+'-brand'} value={brand} onChange={e=>setBrand(e.target.value)}><option value="">Help me explore</option>{items.map(b=><option key={b.slug} value={b.slug}>{b.name}</option>)}</select></div>}
 {journey==='brand'&&<div className="field-row"><div className="field"><label htmlFor={id+'-company'}>Business name *</label><input id={id+'-company'} name="companyName" required minLength={2} maxLength={120} autoComplete="organization"/></div><div className="field"><label htmlFor={id+'-site'}>Business website</label><input id={id+'-site'} name="companyWebsite" type="url" maxLength={500} placeholder="https://" autoComplete="url"/></div></div>}
 <LocationFields id={id} preferred={journey==='investor'}/>
 <div className="field-row">{journey==='investor'&&<div className="field"><label htmlFor={id+'-budget'}>Investment range</label><select id={id+'-budget'} name="budget">{budgetOptions.map(v=><option key={v}>{v}</option>)}</select></div>}<div className="field"><label htmlFor={id+'-timeframe'}>{journey==='brand'?'Expansion timeframe':'When would you start?'}</label><select id={id+'-timeframe'} name="timeframe">{timeframeOptions.map(v=><option key={v}>{v}</option>)}</select></div></div>
 <IntakeConsent/>
 </fieldset><div className="p-form-actions">{step===1&&<button className="p-form-back" type="button" onClick={()=>setStep(0)}><ArrowLeft size={18}/>Back</button>}<button className="p-button" type="submit" disabled={!intake.ready||busy}>{step===0?'Continue':busy?'Sending…':'Send enquiry'}<ArrowRight size={18}/></button></div>{message&&<p className="form-message error" role="alert">{message}</p>}
 </form></div>;
}
