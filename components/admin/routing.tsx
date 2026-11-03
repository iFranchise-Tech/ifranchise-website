'use client';
import {useCallback,useEffect,useRef} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import {useConfirmation} from './confirmation';
import {safeAdminReturnPath,withAdminQuery} from '../../lib/cms/routes.mjs';

export function useAdminRouting(dirty:boolean){
 const pathname=usePathname(),search=useSearchParams().toString(),confirm=useConfirmation();
 const current=useRef({url:'',index:0}),dirtyRef=useRef(dirty),confirmRef=useRef(confirm);
 useEffect(()=>{dirtyRef.current=dirty;confirmRef.current=confirm},[dirty,confirm]);
 useEffect(()=>{
  const url=pathname+(search?'?'+search:'');
  const index=window.history.state?.cmsIndex??current.current.index;
  current.current={url,index};
  if(window.history.state?.cmsIndex!==index)window.history.replaceState({...window.history.state,cmsIndex:index},'',url);
 },[pathname,search]);
 useEffect(()=>{
  let restoring=false,allowed=false;
  function pop(event:PopStateEvent){
   if(restoring){event.stopImmediatePropagation();restoring=false;return}
   if(allowed){allowed=false;return}
   if(!dirtyRef.current)return;
   event.stopImmediatePropagation();
   const delta=(event.state?.cmsIndex??current.current.index-1)-current.current.index;
   if(!delta)return;
   restoring=true;window.history.go(-delta);
   void confirmRef.current({title:'Discard unsaved changes?',message:'Your edits have not been saved. Leave this item and discard them?',confirmLabel:'Discard changes'}).then(ok=>{if(ok){allowed=true;window.history.go(delta)}});
  }
  // The layout installs the bridge before the router starts. Window-level
  // popstate listeners otherwise run in registration order, even with capture.
  const beforePop=(event:Event)=>pop((event as CustomEvent<PopStateEvent>).detail);
  window.addEventListener('cms:history-popstate',beforePop);return()=>window.removeEventListener('cms:history-popstate',beforePop);
 },[]);
 async function go(url:string,{replace=false,confirmed=false}:{replace?:boolean;confirmed?:boolean}={}){
  const safe=safeAdminReturnPath(url);if(safe===current.current.url)return;
  if(!confirmed&&dirtyRef.current&&!await confirm({title:'Discard unsaved changes?',message:'Your edits have not been saved. Leave this item and discard them?',confirmLabel:'Discard changes'}))return;
  const index=current.current.index+(replace?0:1);
  current.current={url:safe,index};
  // These are server-backed CMS routes. The framework's native History API
  // integration updates usePathname without replacing the authenticated shell
  // or refetching an otherwise empty server page. APIs still authorize every read.
  window.history[replace?'replaceState':'pushState']({...window.history.state,cmsIndex:index},'',safe);
 }
 const query=useCallback((changes:Record<string,string|number|null>,push=false)=>{
  const url=withAdminQuery(pathname,window.location.search,changes),index=current.current.index+(push?1:0);
  current.current={url,index};window.history[push?'pushState':'replaceState']({...window.history.state,cmsIndex:index},'',url);
 },[pathname]);
 return {pathname,search,go,query};
}
