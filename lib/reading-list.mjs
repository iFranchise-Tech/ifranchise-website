export const READING_KEY='ifranchise_saved_resources_v1';
export const READING_EVENT='ifranchise-saved-resources-updated';
const MAX_ITEMS=100;
export const resourcePath=value=>typeof value==='string'&&/^\/(?:blogs|resources\/(?:blogs|videos))\/[a-z0-9-]+$/.test(value);
const fraction=value=>Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;

/** Read only supported resource paths and bounded position data from browser storage. */
export function readSaved(storage){
 try{
  const data=JSON.parse(storage?.getItem(READING_KEY)||'[]');
  if(!Array.isArray(data))return [];
  const seen=new Set();
  return data.filter(item=>item&&resourcePath(item.path)&&!seen.has(item.path)&&seen.add(item.path)).slice(0,MAX_ITEMS).map(item=>({
   path:item.path,progress:fraction(item.progress),anchor:typeof item.anchor==='string'&&/^[a-z0-9-]{1,100}$/.test(item.anchor)?item.anchor:'',
   offset:fraction(item.offset),savedAt:Number.isFinite(item.savedAt)?item.savedAt:0,updatedAt:Number.isFinite(item.updatedAt)?item.updatedAt:0
  }));
 }catch{return [];}
}
export function writeSaved(storage,items){try{storage.setItem(READING_KEY,JSON.stringify(items.slice(0,MAX_ITEMS)));return true;}catch{return false;}}
export function saveResource(storage,path,position={}){
 if(!resourcePath(path))return false;
 const items=readSaved(storage),existing=items.find(item=>item.path===path);
 const now=Date.now();
 const item={path,progress:fraction(position.progress),anchor:position.anchor||'',offset:fraction(position.offset),savedAt:existing?.savedAt||now,updatedAt:now};
 return writeSaved(storage,[item,...items.filter(entry=>entry.path!==path)]);
}
export function removeResource(storage,path){return writeSaved(storage,readSaved(storage).filter(item=>item.path!==path));}
export function updatePosition(storage,path,position){
 const items=readSaved(storage);
 if(!items.some(item=>item.path===path))return false;
 return writeSaved(storage,items.map(item=>item.path===path?{...item,progress:fraction(position.progress),anchor:position.anchor||'',offset:fraction(position.offset),updatedAt:Date.now()}:item));
}
export function resumePath(item){return item.path+(item.progress>0.01?'?resume=1':'');}
