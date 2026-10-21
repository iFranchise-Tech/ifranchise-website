'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Bookmark,BookmarkCheck,Library,Share2,Link as LinkIcon,Check,X,Mail,Send,ArrowUpRight,MessageCircle} from 'lucide-react';
import {Icon,type IconName} from './icons';
import {SITE} from '../lib/site';
import {readSaved,saveResource,removeResource,updatePosition,READING_KEY,READING_EVENT} from '../lib/reading-list.mjs';
import {sharedResourceUrl,socialShareUrl,shareChannels} from '../lib/resource-sharing.mjs';
import {track} from '../lib/measurement.mjs';

export type ReaderResource={path:string;title:string;type:'article'|'blog'|'video';image?:string};
type Position={progress:number;anchor:string;offset:number};
function storage(){try{return window.localStorage;}catch{return undefined;}}
function readingPosition():Position{
 const body=document.querySelector<HTMLElement>('[data-reading-content]');
 if(!body)return {progress:0,anchor:'',offset:0};
 const line=window.matchMedia('(max-width:767px)').matches?100:185;
 const rect=body.getBoundingClientRect();
 const available=Math.max(1,rect.height-window.innerHeight+line+90);
 const progress=Math.max(0,Math.min(1,(-rect.top+line)/available));
 const section=[...body.querySelectorAll<HTMLElement>('section[id]')].filter(el=>el.getBoundingClientRect().top<=line+12).at(-1);
 const sectionRect=section?.getBoundingClientRect();
 return {progress,anchor:section?.id||'',offset:sectionRect?Math.max(0,Math.min(1,(line-sectionRect.top)/sectionRect.height)):0};
}
function jumpTo(position:Position){
 const body=document.querySelector<HTMLElement>('[data-reading-content]');if(!body)return;
 const line=window.matchMedia('(max-width:767px)').matches?100:185;
 const section=position.anchor?document.getElementById(position.anchor):null;
 const rect=body.getBoundingClientRect();
 const target=section&&body.contains(section)?window.scrollY+section.getBoundingClientRect().top+section.getBoundingClientRect().height*position.offset-line:window.scrollY+rect.top+position.progress*Math.max(1,rect.height-window.innerHeight+line+90)-line;
 window.scrollTo({top:Math.max(0,target),behavior:'instant'});
}
const labels:Record<string,string>={whatsapp:'WhatsApp',linkedin:'LinkedIn',facebook:'Facebook',x:'X',telegram:'Telegram',reddit:'Reddit',pinterest:'Pinterest',email:'Email'};
function ChannelIcon({channel}:{channel:string}){
 if(['whatsapp','linkedin','facebook','x','instagram'].includes(channel))return <Icon name={channel as IconName} width={21} height={21}/>;
 if(channel==='email')return <Mail size={21}/>;
 if(channel==='telegram')return <Send size={21}/>;
 if(channel==='reddit')return <MessageCircle size={21}/>;
 return <span className="reader-pinterest" aria-hidden="true">P</span>;
}
export function ResourceActions({resource}:{resource:ReaderResource}){
 const [saved,setSaved]=useState(false),[ready,setReady]=useState(false),[progress,setProgress]=useState(0),[pending,setPending]=useState<Position|null>(null);
 const [message,setMessage]=useState(''),[shareOpen,setShareOpen]=useState(false),[canShare,setCanShare]=useState(false),[copied,setCopied]=useState(false);
 const shareTrigger=useRef<HTMLButtonElement>(null),shareScroll=useRef(0),sharing=useRef(false);
 const dialog=useRef<HTMLDialogElement>(null),saveEnabled=useRef(false),lastWrite=useRef(0),latest=useRef<Position>({progress:0,anchor:'',offset:0});
 const milestones=useRef(new Set<number>()),uid=useId();
 const details={content_id:resource.path.split('/').pop(),content_type:resource.type,content_path:resource.path};
 function event(name:string,extra:Record<string,unknown>={}){track(window,'ifranchise_resource_'+name,{...details,...extra});}
 function resume(position:Position){setPending(null);saveEnabled.current=true;jumpTo(position);latest.current=position;event('resume',{progress_percent:Math.round(position.progress*100)});}
 useEffect(()=>{
  setReady(true);setCanShare(typeof navigator.share==='function');milestones.current.clear();
  const sync=()=>{const item=readSaved(storage()).find((item:any)=>item.path===resource.path);setSaved(!!item);if(!item){saveEnabled.current=false;setPending(null);}};
  const item=readSaved(storage()).find((item:any)=>item.path===resource.path);
  setSaved(!!item);saveEnabled.current=!!item;
  let frame=0;
  if(item&&item.progress>.01&&item.progress<.99&&!location.hash){
   saveEnabled.current=false;setPending(item);
   if(new URLSearchParams(location.search).get('resume')==='1')frame=requestAnimationFrame(()=>resume(item));
  }
  const changed=(e:StorageEvent)=>{if(e.key===READING_KEY||e.key===null)sync();};
  window.addEventListener('storage',changed);window.addEventListener(READING_EVENT,sync);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('storage',changed);window.removeEventListener(READING_EVENT,sync);};
 },[resource.path]);
 useEffect(()=>{
  let frame=0;
  const flush=()=>{if(sharing.current)return;if(saveEnabled.current&&saved&&!updatePosition(storage(),resource.path,latest.current)){saveEnabled.current=false;setMessage('Reading position could not be saved in this browser.');}};
  const update=()=>{
   if(sharing.current)return;
   latest.current=readingPosition();setProgress(Math.round(latest.current.progress*100));
   for(const value of [25,50,75,100])if(latest.current.progress*100>=value&&!milestones.current.has(value)){milestones.current.add(value);event('read_progress',{progress_percent:value});}
   if(Date.now()-lastWrite.current>1200){lastWrite.current=Date.now();flush();}
  };
  const scroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
  const hidden=()=>{if(document.visibilityState==='hidden')flush();};
  update();window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('pagehide',flush);document.addEventListener('visibilitychange',hidden);
  return()=>{cancelAnimationFrame(frame);flush();window.removeEventListener('scroll',scroll);window.removeEventListener('pagehide',flush);document.removeEventListener('visibilitychange',hidden);};
 },[resource.path,saved]);
 useEffect(()=>{if(!message)return;const timeout=setTimeout(()=>setMessage(''),5500);return()=>clearTimeout(timeout);},[message]);
 useEffect(()=>{if(shareOpen){dialog.current?.showModal();window.scrollTo({top:shareScroll.current,behavior:'instant'});}else if(dialog.current?.open)dialog.current.close();},[shareOpen]);
 function openShare(){shareScroll.current=window.scrollY;sharing.current=true;setCopied(false);setMessage('');setShareOpen(true);event('share_open');}
 function closeShare(){setShareOpen(false);shareTrigger.current?.focus({preventScroll:true});window.scrollTo({top:shareScroll.current,behavior:'instant'});sharing.current=false;}
 function toggleSave(){
  const ok=saved?removeResource(storage(),resource.path):saveResource(storage(),resource.path,readingPosition());
  if(!ok){setMessage('Saving is unavailable. Check your browser storage settings.');return;}
  saveEnabled.current=!saved;setSaved(!saved);setPending(null);window.dispatchEvent(new Event(READING_EVENT));
  event('save',{action:saved?'remove':'save'});setMessage(saved?'Removed from saved resources.':'Saved. Your reading position will be remembered.');
 }
 async function copy(channel='copy_link'){
  try{await navigator.clipboard.writeText(sharedResourceUrl(SITE.url,resource.path,channel,resource.type));setCopied(true);event('share',{channel,action:'copy'});setMessage(channel==='instagram'?'Link copied. Paste it into your Instagram message or story.':'Link copied.');}
  catch{setMessage('Select and copy the link below.');}
 }
 async function nativeShare(){
  try{await navigator.share({title:resource.title,url:sharedResourceUrl(SITE.url,resource.path,'native',resource.type)});event('share',{channel:'native',action:'handoff'});setShareOpen(false);}
  catch(error){if((error as Error)?.name!=='AbortError')setMessage('Sharing is unavailable. Use one of the options below.');}
 }
 return <>
  <div className="reader-toolbar" aria-label="Reading tools">
   <div className="p-container reader-toolbar-inner"><div className="reader-current"><span>{resource.type}</span><strong>{resource.title}</strong></div>
    <div className="reader-actions"><button ref={shareTrigger} type="button" onClick={openShare} aria-haspopup="dialog" aria-expanded={shareOpen} data-track="resource_share_open"><Share2 size={18}/><span>Share</span></button><button type="button" onClick={toggleSave} aria-pressed={saved} disabled={!ready} data-track="resource_save">{saved?<BookmarkCheck size={18}/>:<Bookmark size={18}/>}<span>{saved?'Saved':'Save'}</span></button><a href="/resources/saved" aria-label="Saved resources"><Library size={18}/><span>My library</span></a></div>
   </div>
   {pending&&<div className="reader-resume p-container"><button type="button" onClick={()=>resume(pending)}>Continue from {Math.round(pending.progress*100)}%<ArrowUpRight size={16}/></button><button type="button" onClick={()=>{setPending(null);saveEnabled.current=true;jumpTo({progress:0,anchor:'',offset:0});latest.current={progress:0,anchor:'',offset:0};updatePosition(storage(),resource.path,latest.current);}}>Start again</button></div>}
   <div className="reader-progress" role="progressbar" aria-label="Reading progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{width:progress+'%'}}/></div>
  </div>
  {message&&!shareOpen&&<div className="reader-toast" role="status">{message}</div>}
  <dialog ref={dialog} className="reader-share-dialog" aria-labelledby={uid+'-title'} onClose={closeShare} onClick={e=>{if(e.target===e.currentTarget)setShareOpen(false);}}>
   <div className="reader-share-content"><div className="reader-share-heading"><h2 id={uid+'-title'}>Share this {resource.type}</h2><button type="button" autoFocus aria-label="Close sharing" onClick={()=>setShareOpen(false)}><X size={22}/></button></div><p className="reader-share-title">{resource.title}</p>
    <div className="reader-share-grid">{shareChannels.map(channel=><a key={channel} href={socialShareUrl(channel,sharedResourceUrl(SITE.url,resource.path,channel,resource.type),resource.title,resource.image?new URL(resource.image,SITE.url).href:'')||'#'} target={channel==='email'?undefined:'_blank'} rel="noopener noreferrer" onClick={()=>event('share_intent',{channel,action:'open'})} data-track="resource_share" data-share-channel={channel}><ChannelIcon channel={channel}/><span>{labels[channel]}</span></a>)}<button type="button" onClick={()=>copy('instagram')} aria-label="Copy link for Instagram"><ChannelIcon channel="instagram"/><span>Instagram</span></button></div>
    <div className="reader-copy-row"><input aria-label="Share link" readOnly value={sharedResourceUrl(SITE.url,resource.path,'copy_link',resource.type)} onFocus={e=>e.target.select()}/><button type="button" onClick={()=>copy()}>{copied?<Check size={18}/>:<LinkIcon size={18}/>}<span>{copied?'Copied':'Copy link'}</span></button></div>
    {canShare&&<button className="reader-more-share" type="button" onClick={nativeShare}><Share2 size={18}/>More apps</button>}
    <p className="reader-share-status" role="status">{message}</p>
   </div>
  </dialog>
 </>;
}
