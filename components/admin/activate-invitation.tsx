'use client';
import {useEffect,useState} from 'react';
export function ActivateInvitation({email,loginUrl}:{email:string|null;loginUrl:string|null}) {
  const [token,setToken]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{
    const fragment=new URLSearchParams(location.hash.slice(1)).get('token');
    if(fragment&&/^[A-Za-z0-9_-]{43}$/.test(fragment)){sessionStorage.setItem('cms-invitation',fragment);history.replaceState(null,'',location.pathname);}
    setToken(sessionStorage.getItem('cms-invitation')||'');
  },[]);
  async function activate(){
    setBusy(true);setMessage('');
    try {
      const result=await fetch('/api/admin/invitations/accept',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});
      if(result.status===401)throw Error('Sign in with your work account, then return to this invitation.');
      const data=await result.json() as {error?:string};if(!result.ok)throw Error(data.error||'The invitation could not be accepted.');
      sessionStorage.removeItem('cms-invitation');location.assign('/admin');
    } catch(error){setMessage(error instanceof Error?error.message:'Please try again.');setBusy(false);}
  }
  return <>
    <p className="cms-access-lede">{email?`Signed in as ${email}. Accept your invitation to activate your assigned CMS access.`:'Sign in with the work account that received this invitation. Your administrator controls your permissions.'}</p>
    {message&&<p className="cms-error" role="alert">{message}</p>}
    {!token?<p className="cms-access-lede">Open the full link in your invitation email to continue.</p>:email?<button className="cms-button cms-primary cms-access-action" onClick={activate} disabled={busy}>{busy?'Activating…':'Accept invitation'}</button>:loginUrl?<a className="cms-button cms-primary cms-access-action" href={loginUrl}>Continue with your work account</a>:<p className="cms-error">Work account sign-in is unavailable. Contact it@ifranchise.in.</p>}
    {email&&<a className="cms-access-home" href="/cdn-cgi/access/logout">Use a different work account</a>}
  </>;
}
