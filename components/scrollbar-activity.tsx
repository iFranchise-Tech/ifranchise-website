'use client';
import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent,type KeyboardEvent as ReactKeyboardEvent} from 'react';
import {scrollbarGeometry,scrollFromThumb} from '../lib/scrollbar.mjs';
/** Overlay the page thumb without reserving a strip beside full-bleed imagery. */
export function ScrollbarActivity(){
 const [enabled,setEnabled]=useState(false),[metrics,setMetrics]=useState({height:0,top:0,max:0,travel:0,viewport:0,scroll:0}),[dragging,setDragging]=useState(false),drag=useRef<{id:number;y:number;scroll:number}|null>(null),track=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const root=document.documentElement,timers=new Map<Element,ReturnType<typeof setTimeout>>(),query=matchMedia('(hover:hover) and (pointer:fine)'),forced=matchMedia('(forced-colors:active)');let frame=0;
  const update=()=>{frame=0;const active=query.matches&&!forced.matches;setEnabled(active);root.classList.toggle('has-overlay-scrollbar',active);const viewport=root.clientHeight,scroll=window.scrollY;const geometry=scrollbarGeometry(viewport,root.scrollHeight,scroll);setMetrics({...geometry,viewport,scroll});if(track.current)track.current.hidden=!geometry.max||getComputedStyle(document.body).overflow==='hidden';};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  function scrolling(event:Event){const el=event.target===document?root:event.target;if(!(el instanceof Element))return;el.classList.add('is-scrolling');clearTimeout(timers.get(el));timers.set(el,setTimeout(()=>{el.classList.remove('is-scrolling');timers.delete(el)},1100));if(el===root)schedule()}
  const resize=new ResizeObserver(schedule);resize.observe(document.body);resize.observe(root);
  const locks=new MutationObserver(schedule);locks.observe(document.body,{attributes:true,attributeFilter:['style']});
  update();document.addEventListener('scroll',scrolling,{capture:true,passive:true});window.addEventListener('resize',schedule);query.addEventListener('change',schedule);forced.addEventListener('change',schedule);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();locks.disconnect();document.removeEventListener('scroll',scrolling,true);window.removeEventListener('resize',schedule);query.removeEventListener('change',schedule);forced.removeEventListener('change',schedule);root.classList.remove('has-overlay-scrollbar');for(const [el,timer] of timers){clearTimeout(timer);el.classList.remove('is-scrolling')}};
 },[]);
 const jump=(value:number)=>window.scrollTo({top:Math.max(0,Math.min(metrics.max,value)),behavior:'instant'});
 const down=(event:ReactPointerEvent<HTMLDivElement>)=>{if(!event.isPrimary||event.button!==0)return;event.preventDefault();
  // Pointer dragging must not retain :focus-visible and defeat the idle fade.
  // Tab navigation still focuses the control for accessible keyboard scrolling.
  event.currentTarget.blur();event.currentTarget.setPointerCapture(event.pointerId);if((event.target as HTMLElement).dataset.scrollThumb===undefined){jump(scrollFromThumb(event.clientY-metrics.height/2,metrics.max,metrics.travel));return}drag.current={id:event.pointerId,y:event.clientY,scroll:window.scrollY};setDragging(true)};
 const move=(event:ReactPointerEvent<HTMLDivElement>)=>{const active=drag.current;if(!active||active.id!==event.pointerId)return;event.preventDefault();jump(active.scroll+scrollFromThumb(event.clientY-active.y,metrics.max,metrics.travel))};
 const end=(event:ReactPointerEvent<HTMLDivElement>)=>{drag.current=null;setDragging(false);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)};
 const key=(event:ReactKeyboardEvent<HTMLDivElement>)=>{const delta=event.key==='ArrowUp'?-40:event.key==='ArrowDown'?40:event.key==='PageUp'?-metrics.viewport*.85:event.key==='PageDown'?metrics.viewport*.85:null;if(delta!==null||['Home','End'].includes(event.key)){event.preventDefault();jump(event.key==='Home'?0:event.key==='End'?metrics.max:window.scrollY+delta!)}};
 if(!enabled||!metrics.max)return null;
 return <div ref={track} className={'page-scrollbar'+(dragging?' is-dragging':'')} role="scrollbar" tabIndex={0} aria-label="Scroll page" aria-controls="main" aria-orientation="vertical" aria-valuemin={0} aria-valuemax={Math.round(metrics.max)} aria-valuenow={Math.round(Math.min(metrics.max,metrics.scroll))} onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={()=>{drag.current=null;setDragging(false)}} onKeyDown={key}><span data-scroll-thumb="" style={{height:metrics.height,transform:`translateY(${metrics.top}px)`}}/></div>;
}
