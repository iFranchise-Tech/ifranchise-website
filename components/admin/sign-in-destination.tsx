'use client';
import {usePathname,useSearchParams} from 'next/navigation';
import {safeAdminReturnPath} from '../../lib/cms/routes.mjs';
function useDestination(fallback='/admin'){
 const pathname=usePathname(),search=useSearchParams().toString();
 return safeAdminReturnPath((pathname||fallback)+(search?'?'+search:''));
}
export function StaffReturnPath({fallback}:{fallback:string}){
 return <input type="hidden" name="returnPath" value={useDestination(fallback)}/>;
}
export function StaffAccessLink({href,requestUrl,children}:{href:string;requestUrl:string;children:React.ReactNode}){
 const destination=useDestination(),url=new URL(href);
 url.searchParams.set('redirect_url',new URL(destination,requestUrl).toString());
 return <a className="cms-button cms-primary cms-access-action" href={url.toString()} target="_top">{children}</a>;
}
