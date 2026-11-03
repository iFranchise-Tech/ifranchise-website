import {canEdit,canView,SCOPES} from './policy.mjs';

export const adminModules={overview:'',submissions:'inbox',review:'approvals',franchises:'franchise-opportunities',jobs:'careers',industries:'industries',blogs:'blogs',articles:'articles',videos:'videos',faqs:'page-faqs',pages:'website-pages',media:'media-library',team:'team',email:'email-delivery',activity:'activity'};
const creatable=new Set(['franchises','jobs','industries','blogs','articles','videos']);
const reserved=new Set(['new','arrange','invite']);
export const modulePath=section=>section in adminModules?'/admin'+(adminModules[section]?'/'+adminModules[section]:''):'/admin';
export function recordPath(id){
 const colon=String(id).indexOf(':'),kind=String(id).slice(0,colon),slug=String(id).slice(colon+1);
 if(kind==='placements'&&['franchises','jobs'].includes(slug))return modulePath(slug)+'/arrange';
 if(!SCOPES.includes(kind)||!slug)return '/admin';
 return modulePath(kind)+'/'+encodeURIComponent(reserved.has(slug)?id:slug);
}
export function adminRoute(pathname){
 let parts;try{parts=pathname.replace(/\/$/,'').split('/').slice(1).map(decodeURIComponent)}catch{return null}
 if(parts[0]!=='admin'||parts.some(p=>/[\\/\0]/.test(p)))return null;
 if(parts.length===1)return {section:'overview',mode:'list'};
 const section=Object.keys(adminModules).find(k=>adminModules[k]===parts[1]);if(!section)return null;
 if(parts.length===2)return {section,mode:'list'};
 const value=parts[2];if(!value||parts.length>4||parts.length===4&&!['edit','preview'].includes(parts[3]))return null;
 if(section==='submissions'&&parts.length===3)return {section,mode:'submission',id:value};
 if(section==='team'&&parts.length===3)return value==='invite'?{section,mode:'invite'}:/^[^\s@]+@[^\s@]+$/.test(value)?{section,mode:'member',email:value}:null;
 if(!SCOPES.includes(section))return null;
 if(value==='new'&&creatable.has(section))return parts.length===3?{section,mode:'create'}:parts[3]==='preview'?{section,mode:'preview'}:null;
 if(value==='arrange'&&['franchises','jobs'].includes(section))return {section,mode:parts[3]==='preview'?'preview':'record',id:'placements:'+section};
 const slug=value.startsWith(section+':')?value.slice(section.length+1):value;
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||reserved.has(value))return null;
 return {section,mode:parts[3]==='preview'?'preview':'record',id:section+':'+slug};
}
export function canOpenAdminRoute(me,route){
 if(!route)return false;
 if(SCOPES.includes(route.section))return route.mode==='create'?canEdit(me,route.section):canView(me,route.section);
 if(['team','email'].includes(route.section))return me.status==='active'&&me.role==='super_admin';
 if(route.section==='submissions')return canView(me,'enquiries')||canView(me,'applications');
 return me.status==='active';
}
export function listingParams(search=''){
 const p=new URLSearchParams(search),page=Number(p.get('page'));
 return {query:p.get('q')||'',status:['published','draft','review','changes','archived'].includes(p.get('status'))?(p.get('status')||'all'):'all',industry:p.get('industry')||'',page:Number.isSafeInteger(page)&&page>0?page:1};
}
export function withAdminQuery(path,search,changes){
 const params=new URLSearchParams(search);
 for(const [key,value] of Object.entries(changes)){if(value===null||value===undefined||value===''||key==='page'&&Number(value)===1||key==='status'&&value==='all')params.delete(key);else params.set(key,String(value))}
 return path+(params.size?'?'+params:'');
}
// Only local CMS locations may be used after login; never an arbitrary redirect.
export function safeAdminReturnPath(value){
 if(typeof value!=='string'||!value.startsWith('/admin')||/[\\\r\n\0]/.test(value))return '/admin';
 try{const u=new URL(value,'https://cms.invalid');if(u.origin!=='https://cms.invalid'||!(u.pathname==='/admin'||u.pathname.startsWith('/admin/')))return '/admin';return u.pathname+u.search}catch{return '/admin'}
}
