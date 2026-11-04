'use client';

import {useState} from 'react';
import {Plus} from 'lucide-react';
import {ResourceTabs} from './resource-library';

type FAQGroup={id:string;title:string;description:string;questions:{q:string;a:string}[]};

export function FAQLibrary({groups}:{groups:FAQGroup[]}){
 const [category,setCategory]=useState('all');
 const total=groups.reduce((count,group)=>count+group.questions.length,0);
 const filters=[{id:'all',title:'All categories',count:total},...groups.map(group=>({id:group.id,title:group.title,count:group.questions.length}))];
 const visible=category==='all'?groups:groups.filter(group=>group.id===category);
 const count=visible.reduce((total,group)=>total+group.questions.length,0);

 return <>
  <div className="resource-filter-bar">
   <ResourceTabs mode="faq"/>
   <div className="resource-categories" role="group" aria-label="FAQ categories">
    {filters.map(filter=><button type="button" key={filter.id} aria-pressed={category===filter.id} aria-controls="faq-results" onClick={()=>setCategory(filter.id)}>{filter.title}<span>{filter.count}</span></button>)}
   </div>
  </div>
  <div className="resource-results"><span role="status" aria-live="polite">{count} questions{category!=='all'?' · '+visible[0].title:''}</span>{category!=='all'&&<button type="button" onClick={()=>setCategory('all')}>Clear filter</button>}</div>
  <div id="faq-results">
   {visible.map(group=><section className="p-faq-section faq-page-group" aria-labelledby={'faq-'+group.id} key={group.id}>
    <div><h2 id={'faq-'+group.id}>{group.title}</h2><p>{group.description}</p></div>
    <div className="p-questions">{group.questions.map(question=><details key={question.q}><summary>{question.q}<Plus size={20}/></summary><p>{question.a}</p></details>)}</div>
   </section>)}
  </div>
 </>;
}
