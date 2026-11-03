'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Check,ArrowLeft,ArrowUpRight} from 'lucide-react';
import {hasRecentConfirmation,confirmationContext} from '../lib/intake/confirmation.mjs';
export function SubmissionConfirmation(){
 const router=useRouter(),[confirmed,setConfirmed]=useState<boolean|null>(null),[origin,setOrigin]=useState<{path:string;y:number;kind?:string}|null>(null);
 useEffect(()=>{let storage;try{storage=sessionStorage}catch{}const context=confirmationContext(storage);setConfirmed(!!context||hasRecentConfirmation(storage));setOrigin(context)},[]);
 function goBack(){if(!origin)return;try{sessionStorage.setItem('ifranchise-restore-position',JSON.stringify(origin))}catch{}router.push(origin.path,{scroll:false})}
 const job=origin?.kind==='job',privacy=origin?.kind==='privacy';
 return <main id="main" className="p-page submission-confirmation"><section aria-labelledby="confirmation-title" className="confirmation-card" aria-busy={confirmed===null}>
  <div className="submission-check" aria-hidden="true">{confirmed?<Check size={30} strokeWidth={2}/>:<ArrowUpRight size={30}/>}</div>
  <p className="p-eyebrow">{confirmed?'Successfully received':'iFranchise'}</p>
  <h1 id="confirmation-title">{confirmed?<>Thank you.<br/>We’ve received your {job?'application':privacy?'request':'enquiry'}.</>:'Let’s take the next step.'}</h1>
  <p role="status">{confirmed?(job?'Thank you for your interest in joining iFranchise.':privacy?'Your privacy request is with our team.':'Your plans matter to us. We’re glad you got in touch.'):'Share what you have in mind. Our team is here to help.'}</p>
  {confirmed&&<div className="confirmation-next"><span>What happens next</span><p>{privacy?'We’ll review your request and contact you if we need more information.':job?'Our hiring team will review your application and get in touch about the next steps.':'Our team will review your enquiry and get in touch to discuss the next steps.'}</p></div>}
  {origin?<button className="p-button" onClick={goBack}><ArrowLeft size={18} aria-hidden="true"/><span>{job?'Back to role':origin.path.startsWith('/franchise/')?'Back to opportunity':'Back to website'}</span></button>:<Link href="/franchise-opportunities" className="p-button">Explore opportunities<ArrowUpRight size={18}/></Link>}
  {confirmed&&<p className="confirmation-reassurance">Your details are saved. There’s no need to submit again.</p>}
 </section></main>;
}
