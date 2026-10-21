'use client';
import {useEffect,useState} from 'react';
import {Bookmark,ArrowUpRight,Trash2} from 'lucide-react';
import {ResourceTabs} from './resource-library';
import {ResourceCard} from './resource-card';
import {Crumb} from './premium';
import {readSaved,removeResource,resumePath,READING_KEY,READING_EVENT} from '../lib/reading-list.mjs';
import {track} from '../lib/measurement.mjs';
export function SavedResources({items}:{items:any[]}){
 const [saved,setSaved]=useState<any[]>([]),[ready,setReady]=useState(false),[error,setError]=useState('');
 function storage(){try{return window.localStorage;}catch{return undefined;}}
 useEffect(()=>{
  const sync=()=>{setSaved(readSaved(storage()));setReady(true);};
  const changed=(e:StorageEvent)=>{if(e.key===READING_KEY||e.key===null)sync();};
  sync();window.addEventListener('storage',changed);window.addEventListener(READING_EVENT,sync);
  return()=>{window.removeEventListener('storage',changed);window.removeEventListener(READING_EVENT,sync);};
 },[]);
 function remove(path:string,type:string){
  if(!removeResource(storage(),path)){setError('This resource could not be removed. Check your browser storage settings.');return;}
  window.dispatchEvent(new Event(READING_EVENT));setError('');track(window,'ifranchise_resource_save',{content_path:path,content_id:path.split('/').pop(),content_type:type.toLowerCase(),action:'remove'});
 }
 const available=saved.flatMap(record=>{const item=items.find(item=>item.path===record.path);return item?[{record,item}]:[];});
 return <main id="main" className="p-page saved-page"><div className="p-container"><header className="saved-masthead"><Crumb label="Saved resources"/><h1>Saved resources</h1><p>Saved on this browser.</p></header><ResourceTabs mode="saved"/>{!ready?<p className="saved-status" role="status">Loading saved resources…</p>:<><p className="saved-status" role="status">{available.length} {available.length===1?'saved resource':'saved resources'}</p>{available.length?<div className="journal-grid saved-grid">{available.map(({record,item})=><div className="saved-resource" key={item.path}><ResourceCard item={{...item,path:resumePath(record),actionLabel:record.progress>.01&&record.progress<.99?'Continue reading':undefined}}/><div className="saved-resource-footer"><div><span>{record.progress>=.99?'Completed':record.progress>.01?Math.round(record.progress*100)+'% read':'Not started'}</span><div className="saved-progress" aria-hidden="true"><span style={{width:Math.round(record.progress*100)+'%'}}/></div></div><button type="button" onClick={()=>remove(item.path,item.type)} aria-label={'Remove '+item.title+' from saved resources'}><Trash2 size={17}/><span>Remove</span></button></div></div>)}</div>:<div className="saved-empty"><Bookmark size={38}/><h2>No saved resources yet</h2><p>Save a blog, article or video to find it here.</p><a className="p-button" href="/resources">Explore resources<ArrowUpRight size={18}/></a></div>}</>}{error&&<p role="alert">{error}</p>}</div></main>;
}
