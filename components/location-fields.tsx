'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ChevronDown,Check} from 'lucide-react';
import {indianStates,validateManualCity,validateState} from '../lib/locations.mjs';
import {matchingCities,locationSearchKey} from '../lib/location-search.mjs';
import {locationPopup} from '../lib/location-popup.mjs';
type City={name:string;aliases?:string[]};
type CityData={states:Array<{name:string;cities:City[]}>};
let citiesRequest:Promise<CityData>|undefined;
function cityData():Promise<CityData>{return citiesRequest??=fetch('/data/india-locations.json').then(r=>{if(!r.ok)throw Error('Locations unavailable');return r.json() as Promise<CityData>}).catch(e=>{citiesRequest=undefined;throw e})}

/** One editable combobox for canonical states and free-entry cities. */
function LocationInput({id,label,name,value,onChange,options,disabled=false,restricted=false}:{id:string;label:string;name:string;value:string;onChange:(value:string)=>void;options:readonly string[];disabled?:boolean;restricted?:boolean}){
 const [open,setOpen]=useState(false),[query,setQuery]=useState(value),[active,setActive]=useState(-1),[error,setError]=useState('');
 const [position,setPosition]=useState<React.CSSProperties>({}),[host,setHost]=useState<Element|null>(null);
 const touching=useRef(false);
 const input=useRef<HTMLInputElement>(null),list=useRef<HTMLUListElement>(null),root=useRef<HTMLDivElement>(null);
 const shown=restricted?options.filter(option=>locationSearchKey(option).includes(locationSearchKey(query))):options;
 const expanded=open&&(restricted||shown.length>0);
 const validate=useCallback((next:string,show=false)=>{let message='';if(!disabled)try{(restricted?validateState:validateManualCity)(next)}catch(e){message=(e as Error).message}input.current?.setCustomValidity(message);if(show)setError(message);return message},[disabled,restricted]);
 useEffect(()=>{validate(value);setError('')},[value,validate]);
 useEffect(()=>{setHost(input.current?.closest('dialog')||document.body)},[]);
 useEffect(()=>{
  if(!expanded)return;
  function place(){const rect=input.current?.getBoundingClientRect();if(rect)setPosition(locationPopup(rect,{top:window.visualViewport?.offsetTop||0,height:window.visualViewport?.height||innerHeight,width:document.documentElement.clientWidth}))}
  function outside(e:PointerEvent){if(!root.current?.contains(e.target as Node)&&!list.current?.contains(e.target as Node)){setOpen(false);setQuery(value)}}
  place();window.addEventListener('resize',place);window.addEventListener('scroll',place,true);window.visualViewport?.addEventListener('resize',place);window.visualViewport?.addEventListener('scroll',place);document.addEventListener('pointerdown',outside);
  return()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);window.visualViewport?.removeEventListener('resize',place);window.visualViewport?.removeEventListener('scroll',place);document.removeEventListener('pointerdown',outside)};
 },[expanded,value]);
 useEffect(()=>{const el=list.current?.children[active] as HTMLElement|undefined,container=list.current;if(el&&container){if(el.offsetTop<container.scrollTop)container.scrollTop=el.offsetTop;else if(el.offsetTop+el.offsetHeight>container.scrollTop+container.clientHeight)container.scrollTop=el.offsetTop+el.offsetHeight-container.clientHeight}},[active]);
 function choose(next:string){onChange(next);setQuery(next);validate(next);setError('');setOpen(false);setActive(-1);input.current?.focus({preventScroll:true})}
 function reveal(){setQuery(restricted?'':value);setActive(-1);setOpen(true)}
 return <div className="field location-field" ref={root}>
  <label htmlFor={id}>{label} *</label>
  <div className={'location-control'+(restricted?' location-select':'')}>
   <input ref={input} id={id} name={restricted?undefined:name} value={restricted&&open?query:value} required disabled={disabled} maxLength={120} autoComplete="off" autoCapitalize="words" spellCheck={false} enterKeyHint="done" role="combobox" aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded?id+'-options':undefined} aria-activedescendant={expanded&&active>=0&&shown[active]?id+'-option-'+active:undefined} aria-invalid={!!error} aria-describedby={error?id+'-error':undefined} placeholder={restricted?'Search state / UT':disabled?'Select a state first':'Enter city'}
    onClick={()=>{if(!open)reveal()}} onChange={e=>{const next=e.target.value;setQuery(next);onChange(restricted?'':next);validate(restricted?'':next);setError('');setActive(-1);setOpen(true)}}
    onBlur={e=>{if(!touching.current&&!list.current?.contains(e.relatedTarget as Node)){setOpen(false);setQuery(value);validate(value,true)}}} onInvalid={()=>validate(value,true)} onKeyDown={e=>{
     if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();setOpen(false);setQuery(value);setActive(-1)}
     if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!open){reveal();return}setActive(n=>e.key==='ArrowDown'?Math.min(shown.length-1,n+1):Math.max(0,n-1))}
     if(open&&(e.key==='Home'||e.key==='End')){e.preventDefault();setActive(e.key==='Home'?0:shown.length-1)}
     if(e.key==='Enter'&&open){e.preventDefault();if(active>=0&&shown[active])choose(shown[active]);else if(restricted&&shown.length===1)choose(shown[0]);else if(!restricted)setOpen(false)}
    }}/>
   {restricted&&<><input type="hidden" name={name} value={value}/><ChevronDown size={18} aria-hidden="true"/></>}
  </div>
  {error&&<span id={id+'-error'} className="field-error" role="alert">{error}</span>}
  {expanded&&host&&createPortal(<ul ref={list} style={position} className="location-suggestions" id={id+'-options'} onPointerDown={()=>{touching.current=true}} onPointerUp={()=>{setTimeout(()=>{touching.current=false},0)}} onPointerCancel={()=>{touching.current=false}} role="listbox" aria-label={label+' suggestions'}>
   {shown.map((option,i)=><li key={option} id={id+'-option-'+i} role="option" aria-selected={value===option} className={active===i?'location-active':''} onMouseDown={e=>e.preventDefault()} onPointerMove={e=>{if(e.pointerType==='mouse')setActive(i)}} onClick={()=>choose(option)}><span>{option}</span>{value===option&&<Check size={16} aria-hidden="true"/>}</li>)}
   {!shown.length&&<li role="presentation" className="location-no-results">No matching state or union territory.</li>}
  </ul>,host)}
 </div>;
}
export function LocationFields({id,preferred=false}:{id:string;preferred?:boolean}){
 const [state,setState]=useState(''),[city,setCity]=useState(''),[cities,setCities]=useState<City[]>([]);
 const selected=indianStates.includes(state);
 useEffect(()=>{let current=true;setCities([]);if(selected)cityData().then(data=>{if(current)setCities(data.states.find(s=>s.name===state)?.cities||[])}).catch(()=>{});return()=>{current=false}},[state,selected]);
 return <div className="field-row">
  <LocationInput id={id+'-state'} name="state" label={preferred?'Preferred state / UT':'State / UT'} value={state} onChange={next=>{if(next!==state){setState(next);setCity('')}}} options={indianStates} restricted/>
  <LocationInput key={state} id={id+'-city'} name="city" label={preferred?'Preferred city':'City'} value={city} onChange={setCity} options={matchingCities(cities,city).map((c:City)=>c.name)} disabled={!selected}/>
 </div>;
}
