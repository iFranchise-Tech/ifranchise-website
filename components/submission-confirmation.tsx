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
 return <main id="main" className="p-page submission-confirmation"><section aria-labelledby="confirmation-title" className="confirmation-card" aria-busy={confirmed===null} data-confirmed={confirmed===true}>
  <div className={`submission-check${confirmed?' submission-check-success':''}`} aria-hidden="true">{confirmed?<Check size={34} strokeWidth={2.5}/>:<ArrowUpRight size={30}/>}</div>
  <h1 id="confirmation-title">{confirmed===null?'iFranchise':confirmed?'Thank you!':'Let’s take the next step.'}</h1>
  <p role="status">{confirmed===null?'Checking your submission confirmation…':confirmed?(job?'Your application has been received. Our hiring team will review it and get in touch about the next steps.':privacy?'Your privacy request has been received. We’ll review it and contact you if we need more information.':'Your enquiry has been received. Our team will review it and get in touch.'): 'Share what you have in mind. Our team is here to help.'}</p>
  {origin?<button className="p-button" onClick={goBack}><ArrowLeft size={18} aria-hidden="true"/><span>{job?'Back to role':origin.path.startsWith('/franchise/')?'Back to opportunity':'Back to website'}</span></button>:<Link href="/franchise-opportunities" className="p-button">Explore opportunities<ArrowUpRight size={18}/></Link>}
 </section></main>;
}
