'use client';
import {useEffect,useState} from 'react';
import {Check,Home} from 'lucide-react';
import {hasRecentConfirmation} from '../lib/intake/confirmation.mjs';
export function SubmissionConfirmation(){
 const [confirmed,setConfirmed]=useState<boolean|null>(null);
 useEffect(()=>{try{setConfirmed(hasRecentConfirmation(sessionStorage))}catch{setConfirmed(false)}},[]);
 return <main id="main" className="p-page submission-confirmation"><section aria-labelledby="confirmation-title">
  <div className="submission-check" aria-hidden="true">{confirmed?<Check size={36}/>:<Home size={32}/>}</div>
  <p className="p-eyebrow">{confirmed===null?'':confirmed?'Application received':'iFranchise'}</p>
  <h1 id="confirmation-title">{confirmed===null?'Thank you':confirmed?'Thank You for Reaching Out':'Thank you for visiting'}</h1>
  <p role="status">{confirmed?'We’ve received your submission. Our team will review the details and get in touch where a response is needed.':'Explore iFranchise or use one of our forms to get in touch.'}</p>
  <a href="/" className="p-button"><Home size={18} aria-hidden="true"/>Home</a>
 </section></main>
}
