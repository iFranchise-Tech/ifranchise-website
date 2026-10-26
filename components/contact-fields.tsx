'use client';
import {useEffect,useRef,useState} from 'react';
import {phoneCountries,contactFieldError,nationalPhoneInput,formatNationalPhone,emailFieldError,emailSuggestions} from '../lib/contact-validation.mjs';

// Keep suggestions inside scrollable dialogs and the visible mobile viewport.
function useContactPopover(anchor:React.RefObject<HTMLDivElement|null>,open:boolean,desiredHeight:number){
 const [placement,setPlacement]=useState<React.CSSProperties>({});
 useEffect(()=>{
  if(!open)return;
  function measure(){
   const el=anchor.current;if(!el)return;const r=el.getBoundingClientRect(),viewport=window.visualViewport;
   let top=viewport?.offsetTop||0,bottom=top+(viewport?.height||innerHeight);
   for(let parent=el.parentElement;parent;parent=parent.parentElement){
    if(/auto|scroll|hidden|clip/.test(getComputedStyle(parent).overflowY)){const bounds=parent.getBoundingClientRect();top=Math.max(top,bounds.top);bottom=Math.min(bottom,bounds.bottom);}
   }
   const above=r.top-top-10,below=bottom-r.bottom-10,up=below<desiredHeight&&above>below;
   const height=Math.max(60,Math.min(desiredHeight,up?above:below));
   setPlacement({top:up?'auto':'calc(100% + 6px)',bottom:up?'calc(100% + 6px)':'auto',maxHeight:height,'--contact-panel-height':height+'px'} as React.CSSProperties);
  }
  measure();window.addEventListener('resize',measure);window.addEventListener('scroll',measure,true);window.visualViewport?.addEventListener('resize',measure);
  return()=>{window.removeEventListener('resize',measure);window.removeEventListener('scroll',measure,true);window.visualViewport?.removeEventListener('resize',measure)};
 },[anchor,open,desiredHeight]);
 return placement;
}

export function PhoneField({id,initialValue='',initialCountry='IN',onValueChange,label='Mobile number'}:{id:string;initialValue?:string;initialCountry?:string;label?:string;onValueChange?:(value:string,country:string)=>void}){
 const [country,setCountry]=useState(initialCountry),[value,setValue]=useState(()=>nationalPhoneInput(initialValue,initialCountry)),[touched,setTouched]=useState(false),[focused,setFocused]=useState(false),[entryError,setEntryError]=useState(''),[open,setOpen]=useState(false),[query,setQuery]=useState(''),[active,setActive]=useState(0);
 const anchor=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null),search=useRef<HTMLInputElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const placement=useContactPopover(anchor,open,300);
 const selected=phoneCountries.find(c=>c.code===country)!;
 const filtered=phoneCountries.filter(c=>(c.name+' '+c.code+' '+c.dial).toLowerCase().includes(query.trim().toLowerCase()));
 const error=entryError||contactFieldError('phone',value,country),invalid=!!entryError||touched&&!!error;
 useEffect(()=>{input.current?.setCustomValidity(error);},[error]);
 useEffect(()=>{if(open)search.current?.focus();},[open]);
 useEffect(()=>{function close(e:PointerEvent){if(root.current&&!root.current.contains(e.target as Node))setOpen(false);}document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
 function choose(code:string){setCountry(code);onValueChange?.(value,code);setOpen(false);setQuery('');setEntryError('');if(value)setTouched(true);input.current?.focus();}
 function change(raw:string){try{const digits=nationalPhoneInput(raw,country);setValue(digits);onValueChange?.(digits,country);setEntryError('');input.current?.setCustomValidity(contactFieldError('phone',digits,country));}catch(e:any){setEntryError(e.message);input.current?.setCustomValidity(e.message);}}
 function show(){setQuery('');setActive(0);setOpen(v=>!v);}
 function keys(e:React.KeyboardEvent){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setOpen(false);trigger.current?.focus();}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const next=Math.max(0,Math.min(filtered.length-1,active+(e.key==='ArrowDown'?1:-1)));setActive(next);document.getElementById(id+'-country-'+filtered[next]?.code)?.scrollIntoView({block:'nearest'});}else if(e.key==='Enter'&&filtered[active]){e.preventDefault();choose(filtered[active].code);}}
 return <div className="field phone-field" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
  <label htmlFor={id+'-phone'}>{label} *</label>
  <div className="contact-input-anchor" ref={anchor}>
   <div className={'phone-control'+(invalid?' field-invalid':'')}>
    <button ref={trigger} type="button" className="country-trigger" aria-label={'Country code: '+selected.name+' '+selected.dial} aria-haspopup="dialog" aria-expanded={open} aria-controls={open?id+'-country-dialog':undefined} onClick={show} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setOpen(true);setActive(0);}}}><span aria-hidden="true" className="country-flag">{selected.flag}</span><strong>{selected.dial}</strong><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg></button>
    <input ref={input} id={id+'-phone'} name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" required maxLength={30} value={!focused&&value&&!error?formatNationalPhone(value,country):value} placeholder="Mobile number" aria-invalid={invalid||undefined} aria-describedby={invalid?id+'-phone-help':undefined} onChange={e=>change(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>{setFocused(false);setTouched(true)}} onInvalid={()=>setTouched(true)}/>
   </div>
   {open&&<div id={id+'-country-dialog'} className="country-picker" style={placement} role="dialog" aria-label="Select a calling country" onKeyDown={keys}>
    <label className="sr-only" htmlFor={id+'-country-search'}>Search countries or calling codes</label>
    <input ref={search} id={id+'-country-search'} className="country-search" type="search" value={query} autoComplete="off" placeholder="Search country or code" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls={id+'-country-options'} aria-activedescendant={filtered[active]?id+'-country-'+filtered[active].code:undefined} onChange={e=>{setQuery(e.target.value);setActive(0);}}/>
    <ul id={id+'-country-options'} className="country-options" role="listbox" aria-label="Countries">{filtered.map((c,i)=><li key={c.code} id={id+'-country-'+c.code} role="option" aria-selected={active===i} className={active===i?'country-active':''} onPointerMove={()=>setActive(i)}><button tabIndex={-1} type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>choose(c.code)}><span><span aria-hidden="true" className="country-flag">{c.flag}</span> {c.name}</span><strong>{c.dial}</strong></button></li>)}</ul>
    {!filtered.length&&<p className="country-empty" role="status">No matching country. Try a name or calling code.</p>}
   </div>}
  </div>
  <input type="hidden" name="phoneCountry" value={country}/>
  {invalid&&<span id={id+'-phone-help'} className="field-error" aria-live="polite">{error}</span>}
 </div>;
}

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

export function NameField({id}:{id:string}){
 const [value,setValue]=useState(''),[touched,setTouched]=useState(false),input=useRef<HTMLInputElement>(null);
 const error=contactFieldError('name',value),invalid=touched&&!!error;
 useEffect(()=>{input.current?.setCustomValidity(error)},[error]);
 return <div className="field"><label htmlFor={id+'-name'}>Full name *</label><input ref={input} id={id+'-name'} name="name" autoComplete="name" required minLength={2} maxLength={120} value={value} aria-invalid={invalid||undefined} aria-describedby={invalid?id+'-name-error':undefined} onChange={e=>{setValue(e.target.value);setTouched(true)}} onBlur={()=>{setValue(v=>v.trim().replace(/\s+/gu,' '));setTouched(true)}} onInvalid={()=>setTouched(true)}/>{invalid&&<span id={id+'-name-error'} className="field-error" aria-live="polite">{error}</span>}</div>;
}
