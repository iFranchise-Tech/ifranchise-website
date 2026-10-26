'use client';
import {useEffect,useState} from 'react';
import {ArrowUpRight,Search,FileText} from 'lucide-react';
import {ResourceCard} from './resource-card';
import {resourceCategories,filterResources} from '../lib/resource-categories.mjs';

const tabs=[['all','All resources','/resources'],['blogs','Blogs','/resources/blogs'],['articles','Articles','/resources/articles'],['videos','Videos','/resources/videos'],['saved','Saved resources','/resources/saved']];
export function ResourceTabs({mode,category='all'}:{mode:string;category?:string}){
 return <nav className="resource-tabs" aria-label="Resource types">{tabs.map(([key,label,href])=><a href={href+(category!=='all'&&['all','blogs','articles'].includes(key)?'?category='+category+'#resource-library':'')} key={key} aria-current={mode===key?'page':undefined}>{label}</a>)}</nav>;
}

export function ResourceLibrary({items,mode='all',initialCategory='all'}:{items:any[];mode?:string;initialCategory?:string}){

 const [query,setQuery]=useState(''),[category,setCategory]=useState(initialCategory),[topic,setTopic]=useState('all'),[page,setPage]=useState(1);
 const [hydrated,setHydrated]=useState(false);
 useEffect(()=>{const restore=()=>{const q=new URLSearchParams(location.search);setQuery(q.get('q')||'');setTopic(q.get('topic')||'all');setPage(Math.max(1,parseInt(q.get('page')||'1')||1));setCategory(resourceCategories.some(c=>c.id===q.get('category'))?q.get('category')!:'all')};restore();setHydrated(true);window.addEventListener('popstate',restore);return()=>window.removeEventListener('popstate',restore)},[]);
 useEffect(()=>{if(!hydrated)return;const url=new URL(location.href);for(const [key,value] of Object.entries({q:query,topic:topic==='all'?'':topic,category:category==='all'?'':category,page:page===1?'':String(page)})){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key)}history.replaceState(history.state,'',url.pathname+url.search+url.hash)},[query,topic,category,page,hydrated]);
 const categorised=['all','blogs','articles'].includes(mode);
 const categoryItems=filterResources(items,{category:categorised?category:'all'});
 const topics=[...new Set(categoryItems.map((item:any)=>item.category).filter(Boolean))].sort() as string[];
 const list=filterResources(items,{category:categorised?category:'all',topic,query});
 function chooseCategory(value:string){
  setCategory(value);setTopic('all');setPage(1);

 }
 const totalPages=Math.max(1,Math.ceil(list.length/12)),current=Math.min(page,totalPages),start=(current-1)*12;
 function turn(value:number){setPage(value);document.getElementById('resource-library')?.scrollIntoView({block:'start',behavior:'auto'})}
 function reset(){chooseCategory('all');setQuery('');setTopic('all');setPage(1);}
 return <>
  <div className="resource-filter-bar"><ResourceTabs mode={mode} category={category}/>
  {categorised&&<div className="resource-categories" role="group" aria-label="Resource categories">
   {[{id:'all',label:'All categories'},...resourceCategories].map(c=><button type="button" key={c.id} aria-pressed={category===c.id} onClick={()=>chooseCategory(c.id)}>{c.label}<span>{filterResources(items,{category:c.id}).length}</span></button>)}
  </div>}
  <div className="resource-tools">
   <label className="resource-search"><Search size={20}/><input type="search" aria-label="Search resources" placeholder="Search resources" value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}}/></label>
   {categorised&&<select aria-label="Filter by topic" value={topic} onChange={e=>{setTopic(e.target.value);setPage(1)}}><option value="all">All topics</option>{topics.map(value=><option key={value} value={value}>{value}</option>)}</select>}
  </div>
  </div>
  <>
   <div className="resource-results"><span role="status" aria-live="polite">{list.length>0?`${start+1}–${Math.min(start+12,list.length)} of ${list.length}`:0} {mode==='blogs'?(list.length===1?'blog':'blogs'):mode==='articles'?(list.length===1?'article':'articles'):(list.length===1?'resource':'resources')}{category!=='all'&&categorised?' · '+resourceCategories.find(c=>c.id===category)?.label:''}</span>{(query||category!=='all'||topic!=='all')&&<button type="button" onClick={reset}>Clear filters</button>}</div>
   <div className="journal-grid">{list.slice(start,start+12).map((a:any)=><ResourceCard item={a} key={a.path}/>)}</div>
   {!list.length&&<div className="resource-empty"><FileText size={32}/><h2>{query||category!=='all'||topic!=='all'?'No matching resources':mode==='videos'?'Franchising videos':'No resources yet'}</h2><p>{query||category!=='all'||topic!=='all'?'Try another category or clear your filters.':mode==='videos'?'Our upcoming YouTube videos will appear here. Explore our articles in the meantime.':'New posts will appear here.'}</p>{query||category!=='all'||topic!=='all'?<button type="button" className="p-button" onClick={reset}>Clear filters</button>:<a className="p-link" href="/resources/articles">Explore articles <ArrowUpRight size={18}/></a>}</div>}
   {totalPages>1&&<nav className="resource-pagination" aria-label="Resource pages"><button disabled={current===1} onClick={()=>turn(current-1)}>Previous</button>{Array.from({length:totalPages},(_,i)=>i+1).filter(n=>n===1||n===totalPages||Math.abs(n-current)<=1).map((n,i,nums)=><span key={n}>{i>0&&n-nums[i-1]>1&&<span aria-hidden="true"> … </span>}<button aria-label={'Page '+n} aria-current={current===n?'page':undefined} onClick={()=>turn(n)}>{n}</button></span>)}<button disabled={current===totalPages} onClick={()=>turn(current+1)}>Next</button></nav>}
  </>
 </>;
}
