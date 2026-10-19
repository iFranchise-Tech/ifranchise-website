'use client';
import {useEffect,useRef,useState} from 'react';

// An abstract location network: decorative, with no map, brand, or availability claims.
export function ExpansionBackground(){
 const root=useRef<HTMLDivElement>(null),[size,setSize]=useState({width:1440,height:650}),[visible,setVisible]=useState(true);
 useEffect(()=>{
  const element=root.current;if(!element)return;
  const resize=new ResizeObserver(([entry])=>{const {width,height}=entry.contentRect;if(width&&height)setSize({width,height});});
  const intersection=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));
  resize.observe(element);intersection.observe(element);
  return()=>{resize.disconnect();intersection.disconnect();};
 },[]);
 const {width:w,height:h}=size,compact=w<700;
 const points=(compact?[[.06,.15],[.66,.05],[.94,.21],[.11,.48],[.94,.55],[.10,.88],[.39,.94],[.84,.88],[.53,.72]]:[[.04,.26],[.18,.09],[.39,.04],[.70,.08],[.91,.20],[.98,.46],[.86,.69],[.72,.90],[.45,.95],[.22,.83],[.04,.67],[.17,.49]]).map(([x,y])=>({x:x*w,y:y*h}));
 const hub={x:w*.52,y:h*.79};
 const routes=points.map((point,i)=>{const bend=(i%2?1:-1)*(compact?35:75);return `M ${hub.x} ${hub.y} C ${hub.x+bend} ${hub.y-(h*.25)} ${point.x-bend} ${point.y+(h*.18)} ${point.x} ${point.y}`;});
 const r=compact?10:16;
 return <div ref={root} className="expansion-background" aria-hidden="true" data-visible={visible}>
  <div className="expansion-light expansion-light-one"/><div className="expansion-light expansion-light-two"/>
  <svg className="expansion-network" viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" focusable="false">
   <defs><linearGradient id="expansion-route" x1="0" y1="1" x2="1" y2="0"><stop stopColor="var(--palette-718)" stopOpacity=".12"/><stop offset=".55" stopColor="var(--palette-719)" stopOpacity=".5"/><stop offset="1" stopColor="var(--palette-720)" stopOpacity=".18"/></linearGradient><linearGradient id="expansion-signal"><stop stopColor="var(--palette-721)" stopOpacity="0"/><stop offset=".75" stopColor="var(--palette-722)" stopOpacity=".8"/><stop offset="1" stopColor="var(--palette-723)"/></linearGradient><radialGradient id="expansion-node"><stop stopColor="var(--palette-724)" stopOpacity=".23"/><stop offset="1" stopColor="var(--palette-724)" stopOpacity="0"/></radialGradient></defs>
   <g fill="none" stroke="url(#expansion-route)" strokeWidth="1">{routes.map((d,i)=><path key={i} d={d}/>)}</g>
   <g fill="none" stroke="var(--palette-725)" strokeOpacity=".13" strokeWidth="1">{[.18,.42,.67,.93].map((n,i)=><path key={n} d={`M ${-w*.1} ${h*n} C ${w*.22} ${h*(n-.28)} ${w*.65} ${h*(n+.25)} ${w*1.12} ${h*(n-.12)}`}/>)}</g>
   {routes.map((d,i)=><path key={'trail'+i} className="expansion-trail" d={d} pathLength="1000" fill="none" stroke="url(#expansion-signal)" strokeWidth={compact?1.4:1.8} strokeLinecap="round" style={{animationDelay:`-${i*2.9}s`,animationDuration:`${22+i%4*3}s`}}/>)}
   {points.map((point,i)=><g key={'location'+i} transform={`translate(${point.x},${point.y})`}>
    <circle r={r*3.7} fill="url(#expansion-node)" className="expansion-node-glow" style={{animationDelay:`-${i*1.7}s`}}/>
    <rect x={-r} y={-r} width={r*2} height={r*2} rx="4" fill="var(--palette-726)" stroke="var(--palette-727)" strokeOpacity=".45"/>
    <path d={`M ${-r*.52} ${r*.46} V ${-r*.46} H ${r*.5} V ${r*.46} M ${-r*.52} 0 H ${r*.5} M 0 0 V ${r*.46}`} fill="none" stroke="var(--palette-728)" strokeWidth="1" strokeOpacity=".64"/>
    <path d={`M ${-r-6} ${-r*.45} V ${-r-6} H ${-r*.45} M ${r+6} ${r*.45} V ${r+6} H ${r*.45}`} fill="none" stroke="var(--palette-729)" strokeOpacity=".24"/>
   </g>)}
   <g transform={`translate(${hub.x},${hub.y})`}><circle r={r*5} fill="url(#expansion-node)"/><rect x={-r*.95} y={-r*.95} width={r*1.9} height={r*1.9} rx="5" fill="var(--palette-730)" stroke="var(--palette-731)" strokeOpacity=".6"/><rect x={-r*.28} y={-r*.28} width={r*.56} height={r*.56} rx="2" fill="var(--palette-732)"/></g>
  </svg>
  <div className="expansion-readable"/>
 </div>;
}
