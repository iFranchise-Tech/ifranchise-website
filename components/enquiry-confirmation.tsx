'use client';
import {useEffect,useState} from 'react';
import {Check,ArrowUpRight} from 'lucide-react';
import {BrandLogo} from './brand-logo';
export function EnquiryConfirmation({brand}:{brand:any}){
 const [confirmed,setConfirmed]=useState(false);
 useEffect(()=>{try{const time=Number(sessionStorage.getItem('ifranchise-enquiry-confirmed:'+brand.slug));setConfirmed(time>0&&Date.now()-time<30*60*1000)}catch{}},[brand.slug]);
 return <main id="main" className="p-page enquiry-confirmation"><section className="enquiry-confirmation-card">
  <BrandLogo brand={brand}/>
  {confirmed&&<span className="enquiry-confirmation-icon"><Check aria-hidden="true" size={28}/></span>}
  <p className="p-eyebrow">{confirmed?'Enquiry received':'Franchise enquiries'}</p>
  <h1>{confirmed?'Thank you for your interest.':'Interested in '+brand.name+'?'}</h1>
  <p role="status">{confirmed?'Your enquiry about '+brand.name+' has been received. Our team will review your details and contact you to discuss the franchise opportunity.':'Visit the brand page to send an enquiry or explore the opportunity.'}</p>
  <a className="p-button" href={'/franchise/'+brand.slug}>Back to {brand.name}<ArrowUpRight size={18}/></a>
 </section></main>;
}
