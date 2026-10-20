'use client';
import {useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Maximize2,X} from 'lucide-react';

export function BrandShowcase({name,images}:{name:string;images:string[]}){
 const [selected,setSelected]=useState(0);
 const dialog=useRef<HTMLDialogElement>(null);
 const move=(direction:number)=>setSelected(current=>(current+direction+images.length)%images.length);
 const open=()=>dialog.current?.showModal();
 return <div className="brand-showcase">
  <div className="showcase-stage">
   <img src={images[selected]} alt={`${name} — gallery image ${selected+1}`} width="1200" height="800" fetchPriority={selected===0?'high':'auto'}/>
   <button className="showcase-enlarge" type="button" onClick={open} aria-label={`Enlarge ${name} gallery image ${selected+1}`}><Maximize2 size={15}/><span>View image</span></button>
   <div className="showcase-controls"><span aria-live="polite">{String(selected+1).padStart(2,'0')} <i>/</i> {String(images.length).padStart(2,'0')}</span>{images.length>1&&<><button type="button" onClick={()=>move(-1)} aria-label="Previous gallery image"><ArrowLeft size={18}/></button><button type="button" onClick={()=>move(1)} aria-label="Next gallery image"><ArrowRight size={18}/></button></>}</div>
  </div>
  {images.length>1&&<div className="showcase-thumbnails" aria-label="Choose a gallery image">{images.map((image,index)=><button type="button" key={image} aria-label={`Show gallery image ${index+1}`} aria-pressed={selected===index} onClick={()=>setSelected(index)}><img src={image} alt="" width="100" height="70" loading="lazy"/></button>)}</div>}
  <dialog ref={dialog} className="showcase-dialog" aria-label={`${name} image gallery`} onClick={event=>{if(event.target===dialog.current)dialog.current?.close();}} onKeyDown={event=>{if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}if(event.key==='ArrowRight'){event.preventDefault();move(1);}}}>
   <div className="showcase-dialog-header"><span>{name}</span><button type="button" onClick={()=>dialog.current?.close()} aria-label="Close gallery"><X size={22}/></button></div>
   <img className="showcase-full-image" src={images[selected]} alt={`${name} — gallery image ${selected+1}`} width="1600" height="1000"/>
   <div className="showcase-dialog-footer">{images.length>1&&<button type="button" onClick={()=>move(-1)} aria-label="Previous enlarged image"><ArrowLeft size={19}/></button>}<span aria-live="polite">{selected+1} / {images.length}</span>{images.length>1&&<button type="button" onClick={()=>move(1)} aria-label="Next enlarged image"><ArrowRight size={19}/></button>}</div>
  </dialog>
 </div>;
}
