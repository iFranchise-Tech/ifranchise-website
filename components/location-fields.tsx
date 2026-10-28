"use client";
import {useEffect,useRef,useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {indianStates,validateManualCity,validateState} from '../lib/locations.mjs';
import {locationSearchKey,matchingCities} from '../lib/location-search.mjs';
type City={name:string;aliases?:string[]};
type CityData={states:Array<{name:string;cities:City[]}>};
let citiesRequest:Promise<CityData>|undefined;
function cityData():Promise<CityData>{return citiesRequest??=(fetch('/data/india-locations.json').then(r=>{if(!r.ok)throw Error('Locations unavailable');return r.json() as Promise<CityData>}).catch(e=>{citiesRequest=undefined;throw e}))}
function LocationInput({id,name,label,value,onChange,options,disabled=false,placeholder,validate,helper}:{id:string;name:string;label:string;value:string;onChange:(value:string)=>void;options:readonly string[];disabled?:boolean;placeholder:string;validate:(value:string)=>unknown;helper?:string}){
 const [open,setOpen]=useState(false),[active,setActive]=useState(-1),[error,setError]=useState('');
 const input=useRef<HTMLInputElement>(null),list=useRef<HTMLUListElement>(null);
 function validity(value:string,show=false){let message='';try{validate(value)}catch(e:any){message=e.message}input.current?.setCustomValidity(message);if(show)setError(message);else setError('');return message}
 useEffect(()=>{validity(value);setActive(-1)},[value,disabled]);
 useEffect(()=>{list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({block:'nearest'})},[active]);
 function select(value:string){onChange(value);validity(value);setOpen(false);setActive(-1);input.current?.focus({preventScroll:true})}
 return <div className="field location-field" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)){setOpen(false);validity(value,true)}}}>
  <label htmlFor={id}>{label} *</label><div className="location-control">
   <input ref={input} id={id} name={name} value={value} required disabled={disabled} maxLength={120} autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={open&&options.length>0} aria-controls={id+'-options'} aria-activedescendant={open&&active>=0?id+'-option-'+active:undefined} aria-invalid={!!error} aria-describedby={[error?id+'-error':'',helper?id+'-help':''].filter(Boolean).join(' ')||undefined} placeholder={placeholder} onClick={()=>setOpen(true)} onChange={e=>{onChange(e.target.value);validity(e.target.value);setOpen(true);setActive(-1)}} onInvalid={()=>validity(value,true)} onKeyDown={e=>{
    if(e.key==='Escape'){setOpen(false);setActive(-1);return}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);setActive(n=>Math.max(0,Math.min(options.length-1,n+(e.key==='ArrowDown'?1:-1))))}
    if(e.key==='Enter'&&open&&active>=0&&options[active]){e.preventDefault();select(options[active])}
   }}/>{name==='state'&&<ChevronDown aria-hidden="true" size={18}/>}
   <ul ref={list} id={id+'-options'} role="listbox" aria-label={label+' suggestions'} hidden={!open||!options.length}>{options.map((option,i)=><li key={option} id={id+'-option-'+i} role="option" aria-selected={i===active} onPointerDown={e=>e.preventDefault()} onClick={()=>select(option)}>{option}</li>)}</ul>
  </div>{helper&&<small id={id+'-help'}>{helper}</small>}{error&&<span id={id+'-error'} className="field-error" role="alert">{error}</span>}
 </div>
}
export function LocationFields({id,preferred=false}:{id:string;preferred?:boolean}){
 const [state,setState]=useState(''),[city,setCity]=useState(''),[cities,setCities]=useState<City[]>([]);
 const selected=indianStates.includes(state);
 useEffect(()=>{let current=true;setCities([]);if(selected)cityData().then(data=>{if(current)setCities(data.states.find(s=>s.name===state)?.cities||[])}).catch(()=>{});return()=>{current=false}},[state,selected]);
 const states=indianStates.filter(s=>locationSearchKey(s).includes(locationSearchKey(state)));
 return <div className="field-row">
  <LocationInput id={id+'-state'} name="state" label={preferred?'Preferred state / UT':'State / UT'} value={state} onChange={value=>{setState(value);setCity('')}} options={selected?indianStates:states} placeholder="Select state / UT" validate={validateState}/>
  <LocationInput key={state} id={id+'-city'} name="city" label={preferred?'Preferred city':'City'} value={city} onChange={setCity} options={matchingCities(cities,city).map((c:City)=>c.name)} disabled={!selected} placeholder={selected?'Enter city':'Select a state first'} validate={validateManualCity} helper={selected?'Choose a suggestion or enter your city.':undefined}/>
 </div>
}
