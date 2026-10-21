import {ArrowUpRight,BookOpen,MessagesSquare,Play} from 'lucide-react';
import {EditorialCover} from './editorial-cover';

export function ResourceCard({item:a}:{item:any}){
 return <a className="journal-card" href={a.path}>
  <div className="journal-card-art">
   {a.image?<EditorialCover src={a.image} alt={a.imageAlt||''} loading="lazy"/>:<div className="journal-card-placeholder">{a.type==='Video'?<Play size={42}/>:a.type==='FAQs'?<MessagesSquare size={42}/>:<BookOpen size={42}/>}</div>}
   {a.type==='Video'&&<span className="journal-play"><Play size={20}/></span>}
  </div>
  <div className="journal-card-copy">
   <div className="journal-meta"><span>{a.type||'Article'}</span><span>{a.minutes?`${a.minutes} min read`:a.category||''}</span></div>
   <h2>{a.title}</h2><p>{a.excerpt}</p>
   <span className="journal-card-action">{a.actionLabel||(a.type==='Video'?'Watch video':a.type==='FAQs'?'Explore answers':a.type==='Blog'?'Read blog':'Read article')}<ArrowUpRight size={19}/></span>
  </div>
 </a>;
}
