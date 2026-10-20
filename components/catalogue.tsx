'use client';
import {useEffect,useState} from 'react';
import {SlidersHorizontal,ChevronDown,ArrowUpRight,X} from 'lucide-react';

import {filterBrands} from '../lib/catalogue.mjs';
import {BrandCard} from './ui';
import {Icon} from './icons';

const budgets=[['25','Up to ₹25 lakh'],['50','Up to ₹50 lakh'],['100','Up to ₹1 crore'],['250','Up to ₹2.5 crore'],['500','Up to ₹5 crore'],['1000','Up to ₹10 crore']];
const models=['FOFO','FOCO','FICO','COCO','Unit Franchise','Master Franchise','Area Development'].map(v=>[v.toUpperCase(),v]);
const defaults={query:'',sector:'all',budget:'all',model:'all',sort:'featured'};
export function Catalogue({brands,industries=[]}:{brands:any[];industries?:any[]}){
 const sectors=[...new Set([...industries.map(i=>i.title),...brands.map(b=>b.category)])].sort();
 const [filtersOpen,setFiltersOpen]=useState(false);
 const [filters,setFilters]=useState(defaults),[ready,setReady]=useState(false);
 const {query,sector,budget,model,sort}=filters;
 useEffect(()=>{
  const restore=()=>{const p=new URLSearchParams(location.search);setFilters({query:(p.get('q')||'').slice(0,120),sector:sectors.includes(p.get('sector')||'')?p.get('sector')!:'all',budget:budgets.some(([v])=>v===p.get('budget'))?p.get('budget')!:'all',model:models.some(([v])=>v===p.get('model'))?p.get('model')!:'all',sort:['investment','name'].includes(p.get('sort')||'')?p.get('sort')!:'featured'});setReady(true);};
  restore();window.addEventListener('popstate',restore);return()=>window.removeEventListener('popstate',restore);
 },[]);
 useEffect(()=>{if(!ready)return;const u=new URL(location.href);for(const [key,value] of Object.entries(filters)){const param=key==='query'?'q':key;if(value===defaults[key as keyof typeof defaults])u.searchParams.delete(param);else u.searchParams.set(param,value);}history.replaceState(history.state,'',u.pathname+u.search+u.hash);},[filters,ready]);
 const change=(key:keyof typeof defaults,value:string)=>setFilters(f=>({...f,[key]:value}));
 const result=filterBrands(brands,filters);
 const selected=[query&&{key:'query',label:'Search: '+query},sector!=='all'&&{key:'sector',label:sector},budget!=='all'&&{key:'budget',label:budgets.find(([v])=>v===budget)?.[1]},model!=='all'&&{key:'model',label:models.find(([v])=>v===model)?.[1]}].filter(Boolean) as {key:keyof typeof defaults;label:string}[];
 function reset(){setFilters(f=>({...defaults,sort:f.sort}));}
 return <section className="directory-browser" id="catalogue" aria-label="Browse franchise opportunities">
 <aside className={'directory-filter-panel '+(filtersOpen?'is-open':'')}><button className="directory-filter-toggle" onClick={()=>setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen} aria-controls="directory-filter-fields"><SlidersHorizontal size={18}/><span>Filters{selected.length?` (${selected.length})`:''}</span><ChevronDown size={18}/></button><div className="directory-filter-heading"><h2>Filter opportunities</h2>{selected.length>0&&<button onClick={reset}>Reset</button>}</div><div className="directory-filter-fields" id="directory-filter-fields">
 <div className="directory-field"><label htmlFor="sector-filter">Industry</label><select id="sector-filter" value={sector} onChange={e=>change('sector',e.target.value)}><option value="all">All industries</option>{sectors.map(s=><option key={s}>{s}</option>)}</select></div>
 <div className="directory-field"><label htmlFor="budget-filter">Starting investment</label><select id="budget-filter" value={budget} onChange={e=>change('budget',e.target.value)}><option value="all">Any investment</option>{budgets.map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></div>
 <div className="directory-field"><label htmlFor="model-filter">Operating model</label><select id="model-filter" value={model} onChange={e=>change('model',e.target.value)}><option value="all">All models</option>{models.map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></div>
 <a className="directory-model-link" href="/guides/franchise-models">Understand the models<ArrowUpRight size={16}/></a><button className="directory-filter-done" onClick={()=>setFiltersOpen(false)}>Show {result.length} {result.length===1?'opportunity':'opportunities'}</button></div><div className="directory-advice"><h3>Discuss your shortlist</h3><p>Talk through the requirements and questions that matter to you.</p><a href="/contact-us?journey=investor">Contact us <ArrowUpRight size={17}/></a></div></aside>
 <div className="directory-results"><label className="directory-search"><Icon name="search"/><input type="search" id="brand-search" aria-label="Search franchise opportunities" placeholder="Search a brand or industry" maxLength={120} value={query} onChange={e=>change('query',e.target.value)}/></label><div className="directory-results-heading"><p role="status" aria-live="polite"><strong>{result.length}</strong> {result.length===1?'opportunity':'opportunities'}</p><label><span>Sort by</span><select aria-label="Sort opportunities" id="sort-brands" value={sort} onChange={e=>change('sort',e.target.value)}><option value="featured">Recommended</option><option value="name">Name: A–Z</option><option value="investment">Investment: low to high</option></select></label></div>
 {selected.length>0&&<div className="directory-selections" aria-label="Active filters">{selected.map(f=><button key={f.key} onClick={()=>change(f.key,defaults[f.key])} aria-label={'Remove '+f.label+' filter'}>{f.label}<X size={13}/></button>)}<button onClick={reset}>Clear all</button></div>}
 {result.length?<div className="directory-grid">{result.map((b:typeof brands[number])=><BrandCard brand={b} key={b.slug}/>)}</div>:<div className="directory-empty"><Icon name="search"/><h2>No matching opportunities</h2><p>Try a different industry, investment range or operating model.</p><button className="p-button" onClick={reset}>Reset filters<ArrowUpRight size={18}/></button></div>}
 <p className="directory-note">Investments are indicative. Confirm the complete project cost, available locations and current terms with each brand.{budget!=='all'&&' Brands without a confirmed starting investment are excluded from this filter.'}</p></div>
 </section>;
}
