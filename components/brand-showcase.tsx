'use client';
import {imageStyle,frameStyle} from '../lib/cms/display.mjs';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Maximize2,X} from 'lucide-react';
import {imageSrc,responsiveImage} from '../lib/responsive-image';

const gallerySizes='(max-width: 1023px) 92vw, (max-width: 1500px) 62vw, 860px';
export function BrandShowcase({name,images,presentation={},descriptions={}}:{name:string;images:string[];presentation?:Record<string,any>;descriptions?:Record<string,string>}){
 const [selected,setSelected]=useState(0),[enlarged,setEnlarged]=useState(false);
 const [prepared,setPrepared]=useState(()=>new Set([0]));
 const [loaded,setLoaded]=useState<Set<string>>(()=>new Set());
 const dialog=useRef<HTMLDialogElement>(null),thumbnails=useRef<HTMLDivElement>(null),touch=useRef<{x:number;y:number}|null>(null);
 const move=(direction:number)=>setSelected(current=>(current+direction+images.length)%images.length);
 useEffect(()=>{
  if(!images.length)return;
  // Keep decoded neighbours mounted so clicks never wait for an outgoing animation or a new request.
  setPrepared(current=>{
   const next=new Set(current);
   for(const offset of [-1,0,1,2])next.add((selected+offset+images.length)%images.length);
   return next.size===current.size?current:next;
  });
  const strip=thumbnails.current,button=strip?.children[selected] as HTMLElement|undefined;
  if(strip&&button){const left=button.offsetLeft-strip.offsetLeft;if(left<strip.scrollLeft)strip.scrollTo({left,behavior:'instant'});else if(left+button.offsetWidth>strip.scrollLeft+strip.clientWidth)strip.scrollTo({left:left+button.offsetWidth-strip.clientWidth,behavior:'instant'});}
 },[selected,images.length]);
 if(!images.length)return null;
 const open=()=>{setEnlarged(true);dialog.current?.showModal();};
 const markLoaded=(src:string)=>setLoaded(current=>current.has(src)?current:new Set(current).add(src));
 return <div className="brand-showcase">
  <div className="showcase-stage" style={presentation[images[selected]]?frameStyle(presentation[images[selected]]):undefined} aria-busy={!loaded.has(images[selected])} onTouchStart={event=>{const point=event.touches[0];touch.current={x:point.clientX,y:point.clientY};}} onTouchEnd={event=>{const start=touch.current;touch.current=null;if(!start)return;const point=event.changedTouches[0],dx=point.clientX-start.x,dy=point.clientY-start.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1);}}>
   <img className="showcase-preview" src={imageSrc(images[selected],160)} alt="" aria-hidden="true" width="1200" height="800"/>
   {images.map((src,index)=>(prepared.has(index)||index===selected)&&<img key={src} style={presentation[src]?imageStyle(presentation[src]) as any:undefined} className={'showcase-slide'+(index===selected?' is-active':'')} {...responsiveImage(src,gallerySizes)} alt={index===selected?(descriptions[images[selected]]||`${name} — gallery image ${selected+1}`):''} aria-hidden={index!==selected} width="1200" height="800" fetchPriority={index===selected?'high':'low'} loading="eager" decoding="async" onLoad={()=>markLoaded(src)}/>)}
   <button className="showcase-enlarge" type="button" onClick={open} aria-label={`Enlarge ${name} gallery image ${selected+1}`}><Maximize2 size={15}/><span>View image</span></button>
   <div className="showcase-controls"><span aria-live="polite">{String(selected+1).padStart(2,'0')} <i>/</i> {String(images.length).padStart(2,'0')}</span>{images.length>1&&<><button type="button" onClick={()=>move(-1)} aria-label="Previous gallery image"><ArrowLeft size={18}/></button><button type="button" onClick={()=>move(1)} aria-label="Next gallery image"><ArrowRight size={18}/></button></>}</div>
  </div>
  <div className="profile-gallery-caption"><span>Inside {name}</span><span>{images.length} {images.length===1?'image':'images'} · Select to explore</span></div>
  {images.length>1&&<div ref={thumbnails} className="showcase-thumbnails" aria-label="Choose a gallery image">{images.map((image,index)=><button type="button" key={image} aria-label={`Show gallery image ${index+1}`} aria-pressed={selected===index} onClick={()=>setSelected(index)}><img src={imageSrc(image,160)} alt="" width="100" height="70" loading="lazy" decoding="async"/></button>)}</div>}
  <dialog ref={dialog} className="showcase-dialog" aria-label={`${name} image gallery`} onClose={()=>setEnlarged(false)} onClick={event=>{if(event.target===dialog.current)dialog.current?.close();}} onKeyDown={event=>{if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}if(event.key==='ArrowRight'){event.preventDefault();move(1);}}}>
   <div className="showcase-dialog-header"><span>{name}</span><button type="button" onClick={()=>dialog.current?.close()} aria-label="Close gallery"><X size={22}/></button></div>
   {enlarged&&<div className="showcase-full-stage"><img className="showcase-full-preview" src={imageSrc(images[selected],160)} alt="" aria-hidden="true"/>{images.map((src,index)=>(prepared.has(index)||index===selected)&&<img key={src} className={'showcase-full-image'+(index===selected?' is-active':'')} {...responsiveImage(src,'92vw')} alt={index===selected?(descriptions[images[selected]]||`${name} — gallery image ${selected+1}`):''} aria-hidden={index!==selected} width="1600" height="1000" loading="eager" decoding="async"/>)}</div>}
   <div className="showcase-dialog-footer">{images.length>1&&<button type="button" onClick={()=>move(-1)} aria-label="Previous enlarged image"><ArrowLeft size={19}/></button>}<span aria-live="polite">{selected+1} / {images.length}</span>{images.length>1&&<button type="button" onClick={()=>move(1)} aria-label="Next enlarged image"><ArrowRight size={19}/></button>}</div>
  </dialog>
 </div>;
}
