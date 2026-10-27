'use client';
import {useEffect,useState} from 'react';
import {useActiveSection} from './use-active-section';
import {ChevronDown} from 'lucide-react';
export function ReadingTools({sections,hasFaq,hasSources}:{sections:{id?:string;heading:string}[];hasFaq:boolean;hasSources:boolean}){
 const [contentsOpen,setContentsOpen]=useState(true);
 const active=useActiveSection([...sections.flatMap(s=>s.id?[s.id]:[]),...(hasFaq?['questions']:[]),...(hasSources?['sources']:[])]);
 useEffect(()=>{
  const compact=window.matchMedia('(max-width:900px)');
  const updateContents=()=>setContentsOpen(!compact.matches);
  updateContents();compact.addEventListener('change',updateContents);
  return()=>compact.removeEventListener('change',updateContents);
 },[]);
 return <aside className="reading-rail"><details className="reading-contents" open={contentsOpen} onToggle={event=>setContentsOpen(event.currentTarget.open)}><summary>On this page<ChevronDown size={17}/></summary><nav aria-label="On this page"><ol>{sections.map((s,i)=><li key={s.id}><a href={'#'+s.id} aria-current={active===s.id?'location':undefined}><span>{String(i+1).padStart(2,'0')}</span>{s.heading}</a></li>)}</ol>{hasFaq&&<a href="#questions" aria-current={active==='questions'?'location':undefined}>Common questions</a>}{hasSources&&<a href="#sources" aria-current={active==='sources'?'location':undefined}>Further reading</a>}</nav></details></aside>;
}
