'use client';
import {useEffect,useState} from 'react';
// Keep suggestions inside scrollable dialogs and the visible mobile viewport.
export function useContactPopover(anchor:React.RefObject<HTMLDivElement|null>,open:boolean,desiredHeight:number){
 const [placement,setPlacement]=useState<React.CSSProperties>({});
 useEffect(()=>{
  if(!open)return;
  function measure(){
   const el=anchor.current;if(!el)return;const r=el.getBoundingClientRect(),viewport=window.visualViewport;
   let top=viewport?.offsetTop||0,bottom=top+(viewport?.height||innerHeight);
   for(let parent=el.parentElement;parent;parent=parent.parentElement){
    if(/auto|scroll|hidden|clip/.test(getComputedStyle(parent).overflowY)){const bounds=parent.getBoundingClientRect();top=Math.max(top,bounds.top);bottom=Math.min(bottom,bounds.bottom);}
   }
   const above=r.top-top-10,below=bottom-r.bottom-10,up=below<desiredHeight&&above>below;
   const height=Math.max(60,Math.min(desiredHeight,up?above:below));
   setPlacement({top:up?'auto':'calc(100% + 6px)',bottom:up?'calc(100% + 6px)':'auto',maxHeight:height,'--contact-panel-height':height+'px'} as React.CSSProperties);
  }
  measure();window.addEventListener('resize',measure);window.addEventListener('scroll',measure,true);window.visualViewport?.addEventListener('resize',measure);
  return()=>{window.removeEventListener('resize',measure);window.removeEventListener('scroll',measure,true);window.visualViewport?.removeEventListener('resize',measure)};
 },[anchor,open,desiredHeight]);
 return placement;
}
