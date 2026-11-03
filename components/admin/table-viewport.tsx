import type {ReactNode} from 'react';

// One native table keeps column widths identical while its header sticks inside
// the same scroll region. Controls and pagination belong outside this viewport.
export function TableViewport({label,children,emptyState,className=''}:{label:string;children?:ReactNode;emptyState?:ReactNode;className?:string}) {
 return <div className={'cms-table-wrap cms-scroll-body cms-table-viewport'+(emptyState?' is-empty':'')+(className?' '+className:'')} role="region" tabIndex={0} aria-label={label}>
  {children}{emptyState}
 </div>;
}
