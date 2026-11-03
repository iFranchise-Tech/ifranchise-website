'use client';
import {useEffect,useState} from 'react';
import {BrandIdentity} from '../brand-identity';
import {cmsRequest} from '../../lib/cms/client.mjs';
import {safeAdminReturnPath} from '../../lib/cms/routes.mjs';

export function SessionBoundary({children,email,version}:{children:React.ReactNode;email:string;version:number}){
  const [failure,setFailure]=useState<{message:string;status:number}|null>(null),[warning,setWarning]=useState('');
  useEffect(()=>{
    const lost=(event:Event)=>setFailure((event as CustomEvent).detail);
    window.addEventListener('cms:access-lost',lost);
    return()=>window.removeEventListener('cms:access-lost',lost);
  },[]);
  useEffect(()=>{
    if(failure)return;
    let pending=false,lastChecked=Date.now();const controller=new AbortController();
    async function check(){
      if(pending||document.visibilityState!=='visible'||Date.now()-lastChecked<15000)return;
      pending=true;lastChecked=Date.now();
      try{
        const current=await cmsRequest('/api/admin/session',{signal:controller.signal});
        if(!controller.signal.aborted)setWarning('');
        if(!controller.signal.aborted&&(current.email!==email||current.version!==version))setFailure({status:409,message:'Your CMS access has changed. Reopen this page to load your current permissions.'});
      }catch(error){if(!controller.signal.aborted)setWarning(error instanceof Error?error.message:'Unable to verify your session. Please check your connection.');}
      finally{pending=false;}
    }
    const timer=window.setInterval(check,60000);
    window.addEventListener('focus',check);document.addEventListener('visibilitychange',check);
    return()=>{controller.abort();clearInterval(timer);window.removeEventListener('focus',check);document.removeEventListener('visibilitychange',check);};
  },[email,version,failure]);
  if(!failure)return <>{children}{warning&&<div className="cms-root"><div className="cms-session-warning" role="status">{warning} Session verification will retry automatically.</div></div>}</>;
  return <div className="cms-root"><main className="cms-access"><section aria-labelledby="session-heading">
    <BrandIdentity linked={false}/>
    <h1 id="session-heading">{failure.status===401?'Sign in to continue':failure.status===409?'Access updated':'Access unavailable'}</h1>
    <p className="cms-access-lede" role="alert">{failure.message}</p>
    <p className="cms-access-lede">Any changes not saved before this message have not been submitted.</p>
    <button className="cms-button cms-primary cms-access-action" onClick={()=>location.assign(safeAdminReturnPath(location.pathname+location.search))}>{failure.status===401?'Sign in again':'Reopen this page'}</button>
    <a className="cms-access-help" href="mailto:it@ifranchise.in">Contact the IT team</a>
  </section></main></div>;
}
