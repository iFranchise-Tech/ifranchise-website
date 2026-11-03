'use client';
import {cmsRequest} from '../../lib/cms/client.mjs';
import {useEffect,useState} from 'react';
export function ActivateInvitation({email,loginUrl}:{email:string|null;loginUrl:string|null}) {
  const [token,setToken]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{
    const fragment=new URLSearchParams(location.hash.slice(1)).get('token');
    if(fragment&&/^[A-Za-z0-9_-]{43}$/.test(fragment)){
      setToken(fragment);
      try{sessionStorage.setItem('cms-invitation',fragment)}catch{setMessage('Keep this tab open to accept your invitation. If you need to sign in first, reopen your invitation link afterwards.')}
      history.replaceState(null,'',location.pathname);
    }else{try{setToken(sessionStorage.getItem('cms-invitation')||'')}catch{/* The full invitation link still works when browser storage is unavailable. */}}
  },[]);
  async function activate(){
    setBusy(true);setMessage('');
    try {
      await cmsRequest('/api/admin/invitations/accept',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});
      try{sessionStorage.removeItem('cms-invitation')}catch{/* Activation has succeeded; storage cleanup must not prevent entry. */}location.assign('/admin');
    } catch(error){setMessage(error instanceof Error?error.message:'Please try again.');setBusy(false);}
  }
  return <>
    <p className="cms-access-lede">{email?`Signed in as ${email}. Accept your invitation to activate your assigned CMS access.`:'Sign in with the work account that received this invitation. Your administrator controls your permissions.'}</p>
    {message&&<p className="cms-error" role="alert">{message}</p>}
    {!token?<p className="cms-access-lede">Open the full link in your invitation email to continue.</p>:email?<button className="cms-button cms-primary cms-access-action" onClick={activate} disabled={busy}>{busy?'Activating…':'Accept invitation'}</button>:loginUrl?<a className="cms-button cms-primary cms-access-action" href={loginUrl}>Continue with your work account</a>:<p className="cms-error">Work account sign-in is unavailable. Contact it@ifranchise.in.</p>}
    {email&&<a className="cms-access-home" href="/cdn-cgi/access/logout">Use a different work account</a>}
  </>;
}
