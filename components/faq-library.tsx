'use client';

import {useState} from 'react';
import {ArrowUpRight,Plus} from 'lucide-react';
import {ResourceTabs} from './resource-library';

type FAQGroup={id:string;title:string;description:string;questions:{q:string;a:string}[]};

export function FAQLibrary({groups}:{groups:FAQGroup[]}){
 const [category,setCategory]=useState(groups[0]?.id);
 const filters=groups.map(group=>({id:group.id,title:group.title,count:group.questions.length}));
 const visible=groups.filter(group=>group.id===category);

 return <>
  <div className="resource-filter-bar">
   <ResourceTabs mode="faq"/>
   <div className="resource-categories" role="group" aria-label="FAQ categories">
    {filters.map(filter=><button type="button" key={filter.id} aria-pressed={category===filter.id} aria-controls="faq-results" onClick={()=>setCategory(filter.id)}>{filter.title}<span>{filter.count}</span></button>)}
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
    {visible.map(group=><section className="p-questions" aria-label={group.title} key={group.id}>
     {group.questions.map(question=><details key={question.q}><summary>{question.q}<Plus size={20} aria-hidden="true"/></summary><p>{question.a}</p></details>)}
    </section>)}
   </div>
  </div>
 </>;
}
