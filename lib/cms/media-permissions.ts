import {db,CmsError} from './auth';
import {canView} from './policy.mjs';
export async function checkMedia(member:any,payload:any){
 const values:string[]=[];function walk(v:any){if(typeof v==='string'&&v.startsWith('/media/'))values.push(v);else if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')Object.values(v).forEach(walk)}walk(payload);
 for(const value of new Set(values)){const media:any=await db().prepare('SELECT scope FROM cms_media WHERE id=?').bind(value.slice(7)).first();if(!media||!canView(member,media.scope))throw new CmsError(422,'An uploaded file is missing or outside your assigned sections.');}
}
