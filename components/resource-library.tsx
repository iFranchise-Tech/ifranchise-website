'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {ArrowUpRight,Search,FileText} from 'lucide-react';
import {ResourceCard} from './resource-card';
import {resourceCategories,filterResources} from '../lib/resource-categories.mjs';

const tabs=[['all','All resources','/resources'],['blogs','Blogs','/resources/blogs'],['articles','Articles','/resources/articles'],['faqs','FAQs','/resources/faqs'],['videos','Videos','/resources/videos'],['saved','Saved resources','/resources/saved']];
export function ResourceTabs({mode,category='all'}:{mode:string;category?:string}){
 return <nav className="resource-tabs" aria-label="Resource types">{tabs.map(([key,label,href])=><a href={href+(category!=='all'&&['all','blogs','articles'].includes(key)?'?category='+category+'#resource-library':'')} key={key} aria-current={mode===key?'page':undefined}>{label}</a>)}</nav>;
}

export function ResourceLibrary({items,mode='all',questions=[],initialCategory='all'}:{items:any[];mode?:string;questions?:any[];initialCategory?:string}){
 const router=useRouter();
 const [query,setQuery]=useState(''),[category,setCategory]=useState(initialCategory),[topic,setTopic]=useState('all'),[page,setPage]=useState(1);
 const categorised=['all','blogs','articles'].includes(mode);
 const categoryItems=filterResources(items,{category:categorised?category:'all'});
 const topics=[...new Set(categoryItems.map((item:any)=>item.category).filter(Boolean))].sort() as string[];
 const list=filterResources(items,{category:categorised?category:'all',topic,query});
 const filtered=questions.filter(q=>(q.q+' '+q.a).toLowerCase().includes(query.trim().toLowerCase()));
 function chooseCategory(value:string){
  setCategory(value);setTopic('all');setPage(1);
  const url=new URL(window.location.href);
  if(value==='all')url.searchParams.delete('category');else url.searchParams.set('category',value);
  router.replace(url.pathname+url.search+url.hash,{scroll:false});
 }
 function reset(){chooseCategory('all');setQuery('');setTopic('all');setPage(1);}
 return <>
  <ResourceTabs mode={mode} category={category}/>
  {categorised&&<div className="resource-categories" role="group" aria-label="Resource categories">
   {[{id:'all',label:'All categories'},...resourceCategories].map(c=><button type="button" key={c.id} aria-pressed={category===c.id} onClick={()=>chooseCategory(c.id)}>{c.label}<span>{filterResources(items,{category:c.id}).length}</span></button>)}
  </div>}
  <div className="resource-tools">
   <label className="resource-search"><Search size={20}/><input type="search" aria-label="Search resources" placeholder={mode==='faqs'?'Search your question':'Search resources'} value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}}/></label>
   {categorised&&<select aria-label="Filter by topic" value={topic} onChange={e=>{setTopic(e.target.value);setPage(1)}}><option value="all">All topics</option>{topics.map(value=><option key={value} value={value}>{value}</option>)}</select>}
  </div>
  {mode==='faqs'?<div className="resource-faqs">{filtered.map((f,i)=><details key={i}><summary>{f.q}<span>+</span></summary><p>{f.a}</p></details>)}{!filtered.length&&<p>No matching questions. Try a different search.</p>}</div>:<>
   <div className="resource-results"><span role="status" aria-live="polite">{list.length} {mode==='blogs'?(list.length===1?'blog':'blogs'):mode==='articles'?(list.length===1?'article':'articles'):(list.length===1?'resource':'resources')}{category!=='all'&&categorised?' · '+resourceCategories.find(c=>c.id===category)?.label:''}</span>{(query||category!=='all'||topic!=='all')&&<button type="button" onClick={reset}>Clear filters</button>}</div>
   <div className="journal-grid">{list.slice(0,page*12).map((a:any)=><ResourceCard item={a} key={a.path}/>)}</div>
   {!list.length&&<div className="resource-empty"><FileText size={32}/><h2>{query||category!=='all'||topic!=='all'?'No matching resources':mode==='videos'?'Franchising videos':'No resources yet'}</h2><p>{query||category!=='all'||topic!=='all'?'Try another category or clear your filters.':mode==='videos'?'Our upcoming YouTube videos will appear here. Explore the articles and FAQs in the meantime.':'New posts will appear here.'}</p>{query||category!=='all'||topic!=='all'?<button type="button" className="p-button" onClick={reset}>Clear filters</button>:<a className="p-link" href="/resources/articles">Explore articles <ArrowUpRight size={18}/></a>}</div>}
   {list.length>page*12&&<button className="p-button resource-more" onClick={()=>setPage(page+1)}>Load more</button>}
  </>}
 </>;
}
