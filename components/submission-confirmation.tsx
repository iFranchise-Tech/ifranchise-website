'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {Check,ArrowLeft,ArrowUpRight} from 'lucide-react';
import {hasRecentConfirmation,confirmationReturn} from '../lib/intake/confirmation.mjs';
export function SubmissionConfirmation(){
 const router=useRouter(),[confirmed,setConfirmed]=useState<boolean|null>(null),[origin,setOrigin]=useState<{path:string;y:number}|null>(null);
 useEffect(()=>{try{setConfirmed(hasRecentConfirmation(sessionStorage));setOrigin(confirmationReturn(sessionStorage))}catch{setConfirmed(false)}},[]);
 function goBack(){if(!origin)return;try{sessionStorage.setItem('ifranchise-restore-position',JSON.stringify(origin))}catch{}router.push(origin.path,{scroll:false})}
 return <main id="main" className="p-page submission-confirmation"><section aria-labelledby="confirmation-title" className="confirmation-card">
  <div className="submission-check" aria-hidden="true"><Check size={30}/></div>
  <p className="p-eyebrow">{confirmed?'Successfully submitted':'iFranchise'}</p>
  <h1 id="confirmation-title">{confirmed===null?'Thank you':confirmed?'You’re all set.':'Let’s take the next step.'}</h1>
  <p role="status">{confirmed?'Thank you for getting in touch. Your details have reached our team.':'Use one of our forms to share what you have in mind.'}</p>
  {confirmed&&<div className="confirmation-next"><span>What happens next</span><p>We’ll review your submission and contact you where a response is needed. There’s no need to send it again.</p></div>}
  {origin?<button className="p-button" onClick={goBack}><ArrowLeft size={18} aria-hidden="true"/><span>Back to where you left off</span></button>:<a href="/contact-us" className="p-button">Contact our team<ArrowUpRight size={18}/></a>}
 </section></main>
}
