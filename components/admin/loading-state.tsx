export function LoadingState({label='Loading content',compact=false}:{label?:string;compact?:boolean}){
 return <div className={'cms-skeleton'+(compact?' cms-skeleton-compact':'')} role="status" aria-label={label}><span className="sr-only">{label}</span><div aria-hidden="true"><i/><i/><i/></div></div>;
}
