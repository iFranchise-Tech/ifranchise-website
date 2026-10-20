'use client';
import {useEffect,useState} from 'react';
import {Check,Link as LinkIcon,ChevronDown} from 'lucide-react';
export function ReadingTools({sections,hasFaq,hasSources}:{sections:{id?:string;heading:string}[];hasFaq:boolean;hasSources:boolean}){
 const [active,setActive]=useState(''),[copied,setCopied]=useState(false),[error,setError]=useState(false),[progress,setProgress]=useState(0),[contentsOpen,setContentsOpen]=useState(true);
 useEffect(()=>{
  const compact=window.matchMedia('(max-width:900px)');
  const updateContents=()=>setContentsOpen(!compact.matches);
  updateContents();compact.addEventListener('change',updateContents);
  return()=>compact.removeEventListener('change',updateContents);
 },[]);
 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.id)},{rootMargin:'-15% 0px -65% 0px'});
  const elements=document.querySelectorAll('.reading-body>section[id]');elements.forEach(e=>observer.observe(e));
  const update=()=>{const body=document.querySelector('.reading-body');if(!body)return;const rect=body.getBoundingClientRect();setProgress(Math.max(0,Math.min(100,(-rect.top+150)/Math.max(1,rect.height-window.innerHeight+150)*100)))};
  update();window.addEventListener('scroll',update,{passive:true});return()=>{observer.disconnect();window.removeEventListener('scroll',update)};
 },[]);
 async function copy(){try{await navigator.clipboard.writeText(location.origin+location.pathname);setCopied(true);setError(false)}catch{setError(true)}}
 return <aside className="reading-rail"><details className="reading-contents" open={contentsOpen} onToggle={event=>setContentsOpen(event.currentTarget.open)}><summary>On this page<ChevronDown size={17}/></summary><nav aria-label="On this page"><ol>{sections.map((s,i)=><li key={s.id}><a href={'#'+s.id} aria-current={active===s.id?'location':undefined}><span>{String(i+1).padStart(2,'0')}</span>{s.heading}</a></li>)}</ol>{hasFaq&&<a href="#questions">Common questions</a>}{hasSources&&<a href="#sources">Further reading</a>}</nav></details><div className="reading-progress" aria-label="Reading progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}><span style={{width:progress+'%'}}/></div><button className="reading-copy" onClick={copy}>{copied?<Check size={17}/>:<LinkIcon size={17}/>}<span>{copied?'Link copied':'Copy link'}</span></button>{error&&<p className="reading-copy-error" role="status">Copy the page address from your browser.</p>}</aside>;
}
