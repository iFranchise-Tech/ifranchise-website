'use client';
import {useEffect,useRef,useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {indianStates} from '../lib/locations.mjs';
type Option={name:string;aliases?:string[]};
const cityCache=new Map<string,Option[]>();
function LocationPicker({id,name,label,value,options,onSelect,disabled=false,loading=false,failed=false,onRetry}:{id:string;name:string;label:string;value:string;options:Option[];onSelect:(value:string)=>void;disabled?:boolean;loading?:boolean;failed?:boolean;onRetry?:()=>void}){
 const [query,setQuery]=useState(value),[open,setOpen]=useState(false),[active,setActive]=useState(0),[touched,setTouched]=useState(false),input=useRef<HTMLInputElement>(null);
 const filtered=options.filter(o=>[o.name,...(o.aliases||[])].some(v=>v.toLowerCase().includes(query.trim().toLowerCase()))).slice(0,80);
 const valid=!!value&&query===value,error=valid?'':name==='state'?'Select a state or union territory.':'Select a city from the suggestions.';
 useEffect(()=>{input.current?.setCustomValidity(error)},[error]);
 function choose(next:string){onSelect(next);setQuery(next);setOpen(false);setTouched(false);input.current?.focus()}
 function keys(e:React.KeyboardEvent){
  if(e.key==='Escape'){setOpen(false);return}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);const index=Math.max(0,Math.min(filtered.length-1,active+(e.key==='ArrowDown'?1:-1)));setActive(index);document.getElementById(id+'-option-'+index)?.scrollIntoView({block:'nearest'})}
  if(e.key==='Enter'&&open){e.preventDefault();if(filtered[active])choose(filtered[active].name)}
 }
 return <div className="field location-field" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node)){setOpen(false);setTouched(true)}}}>
  <label htmlFor={id}>{label} *</label><div className="location-control"><input ref={input} id={id} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={id+'-options'} aria-activedescendant={open&&filtered[active]?id+'-option-'+active:undefined} aria-invalid={touched&&!valid||undefined} aria-describedby={touched&&!valid?id+'-error':undefined} autoComplete="off" required disabled={disabled} value={query} placeholder={disabled?'Select a state first':loading?'Loading cities…':'Search '+(name==='state'?'state / UT':'city')} onFocus={()=>{setOpen(true);setActive(0)}} onClick={()=>setOpen(true)} onChange={e=>{setQuery(e.target.value);setOpen(true);setActive(0)}} onKeyDown={keys} onInvalid={()=>setTouched(true)}/><ChevronDown size={16} aria-hidden="true"/></div>
  <input type="hidden" name={name} value={valid?value:''}/>
  {open&&!disabled&&<div className="location-menu"><ul id={id+'-options'} role="listbox" aria-label={label}>{filtered.map((o,i)=><li id={id+'-option-'+i} role="option" aria-selected={value===o.name} key={o.name} className={i===active?'is-active':''} onPointerMove={()=>setActive(i)}><button type="button" tabIndex={-1} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(o.name)}>{o.name}</button></li>)}</ul>{loading?<p role="status">Loading cities…</p>:failed?<p role="alert">Cities could not load. <button type="button" onClick={onRetry}>Try again</button></p>:!filtered.length&&<p role="status">No matches. Try another spelling{name==='city'?' or check the selected state':''}.</p>}</div>}
  {touched&&!valid&&<span id={id+'-error'} className="field-error">{error}</span>}
 </div>
}
export function LocationFields({id,preferred=false}:{id:string;preferred?:boolean}){
 const [state,setState]=useState(''),[city,setCity]=useState(''),[cities,setCities]=useState<Option[]>([]),[loading,setLoading]=useState(false),[failed,setFailed]=useState(false),request=useRef<AbortController|null>(null);
 useEffect(()=>()=>request.current?.abort(),[]);
 async function loadCities(next:string){
  request.current?.abort();const cached=cityCache.get(next);setFailed(false);setCities(cached||[]);setLoading(!cached);if(cached)return;
  const controller=new AbortController();request.current=controller;
  try{const r=await fetch('/api/locations?state='+encodeURIComponent(next),{signal:controller.signal});if(!r.ok)throw Error();const data=await r.json() as {cities:Option[]};if(!Array.isArray(data.cities))throw Error();if(!controller.signal.aborted){cityCache.set(next,data.cities);setCities(data.cities)}}catch{if(!controller.signal.aborted)setFailed(true)}finally{if(!controller.signal.aborted)setLoading(false)}
 }
 return <div className="field-row"><LocationPicker id={id+'-state'} name="state" label={preferred?'Preferred state / UT':'State / UT'} value={state} options={indianStates.map(name=>({name}))} onSelect={v=>{if(v!==state){setState(v);setCity('');void loadCities(v)}}}/><LocationPicker key={state} id={id+'-city'} name="city" label={preferred?'Preferred city':'City'} value={city} options={cities} onSelect={setCity} disabled={!state} loading={loading} failed={failed} onRetry={()=>void loadCities(state)}/></div>
}
