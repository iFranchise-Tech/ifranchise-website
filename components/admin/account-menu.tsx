'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {flushSync} from 'react-dom';
import {ChevronDown,LogOut} from 'lucide-react';

export function AccountMenu({name,email,role,localSession,dirty,onSignOut}:{name:string;email:string;role:string;localSession:boolean;dirty:boolean;onSignOut:()=>void}){
 const [open,setOpen]=useState(false),[confirming,setConfirming]=useState(false),[signingOut,setSigningOut]=useState(false),[error,setError]=useState('');
 const id=useId(),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),signOut=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLDialogElement>(null),cancel=useRef<HTMLButtonElement>(null);
 function closeMenu(){setOpen(false);trigger.current?.focus({preventScroll:true})}
 useEffect(()=>{if(!open)return;signOut.current?.focus();const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!root.current?.contains(event.target))setOpen(false)};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside)},[open]);
 useEffect(()=>{if(!confirming)return;const modal=dialog.current!;modal.showModal();cancel.current?.focus();return()=>{if(modal.open)modal.close()}},[confirming]);
 function closeConfirmation(){if(signingOut)return;dialog.current?.close();setConfirming(false);trigger.current?.focus({preventScroll:true})}
 async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(signingOut)return;const form=event.currentTarget;setError('');setSigningOut(true);
  if(localSession){
   try{
    // Fetch sends the same-origin POST with an Origin even when the portal's
    // no-referrer policy would give a navigational form an opaque Origin.
    const response=await fetch(form.action,{method:'POST',mode:'same-origin',credentials:'same-origin',redirect:'manual'});
    if(response.type!=='opaqueredirect')throw new Error('Sign-out was not confirmed');
   }catch{setSigningOut(false);setError('We couldn’t sign you out. Please try again. Your work is still open.');return}
  }
  // The confirmation explicitly covers unsaved edits. Unmount the editor and
  // its beforeunload guard before handing off to the existing logout endpoint.
  flushSync(()=>{onSignOut()});if(localSession)window.location.assign('/admin');else form.submit();
 }
 return <div className="cms-account" ref={root} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false)}}>
  <button ref={trigger} type="button" className="cms-account-trigger" aria-label={name+', '+role+', account menu'} aria-haspopup="menu" aria-expanded={open} aria-controls={id+'-menu'} onClick={()=>setOpen(!open)} onKeyDown={event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(open)signOut.current?.focus();else setOpen(true)}if(event.key==='Escape')closeMenu()}}>
   <span className="cms-account-avatar" aria-hidden="true">{name.slice(0,1)}</span><span className="cms-account-copy"><strong>{name}</strong><small>{role}</small></span><ChevronDown size={16} aria-hidden="true"/>
  </button>
  {open&&<div id={id+'-menu'} role="menu" aria-label="Account options" className="cms-account-dropdown" onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeMenu()}if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();signOut.current?.focus()}}}>
   <p className="cms-account-email" role="presentation">{email}</p>
   <button ref={signOut} type="button" role="menuitem" onClick={()=>{setError('');setOpen(false);setConfirming(true)}}><LogOut size={17} aria-hidden="true"/>Sign out</button>
  </div>}
  <dialog ref={dialog} className="cms-modal cms-confirm cms-account-confirm" aria-labelledby={id+'-title'} aria-describedby={id+'-description'} onCancel={event=>{event.preventDefault();closeConfirmation()}} onKeyDown={event=>{if(event.key!=='Tab')return;const buttons=[...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])')],first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}}>
   <form method={localSession?'post':'get'} action={localSession?'/api/admin/local-dev-logout':'/cdn-cgi/access/logout'} target={localSession?undefined:'_top'} onSubmit={submit}>
    <h2 id={id+'-title'}>Sign out of the CMS?</h2><p id={id+'-description'}>{dirty?'You have unsaved changes. Signing out will discard them.':'You’ll need to sign in again to access the CMS.'}</p>
    {error&&<p role="alert" className="cms-account-error">{error}</p>}
    <div className="cms-account-confirm-actions"><button ref={cancel} type="button" className="cms-button" disabled={signingOut} onClick={closeConfirmation}>Cancel</button><button type="submit" className="cms-button cms-primary" disabled={signingOut}>{signingOut?'Signing out…':'Sign out'}</button></div>
   </form>
  </dialog>
 </div>;
}
