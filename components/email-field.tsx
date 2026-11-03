'use client';
import {useEffect,useRef,useState} from 'react';
import {emailFieldError,emailSuggestions} from '../lib/email-validation.mjs';
import {useContactPopover} from './contact-popover';
type EmailFieldProps={id:string;label?:string;name?:string;value?:string;onChange?:(value:string)=>void;disabled?:boolean;required?:boolean;work?:boolean;helper?:string;className?:string;validateOnSubmit?:boolean};
export function EmailField({id,label='Email address',name='email',value:controlled,onChange,disabled=false,required=true,work=false,helper,className='field',validateOnSubmit=false}:EmailFieldProps){
 const [ownValue,setOwnValue]=useState(''),[touched,setTouched]=useState(false),[open,setOpen]=useState(false),[active,setActive]=useState(-1),input=useRef<HTMLInputElement>(null),root=useRef<HTMLDivElement>(null),anchor=useRef<HTMLDivElement>(null);
 const value=controlled??ownValue,error=emailFieldError(value,{required,work}),invalid=!disabled&&(touched||validateOnSubmit)&&!!error;
 const suggestions=emailSuggestions(value,work?['ifranchise.in']:undefined),shown=open&&!disabled&&suggestions.length>0;
 const placement=useContactPopover(anchor,shown,Math.min(270,suggestions.length*66+14));
 function change(next:string){if(controlled===undefined)setOwnValue(next);onChange?.(next);setActive(-1);input.current?.setCustomValidity(emailFieldError(next,{required,work}));}
 function choose(next:string){change(next);setOpen(false);setTouched(true);input.current?.focus();}
 useEffect(()=>{input.current?.setCustomValidity(disabled?'':error);},[disabled,error]);
 useEffect(()=>{if(shown&&active>=0)document.getElementById(id+'-email-option-'+active)?.scrollIntoView({block:'nearest'});},[shown,active,id]);
 useEffect(()=>{function close(e:PointerEvent){if(root.current&&!root.current.contains(e.target as Node))setOpen(false);}document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
 function keys(e:React.KeyboardEvent<HTMLInputElement>){
  if(e.key==='Escape'&&shown){e.preventDefault();e.stopPropagation();setOpen(false);setActive(-1);}
  else if((e.key==='ArrowDown'||e.key==='ArrowUp')&&suggestions.length){e.preventDefault();setOpen(true);setActive(i=>e.key==='ArrowDown'?Math.min(i+1,suggestions.length-1):Math.max(i-1,0));}
  else if(e.key==='Enter'&&shown&&active>=0){e.preventDefault();choose(suggestions[active].email);}
 }
 const described=[invalid?id+'-email-error':'',helper?id+'-email-hint':''].filter(Boolean).join(' ')||undefined;
 return <div className={className+' email-field'} ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node)){setTouched(true);setOpen(false);}}}>
  <label htmlFor={id+'-email'}>{label}{required?' *':''}</label>
  <div className="contact-input-anchor" ref={anchor}>
   {/* text + email inputMode retains autofill while allowing IDN and quoted mailbox formats that native type=email rejects. */}
   <input ref={input} id={id+'-email'} name={name} type="text" inputMode="email" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded={!!shown} aria-controls={shown?id+'-email-suggestions':undefined} aria-activedescendant={shown&&active>=0?id+'-email-option-'+active:undefined} required={required} disabled={disabled} autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} value={value} placeholder={work?'name@ifranchise.in':'name@gmail.com'} aria-invalid={invalid||undefined} aria-describedby={described} onChange={e=>{change(e.target.value);setOpen(true);}} onFocus={()=>{setOpen(true);setActive(-1);}} onBlur={()=>{if(value!==value.trim())change(value.trim());}} onKeyDown={keys} onInvalid={()=>setTouched(true)}/>
   {shown&&<ul id={id+'-email-suggestions'} className="email-suggestions" style={placement} role="listbox" aria-label="Email suggestions">{suggestions.map((item,i)=><li id={id+'-email-option-'+i} key={item.email} role="option" aria-selected={i===active} onPointerMove={()=>setActive(i)}><button type="button" tabIndex={-1} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(item.email)}>{item.kind==='correction'&&<small>Did you mean</small>}<span>{item.email}</span></button></li>)}</ul>}
  </div>
  {invalid&&<span id={id+'-email-error'} className="field-error" aria-live="polite">{error}</span>}
  {helper&&<small id={id+'-email-hint'}>{helper}</small>}
 </div>;
}
