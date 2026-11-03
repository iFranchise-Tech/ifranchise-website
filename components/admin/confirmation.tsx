'use client';
import {createContext,useContext,useEffect,useId,useRef,useState} from 'react';

type Confirmation={title:string;message:string;confirmLabel?:string};
const ConfirmationContext=createContext<((options:Confirmation)=>Promise<boolean>)|null>(null);
export function useConfirmation(){const confirm=useContext(ConfirmationContext);if(!confirm)throw new Error('Confirmation provider is missing.');return confirm;}
export function ConfirmationProvider({children}:{children:React.ReactNode}){
 const [pending,setPending]=useState<Confirmation|null>(null),dialog=useRef<HTMLDialogElement>(null),cancel=useRef<HTMLButtonElement>(null),resolve=useRef<((value:boolean)=>void)|null>(null),id=useId();
 function finish(value:boolean){dialog.current?.close();const done=resolve.current;resolve.current=null;setPending(null);done?.(value)}
 function confirm(options:Confirmation){if(resolve.current)return Promise.resolve(false);return new Promise<boolean>(done=>{resolve.current=done;setPending(options)})}
 useEffect(()=>{if(!pending)return;const previous=document.activeElement as HTMLElement,overflow=document.body.style.overflow,modal=dialog.current!;document.body.style.overflow='hidden';modal.showModal();cancel.current?.focus();return()=>{modal.close();document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus({preventScroll:true})}},[pending]);
 useEffect(()=>()=>{resolve.current?.(false);resolve.current=null},[]);
 return <ConfirmationContext.Provider value={confirm}>{children}<dialog ref={dialog} className="cms-modal cms-confirm" aria-labelledby={id+'-title'} aria-describedby={id+'-description'} onCancel={event=>{event.preventDefault();finish(false)}}>
  <h2 id={id+'-title'}>{pending?.title}</h2><p id={id+'-description'}>{pending?.message}</p><div className="cms-dialog-actions"><button ref={cancel} type="button" className="cms-button" onClick={()=>finish(false)}>Cancel</button><button type="button" className="cms-button cms-primary" onClick={()=>finish(true)}>{pending?.confirmLabel||'Confirm'}</button></div>
 </dialog></ConfirmationContext.Provider>;
}
