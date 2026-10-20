import {env} from 'cloudflare:workers';
import {defaults} from './defaults';
export const dynamic='force-dynamic';
export async function published(kind:string):Promise<any[]>{
 const items=new Map(defaults[kind]?.filter(p=>kind!=='jobs'||p.active).map(p=>[p.slug,p])||[]);
 if(!env.DB)throw new Error('Content database is unavailable');
 const result=await env.DB.prepare('SELECT slug,live FROM cms_records WHERE kind=?').bind(kind).all<{slug:string;live:string|null}>();
 for(const r of result.results){if(r.live)items.set(r.slug,JSON.parse(r.live));else items.delete(r.slug);}
 const values=[...items.values()];
 if(kind==='franchises'){const orders=await published('placements'),ids=orders[0]?.ids||[];values.sort((a,b)=>{const x=ids.indexOf(a.slug),y=ids.indexOf(b.slug);return (x<0?1e6:x)-(y<0?1e6:y)||a.name.localeCompare(b.name)});}
 if(kind==='articles')return values.map(hydrateArticle);
 return values;
}
export function hydrateArticle(a:any){const sections=a.sections.map((s:any,i:number)=>({...s,id:'section-'+(i+1)}));const words=[a.introHighlight,...sections.flatMap((s:any)=>[s.heading,...s.body,...(s.bullets||[])])].join(' ').split(/\s+/).length;return {...a,path:'/blogs/'+a.slug,label:a.category,thumbnail:a.image,sections,words,minutes:Math.max(3,Math.ceil(words/210))};}
export async function publishedPage(slug:string){return (await published('pages')).find(p=>p.slug===slug);}
