import type {ReactNode} from 'react';

export function Pagination({count,page,totalPages,disabled=false,onPage}:{count:ReactNode;page:number;totalPages:number;disabled?:boolean;onPage:(page:number)=>void}){
 return <nav className="cms-pagination cms-compact-pagination" aria-label="Pagination">
  <span className="cms-pagination-count">{count}</span>
  <div className="cms-pagination-controls"><span aria-live="polite">Page {page} of {totalPages}</span><button type="button" className="cms-button" disabled={disabled||page<=1} onClick={()=>onPage(page-1)}>Previous</button><button type="button" className="cms-button" disabled={disabled||page>=totalPages} onClick={()=>onPage(page+1)}>Next</button></div>
 </nav>;
}
