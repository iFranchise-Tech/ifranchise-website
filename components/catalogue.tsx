'use client';
import {useEffect,useState} from 'react';

import {filterBrands,catalogueOptions} from '../lib/catalogue.mjs';
import {BrandCard} from './ui';
import {Icon} from './icons';
import {CatalogueSearch} from './catalogue-search';

const defaults={query:'',sector:'all',budget:'all',model:'all',sort:'featured'};
export function Catalogue({brands,industries=[]}:{brands:any[];industries?:any[]}){
 const {sectors,budgets,models,suggestions}=catalogueOptions(brands);
 const [expanded,setExpanded]=useState(false);
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
 return <section className="opportunity-browser" id="catalogue" aria-label="Browse franchise opportunities">
  <div className="opportunity-filter-heading"><h2>Find a franchise</h2><button className="filter-toggle" type="button" aria-expanded={expanded} aria-controls="opportunity-filter-fields" onClick={()=>setExpanded(v=>!v)}>{expanded?'Fewer filters':'Filters'} <span aria-hidden="true">{expanded?'−':'+'}</span></button><a href="/guides/franchise-models">Understand the operating models <Icon name="arrow"/></a></div>
  <div className="opportunity-filters">
   <div id="opportunity-filter-fields" className={'opportunity-filter-fields'+(expanded?' is-expanded':'')}>
    <CatalogueSearch value={query} onChange={value=>change('query',value)} suggestions={suggestions}/>
    <div className="opportunity-field"><label htmlFor="sector-filter">Sector</label><select id="sector-filter" value={sector} onChange={e=>change('sector',e.target.value)}><option value="all">All sectors</option>{sectors.map(s=><option key={s}>{s}</option>)}</select></div>
    <div className="opportunity-field"><label htmlFor="budget-filter">Starting investment</label><select id="budget-filter" value={budget} onChange={e=>change('budget',e.target.value)}><option value="all">Any investment</option>{budgets.map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></div>
    <div className="opportunity-field"><label htmlFor="model-filter">Operating model</label><select id="model-filter" value={model} onChange={e=>change('model',e.target.value)}><option value="all">All models</option>{models.map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></div>
   </div>

  </div>
  <div className="opportunity-results"><p role="status" aria-live="polite"><strong>{result.length}</strong> {result.length===1?'opportunity':'opportunities'}{selected.length?(result.length===1?' matches your search':' match your search'):''}</p><div><label htmlFor="sort-brands">Sort by</label><select id="sort-brands" value={sort} onChange={e=>change('sort',e.target.value)}><option value="featured">Recommended order</option><option value="name">Name: A–Z</option><option value="investment">Investment: low to high</option></select></div></div>
  {result.length?<div className="opportunity-grid">{result.map((b:typeof brands[number])=><BrandCard brand={b} key={b.slug}/>)}</div>:<div className="opportunity-empty"><Icon name="search"/><h2>No matching opportunities</h2><p>Try a different sector, investment range or operating model.</p><button className="button" onClick={reset}>Reset filters <Icon name="arrow"/></button><a href="/contact-us?journey=investor">Get help choosing a franchise <Icon name="arrow"/></a></div>}
  <p className="opportunity-note">Investments are indicative. Ask us about the full cost, available locations and current terms.{budget!=='all'&&' Brands without a confirmed starting investment are excluded from this filter.'}</p>
 </section>;
}
