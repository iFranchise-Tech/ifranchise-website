import {EmptyState} from './empty-state';
import {History} from 'lucide-react';
import {activityDisplay} from '../../lib/cms/activity.mjs';

type ActivityEvent={id:string|number;record_id?:string;action:string;actor?:string;note?:string;created_at:string;display?:ReturnType<typeof activityDisplay>};

export function ActivityList({events}:{events:ActivityEvent[]}) {
 return <section className="cms-panel cms-scroll-panel">
  <div className="cms-scroll-body cms-activity-list" tabIndex={0} aria-label="Recent activity">
   {events.length?<ol>{events.map(event=>{
    const display=event.display||activityDisplay(event),date=new Date(event.created_at),valid=!Number.isNaN(date.valueOf());
    return <li className="cms-activity-entry" key={event.id}>
     <span className="cms-activity-dot" aria-hidden="true"/>
     <div><strong>{display.action}</strong><p><span className="cms-activity-module">{display.module}</span><span aria-hidden="true"> · </span>{display.target}</p>
      <div className="cms-activity-actor">{display.actorName&&<span>{display.actorName}</span>}<span>{display.actorEmail||'Actor unavailable'}</span></div>
      {display.detail&&<p>{display.detail}</p>}
     </div>
     <time dateTime={valid?date.toISOString():undefined}>{valid?date.toLocaleString():'Time unavailable'}</time>
    </li>;
   })}</ol>:<EmptyState icon={<History size={32}/>} title="No activity yet"/>}
  </div>
 </section>;
}
