'use client';
import {useEffect,useRef,useState} from 'react';
import {useContactPopover} from './contact-popover';
export {EmailField} from './email-field';
import {phoneCountries,contactFieldError,phoneInputState,formatNationalPhone} from '../lib/contact-validation.mjs';

export function PhoneField({id,initialValue='',initialCountry='IN',onValueChange,label='Mobile number'}:{id:string;initialValue?:string;initialCountry?:string;label?:string;onValueChange?:(value:string,country:string)=>void}){
 const [country,setCountry]=useState(initialCountry),[value,setValue]=useState(()=>phoneInputState(initialValue,initialCountry).value),[touched,setTouched]=useState(false),[focused,setFocused]=useState(false),[open,setOpen]=useState(false),[query,setQuery]=useState(''),[active,setActive]=useState(0);
 const anchor=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null),search=useRef<HTMLInputElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const placement=useContactPopover(anchor,open,300);
 const selected=phoneCountries.find(c=>c.code===country)!;
 const filtered=phoneCountries.filter(c=>(c.name+' '+c.code+' '+c.dial).toLowerCase().includes(query.trim().toLowerCase()));
 const error=contactFieldError('phone',value,country),invalid=touched&&!!error;
 useEffect(()=>{input.current?.setCustomValidity(error);},[error]);
 useEffect(()=>{if(open)search.current?.focus();},[open]);
 useEffect(()=>{function close(e:PointerEvent){if(root.current&&!root.current.contains(e.target as Node))setOpen(false);}document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
 function choose(code:string){setCountry(code);onValueChange?.(value,code);setOpen(false);setQuery('');input.current?.setCustomValidity(contactFieldError('phone',value,code));if(value)setTouched(true);input.current?.focus();}
 function change(raw:string){const next=phoneInputState(raw,country);setValue(next.value);onValueChange?.(next.value,country);input.current?.setCustomValidity(next.error);if(next.error&&raw.replace(/\D/g,'').length>=10)setTouched(true);}
 function show(){setQuery('');setActive(0);setOpen(v=>!v);}
 function keys(e:React.KeyboardEvent){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setOpen(false);trigger.current?.focus();}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const next=Math.max(0,Math.min(filtered.length-1,active+(e.key==='ArrowDown'?1:-1)));setActive(next);document.getElementById(id+'-country-'+filtered[next]?.code)?.scrollIntoView({block:'nearest'});}else if(e.key==='Enter'&&filtered[active]){e.preventDefault();choose(filtered[active].code);}}
 return <div className="field phone-field" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
  <label htmlFor={id+'-phone'}>{label} *</label>
  <div className="contact-input-anchor" ref={anchor}>
   <div className={'phone-control'+(invalid?' field-invalid':'')}>
    <button ref={trigger} type="button" className="country-trigger" aria-label={'Country code: '+selected.name+' '+selected.dial} aria-haspopup="dialog" aria-expanded={open} aria-controls={open?id+'-country-dialog':undefined} onClick={show} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setOpen(true);setActive(0);}}}><span aria-hidden="true" className="country-iso">{selected.code}</span><strong>{selected.dial}</strong><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg></button>
    <input ref={input} id={id+'-phone'} name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" required value={!focused&&value&&!error?formatNationalPhone(value,country):value} placeholder="Mobile number" aria-invalid={invalid||undefined} aria-describedby={invalid?id+'-phone-help':undefined} onChange={e=>change(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>{setFocused(false);setTouched(true)}} onInvalid={e=>{e.preventDefault();setTouched(true);input.current?.focus({preventScroll:true})}}/>
   </div>
   {open&&<div id={id+'-country-dialog'} className="country-picker" style={placement} role="dialog" aria-label="Select a calling country" onKeyDown={keys}>
    <label className="sr-only" htmlFor={id+'-country-search'}>Search countries or calling codes</label>
    <input ref={search} id={id+'-country-search'} className="country-search" type="search" value={query} autoComplete="off" placeholder="Search country or code" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls={id+'-country-options'} aria-activedescendant={filtered[active]?id+'-country-'+filtered[active].code:undefined} onChange={e=>{setQuery(e.target.value);setActive(0);}}/>
    <ul id={id+'-country-options'} className="country-options" role="listbox" aria-label="Countries">{filtered.map((c,i)=><li key={c.code} id={id+'-country-'+c.code} role="option" aria-selected={active===i} className={active===i?'country-active':''} onPointerMove={()=>setActive(i)}><button tabIndex={-1} type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>choose(c.code)}><span><span aria-hidden="true" className="country-iso">{c.code}</span> {c.name}</span><strong>{c.dial}</strong></button></li>)}</ul>
    {!filtered.length&&<p className="country-empty" role="status">No matching country. Try a name or calling code.</p>}
   </div>}
  </div>
  <input type="hidden" name="phoneCountry" value={country}/>
  {invalid&&<span id={id+'-phone-help'} className="field-error" aria-live="polite">{error}</span>}
 </div>;
}

export function NameField({id}:{id:string}){
 const [value,setValue]=useState(''),[touched,setTouched]=useState(false),input=useRef<HTMLInputElement>(null);
 const error=contactFieldError('name',value),invalid=touched&&!!error;
 useEffect(()=>{input.current?.setCustomValidity(error)},[error]);
 return <div className="field"><label htmlFor={id+'-name'}>Full name *</label><input ref={input} id={id+'-name'} name="name" autoComplete="name" required minLength={2} maxLength={120} value={value} aria-invalid={invalid||undefined} aria-describedby={invalid?id+'-name-error':undefined} onChange={e=>{setValue(e.target.value);setTouched(true)}} onBlur={()=>{setValue(v=>v.trim().replace(/\s+/gu,' '));setTouched(true)}} onInvalid={()=>setTouched(true)}/>{invalid&&<span id={id+'-name-error'} className="field-error" aria-live="polite">{error}</span>}</div>;
}

/** Refresh validity from live DOM values before a form's submission check. */
export function validatePhoneFields(form:HTMLElement){
 form.querySelectorAll<HTMLInputElement>('.phone-field input[name="phone"]').forEach(input=>{
  const country=input.closest('.phone-field')?.querySelector<HTMLInputElement>('input[name="phoneCountry"]')?.value||'IN';
  input.setCustomValidity(contactFieldError('phone',input.value,country));
 });
}
