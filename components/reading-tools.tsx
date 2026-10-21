'use client';
import {useEffect,useState} from 'react';
import {ChevronDown} from 'lucide-react';
export function ReadingTools({sections,hasFaq,hasSources}:{sections:{id?:string;heading:string}[];hasFaq:boolean;hasSources:boolean}){
 const [active,setActive]=useState(''),[contentsOpen,setContentsOpen]=useState(true);
 useEffect(()=>{
  const compact=window.matchMedia('(max-width:900px)');
  const updateContents=()=>setContentsOpen(!compact.matches);
  updateContents();compact.addEventListener('change',updateContents);
  return()=>compact.removeEventListener('change',updateContents);
 },[]);
 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.id)},{rootMargin:'-25% 0px -55% 0px'});
  document.querySelectorAll('.reading-body>section[id]').forEach(e=>observer.observe(e));
  return()=>observer.disconnect();
 },[]);
 return <aside className="reading-rail"><details className="reading-contents" open={contentsOpen} onToggle={event=>setContentsOpen(event.currentTarget.open)}><summary>On this page<ChevronDown size={17}/></summary><nav aria-label="On this page"><ol>{sections.map((s,i)=><li key={s.id}><a href={'#'+s.id} aria-current={active===s.id?'location':undefined}><span>{String(i+1).padStart(2,'0')}</span>{s.heading}</a></li>)}</ol>{hasFaq&&<a href="#questions">Common questions</a>}{hasSources&&<a href="#sources">Further reading</a>}</nav></details></aside>;
}
