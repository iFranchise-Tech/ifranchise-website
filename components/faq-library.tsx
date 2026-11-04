'use client';

import {useState} from 'react';
import {ArrowUpRight,Plus,Search} from 'lucide-react';
import {ResourceTabs} from './resource-library';

type FAQGroup={id:string;title:string;description:string;questions:{q:string;a:string}[]};

export function FAQLibrary({groups}:{groups:FAQGroup[]}){
 const [category,setCategory]=useState(groups[0]?.id);
 const [query,setQuery]=useState('');
 const filters=groups.map(group=>({id:group.id,title:group.title,count:group.questions.length}));
 const search=query.trim().toLowerCase();
 const visible=groups.filter(group=>group.id===category).map(group=>({...group,questions:group.questions.filter(question=>(question.q+' '+question.a).toLowerCase().includes(search))}));
 const hasResults=visible.some(group=>group.questions.length>0);

 return <>
  <div className="resource-filter-bar">
   <ResourceTabs mode="faq"/>
   <div className="resource-categories" role="group" aria-label="FAQ categories">
    {filters.map(filter=><button type="button" key={filter.id} aria-pressed={category===filter.id} aria-controls="faq-results" onClick={()=>setCategory(filter.id)}>{filter.title}<span>{filter.count}</span></button>)}
   </div>
   <div className="resource-tools">
    <label className="resource-search"><Search size={20} aria-hidden="true"/><input type="search" aria-label="Search FAQs" aria-controls="faq-results" placeholder="Search FAQs" value={query} onChange={event=>setQuery(event.target.value)}/></label>
   </div>
  </div>
  <div className="faq-content-layout">
   <a className="faq-contact-card" href="/contact-us" aria-label="Contact us — talk about your franchise plans">
    <img src="/assets/faq/contact-guidance-v1.webp" width={768} height={1152} alt="" loading="lazy" decoding="async"/>
    <div className="faq-contact-copy">
     <span className="faq-contact-eyebrow">Let’s connect</span>
     <h2>Let’s talk about your plans.</h2>
     <p>Get guidance on your franchise journey.</p>
     <span className="faq-contact-button">Contact us <ArrowUpRight size={18} aria-hidden="true"/></span>
    </div>
   </a>
   <div id="faq-results">
    {!hasResults&&<div className="resource-empty"><h2 role="status">No matching questions</h2><p>Try another keyword or FAQ category.</p><button type="button" onClick={()=>setQuery('')}>Clear search</button></div>}
    {hasResults&&visible.map(group=><section className="p-questions" aria-label={group.title} key={group.id}>
     {group.questions.map(question=><details key={question.q}><summary>{question.q}<Plus size={20} aria-hidden="true"/></summary><p>{question.a}</p></details>)}
    </section>)}
   </div>
  </div>
 </>;
}
