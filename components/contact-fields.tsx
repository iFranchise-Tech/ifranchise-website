'use client';
import {useEffect,useRef,useState} from 'react';
import {phoneCountries,contactFieldError} from '../lib/contact-validation.mjs';

export function PhoneField({id}:{id:string}){
 const [country,setCountry]=useState('IN'),[value,setValue]=useState(''),[touched,setTouched]=useState(false),[open,setOpen]=useState(false),[query,setQuery]=useState(''),[active,setActive]=useState(0);
 const root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null),search=useRef<HTMLInputElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const selected=phoneCountries.find(c=>c.code===country)!;
 const filtered=phoneCountries.filter(c=>(c.name+' '+c.code+' '+c.dial).toLowerCase().includes(query.trim().toLowerCase()));
 const error=contactFieldError('phone',value,country),invalid=touched&&!!error;
 useEffect(()=>{input.current?.setCustomValidity(error);},[error]);
 useEffect(()=>{if(open){search.current?.focus();setActive(0);}},[open,query]);
 useEffect(()=>{function close(e:PointerEvent){if(root.current&&!root.current.contains(e.target as Node))setOpen(false);}document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
 function choose(code:string){setCountry(code);setOpen(false);setQuery('');if(value)setTouched(true);input.current?.focus();}
 function show(){setQuery('');setOpen(v=>!v);}
 function keys(e:React.KeyboardEvent){if(e.key==='Escape'){setOpen(false);trigger.current?.focus();}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const next=Math.max(0,Math.min(filtered.length-1,active+(e.key==='ArrowDown'?1:-1)));setActive(next);document.getElementById(id+'-country-'+filtered[next]?.code)?.scrollIntoView({block:'nearest'});}else if(e.key==='Enter'&&filtered[active]){e.preventDefault();choose(filtered[active].code);}}
 return <div className="field phone-field" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
  <label htmlFor={id+'-phone'}>Mobile number *</label>
  <div className={'phone-control'+(invalid?' field-invalid':'')}>
   <button ref={trigger} type="button" className="country-trigger" aria-label={'Country code: '+selected.name+' '+selected.dial} aria-haspopup="dialog" aria-expanded={open} aria-controls={id+'-country-dialog'} onClick={show}><span>{selected.code}</span><strong>{selected.dial}</strong><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg></button>
   <input ref={input} id={id+'-phone'} name="phone" type="tel" inputMode="tel" autoComplete="tel-national" required maxLength={25} value={value} placeholder="Mobile number" aria-invalid={invalid||undefined} aria-describedby={invalid?id+'-phone-help':undefined} onChange={e=>setValue(e.target.value)} onBlur={()=>setTouched(true)} onInvalid={()=>setTouched(true)}/>
  </div>
  <input type="hidden" name="phoneCountry" value={country}/>
  {open&&<div id={id+'-country-dialog'} className="country-picker" role="dialog" aria-label="Select a calling country" onKeyDown={keys}>
   <label className="sr-only" htmlFor={id+'-country-search'}>Search countries or calling codes</label>
   <input ref={search} id={id+'-country-search'} className="country-search" type="search" value={query} autoComplete="off" placeholder="Search country or code" role="combobox" aria-expanded="true" aria-controls={id+'-country-options'} aria-activedescendant={filtered[active]?id+'-country-'+filtered[active].code:undefined} onChange={e=>setQuery(e.target.value)}/>
   <ul id={id+'-country-options'} className="country-options" role="listbox" aria-label="Countries">{filtered.map((c,i)=><li key={c.code} id={id+'-country-'+c.code} role="option" aria-selected={country===c.code} className={active===i?'country-active':''} onPointerMove={()=>setActive(i)}><button tabIndex={-1} type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>choose(c.code)}><span>{c.name}</span><strong>{c.dial}</strong></button></li>)}</ul>
   {!filtered.length&&<p className="country-empty">No matching country. Try a name or calling code.</p>}
  </div>}
  {invalid&&<span id={id+'-phone-help'} className="field-error" aria-live="polite">{error}</span>}
 </div>;
}
export function EmailField({id}:{id:string}){
 const [value,setValue]=useState(''),[touched,setTouched]=useState(false),input=useRef<HTMLInputElement>(null);
 const error=contactFieldError('email',value),invalid=touched&&!!error;
 useEffect(()=>{input.current?.setCustomValidity(error);},[error]);
 return <div className="field"><label htmlFor={id+'-email'}>Email address *</label><input ref={input} id={id+'-email'} name="email" type="email" required autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} value={value} placeholder="you@example.com" aria-invalid={invalid||undefined} aria-describedby={invalid?id+'-email-error':undefined} onChange={e=>setValue(e.target.value)} onBlur={()=>setTouched(true)} onInvalid={()=>setTouched(true)}/>{invalid&&<span id={id+'-email-error'} className="field-error" aria-live="polite">{error}</span>}</div>;
}
