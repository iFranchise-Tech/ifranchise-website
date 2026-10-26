'use client';
import {useRef,useState} from 'react';
import {Icon} from './icons';

export function CatalogueSearch({value,onChange,suggestions}:{value:string;onChange:(value:string)=>void;suggestions:string[]}){
 const [open,setOpen]=useState(false),[active,setActive]=useState(-1),input=useRef<HTMLInputElement>(null);
 const matches=value.trim()?suggestions.filter(s=>s.toLowerCase().includes(value.trim().toLowerCase())&&s.toLowerCase()!==value.trim().toLowerCase()).slice(0,6):[];
 const shown=open&&matches.length>0;
 function choose(next:string){onChange(next);setOpen(false);setActive(-1);input.current?.focus();}
 return <div className="opportunity-field opportunity-search" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
  <label htmlFor="brand-search">Search</label><div><Icon name="search"/>
   <input ref={input} type="search" id="brand-search" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded={shown} aria-controls={shown?'brand-suggestions':undefined} aria-activedescendant={shown&&active>=0?'brand-suggestion-'+active:undefined} autoComplete="off" placeholder="Brand name or sector" maxLength={120} value={value} onFocus={()=>{setOpen(true);setActive(-1);}} onChange={e=>{onChange(e.target.value);setOpen(true);setActive(-1);}} onKeyDown={e=>{
    if(e.key==='Escape'){setOpen(false);setActive(-1);}
    else if((e.key==='ArrowDown'||e.key==='ArrowUp')&&matches.length){e.preventDefault();setOpen(true);setActive(i=>e.key==='ArrowDown'?Math.min(i+1,matches.length-1):Math.max(i-1,0));}
    else if(e.key==='Enter'&&shown&&active>=0&&matches[active]){e.preventDefault();choose(matches[active]);}
   }}/>
   {shown&&<ul id="brand-suggestions" className="catalogue-suggestions" role="listbox" aria-label="Matching brands and sectors">{matches.map((s,i)=><li key={s} role="presentation"><button type="button" role="option" id={'brand-suggestion-'+i} aria-selected={active===i} tabIndex={-1} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(s)}>{s}</button></li>)}</ul>}
  </div>
 </div>;
}
