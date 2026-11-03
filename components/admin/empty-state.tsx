import type {ReactNode} from 'react';

export function EmptyState({icon,title,description,heading:Heading='h3'}:{icon?:ReactNode;title:string;description?:ReactNode;heading?:'h2'|'h3'}) {
 return <div className="cms-empty cms-empty-state"><div className="cms-empty-content">
  {icon&&<span className="cms-empty-symbol" aria-hidden="true">{icon}</span>}
  <Heading>{title}</Heading>
  {description&&<p>{description}</p>}
 </div></div>;
}
