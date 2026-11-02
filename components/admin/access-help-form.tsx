'use client';
import {useState} from 'react';
export function AccessHelpForm(){
 const [email,setEmail]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 return <form onSubmit={async event=>{
   event.preventDefault();setBusy(true);setMessage('');
   try{const result=await fetch('/api/cms/access-help',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});const data=await result.json() as {message?:string;error?:string};setMessage(data.message||data.error||'Please try again.');}
   catch{setMessage('Unable to connect. Please try again.');}finally{setBusy(false);}
 }}><div className="cms-access-field"><label htmlFor="recovery-email">Work email</label><input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event=>setEmail(event.target.value)}/></div>{message&&<p role="status" className="cms-access-lede">{message}</p>}<button className="cms-button cms-primary cms-access-action" disabled={busy}>{busy?'Requesting…':'Email access guidance'}</button></form>;
}
