"use client";
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {indianStates,validateManualCity,validateState} from '../lib/locations.mjs';
import {matchingCities} from '../lib/location-search.mjs';
import {locationPopup} from '../lib/location-popup.mjs';
type City={name:string;aliases?:string[]};
type CityData={states:Array<{name:string;cities:City[]}>};
let citiesRequest:Promise<CityData>|undefined;
function cityData():Promise<CityData>{return citiesRequest??=(fetch('/data/india-locations.json').then(r=>{if(!r.ok)throw Error('Locations unavailable');return r.json() as Promise<CityData>}).catch(e=>{citiesRequest=undefined;throw e}))}
function CityInput({id,label,value,onChange,options,disabled}:{id:string;label:string;value:string;onChange:(value:string)=>void;options:string[];disabled:boolean}){
 const [open,setOpen]=useState(false),[active,setActive]=useState(-1),[error,setError]=useState('');
 const [position,setPosition]=useState<React.CSSProperties>({});
 const input=useRef<HTMLInputElement>(null),list=useRef<HTMLUListElement>(null),latest=useRef(value);
 const gesture=useRef<{x:number;y:number;index:number}|null>(null),interacting=useRef(false);
 latest.current=value;
 function validity(current:string,show=false){let message='';try{validateManualCity(current)}catch(e:any){message=e.message}input.current?.setCustomValidity(message);setError(show?message:'');return message}
 useEffect(()=>{validity(value);setActive(-1)},[value,disabled]);
 useEffect(()=>{
  if(!open||!input.current)return;
  function place(){const r=input.current?.getBoundingClientRect();if(r)setPosition(locationPopup(r,{top:visualViewport?.offsetTop||0,height:visualViewport?.height||innerHeight,width:document.documentElement.clientWidth}))}
  function outside(e:PointerEvent){if(e.target!==input.current&&!list.current?.contains(e.target as Node)){setOpen(false);input.current?.blur()}}
  place();window.addEventListener('resize',place);window.addEventListener('scroll',place,true);visualViewport?.addEventListener('resize',place);visualViewport?.addEventListener('scroll',place);document.addEventListener('pointerdown',outside);
  return()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);visualViewport?.removeEventListener('resize',place);visualViewport?.removeEventListener('scroll',place);document.removeEventListener('pointerdown',outside)};
 },[open,options.length]);
 useEffect(()=>{list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({block:'nearest'})},[active]);
 function select(next:string,touch=false){latest.current=next;onChange(next);validity(next);setOpen(false);setActive(-1);interacting.current=false;if(touch)input.current?.blur()}
 return <div className="field location-field">
  <label htmlFor={id}>{label} *</label><div className="location-control">
   <input ref={input} id={id} name="city" value={value} required disabled={disabled} maxLength={120} autoComplete="off" enterKeyHint="done" role="combobox" aria-autocomplete="list" aria-expanded={open&&options.length>0} aria-controls={id+'-options'} aria-activedescendant={open&&active>=0?id+'-option-'+active:undefined} aria-invalid={!!error} aria-describedby={error?id+'-error':undefined} placeholder={disabled?'Select a state first':'Enter city'}
    onFocus={()=>setOpen(true)} onClick={()=>setOpen(true)} onChange={e=>{latest.current=e.target.value;onChange(e.target.value);validity(e.target.value);setOpen(true);setActive(-1)}}
    onBlur={e=>{if(!interacting.current&&!list.current?.contains(e.relatedTarget as Node)){setOpen(false);validity(latest.current,true)}}} onInvalid={()=>validity(latest.current,true)} onKeyDown={e=>{
     if(e.key==='Escape'){setOpen(false);setActive(-1);return}
     if((e.key==='ArrowDown'||e.key==='ArrowUp')&&options.length){e.preventDefault();setOpen(true);setActive(n=>Math.max(0,Math.min(options.length-1,n+(e.key==='ArrowDown'?1:-1))))}
     if(e.key==='Enter'){if(open&&active>=0&&options[active]){e.preventDefault();select(options[active])}else{input.current?.blur();setOpen(false)}}
    }}/>
  </div>{!disabled&&<small>Choose a suggestion or enter your city.</small>}{error&&<span id={id+'-error'} className="field-error" role="alert">{error}</span>}
  {open&&!!options.length&&createPortal(<ul ref={list} tabIndex={-1} style={position} className="location-suggestions" id={id+'-options'} role="listbox" aria-label={label+' suggestions'} onScroll={()=>{if(interacting.current){list.current?.focus({preventScroll:true});input.current?.blur()}}} onPointerCancel={()=>{if(gesture.current){list.current?.focus({preventScroll:true});input.current?.blur()}gesture.current=null;interacting.current=false}}>{options.map((option,i)=><li key={option} id={id+'-option-'+i} role="option" aria-selected={i===active}
   onPointerDown={e=>{if(e.pointerType==='mouse'){e.preventDefault();return}interacting.current=true;gesture.current={x:e.clientX,y:e.clientY,index:i};e.currentTarget.setPointerCapture(e.pointerId)}}
   onPointerMove={e=>{const g=gesture.current;if(g&&Math.hypot(e.clientX-g.x,e.clientY-g.y)>10){list.current?.focus({preventScroll:true});input.current?.blur()}}}
   onPointerUp={e=>{const g=gesture.current;gesture.current=null;if(e.pointerType!=='mouse'&&g&&g.index===i&&Math.hypot(e.clientX-g.x,e.clientY-g.y)<10){e.preventDefault();select(option,true)}interacting.current=false}}
   onClick={()=>select(option,true)}>{option}</li>)}</ul>,document.body)}
 </div>
}
export function LocationFields({id,preferred=false}:{id:string;preferred?:boolean}){
 const [state,setState]=useState(''),[city,setCity]=useState(''),[cities,setCities]=useState<City[]>([]),[stateError,setStateError]=useState('');
 const selected=indianStates.includes(state);
 useEffect(()=>{let current=true;setCities([]);if(selected)cityData().then(data=>{if(current)setCities(data.states.find(s=>s.name===state)?.cities||[])}).catch(()=>{});return()=>{current=false}},[state,selected]);
 return <div className="field-row">
  <div className="field location-field"><label htmlFor={id+'-state'}>{preferred?'Preferred state / UT':'State / UT'} *</label>
   <select id={id+'-state'} name="state" required value={state} autoComplete="address-level1" aria-invalid={!!stateError} aria-describedby={stateError?id+'-state-error':undefined}
    onChange={e=>{const next=e.currentTarget.value;setState(next);setCity('');setStateError('');e.currentTarget.setCustomValidity('');e.currentTarget.blur()}}
    onInvalid={e=>{try{validateState(e.currentTarget.value)}catch(err:any){setStateError(err.message)}}}>
    <option value="" disabled>Select state / UT</option>{indianStates.map(s=><option key={s} value={s}>{s}</option>)}
   </select>{stateError&&<span id={id+'-state-error'} className="field-error" role="alert">{stateError}</span>}
  </div>
  <CityInput key={state} id={id+'-city'} label={preferred?'Preferred city':'City'} value={city} onChange={setCity} options={matchingCities(cities,city).map((c:City)=>c.name)} disabled={!selected}/>
 </div>
}
