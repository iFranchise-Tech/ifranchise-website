import {cache} from 'react';
import {env} from 'cloudflare:workers';
import {hydrateBrand} from './catalogue-fields.mjs';
import {defaults} from './defaults';
export const dynamic='force-dynamic';
export const published=cache(async function published(kind:string):Promise<any[]>{
 const items=new Map(defaults[kind]?.filter(p=>kind!=='jobs'||p.active).map(p=>[p.slug,p])||[]);
 if(!env.DB)throw new Error('Content database is unavailable');
 const result=await env.DB.prepare('SELECT kind,slug,live FROM cms_records WHERE kind IN (?,?)').bind(kind,kind==='franchises'?'placements':kind).all<{kind:string;slug:string;live:string|null}>();
 for(const r of result.results.filter(r=>r.kind===kind)){if(r.live)items.set(r.slug,JSON.parse(r.live));else items.delete(r.slug);}
 const values=[...items.values()].map(v=>kind==='franchises'?hydrateBrand(v):v);
 if(kind==='franchises'){const orders=new Map((defaults.placements||[]).map(p=>[p.slug,p]));for(const r of result.results.filter(r=>r.kind==='placements')){if(r.live)orders.set(r.slug,JSON.parse(r.live));else orders.delete(r.slug)}const ids=orders.get('franchises')?.ids||[];values.sort((a,b)=>{const x=ids.indexOf(a.slug),y=ids.indexOf(b.slug);return (x<0?1e6:x)-(y<0?1e6:y)||a.name.localeCompare(b.name)});}
 if(kind==='articles'||kind==='blogs')return values.map(a=>hydrateArticle({...a,resourceType:kind==='blogs'?'blog':'article'}));
 return kind==='jobs'?values.filter(j=>j.active!==false):values;
});
export function hydrateArticle(a:any){const sections=a.sections.map((s:any,i:number)=>({...s,id:'section-'+(i+1)}));const words=[a.introHighlight,...sections.flatMap((s:any)=>[s.heading,...s.body,...(s.bullets||[])])].join(' ').split(/\s+/).length;return {...a,path:(a.resourceType==='blog'?'/resources/blogs/':'/blogs/')+a.slug,label:a.category,thumbnail:a.image,sections,words,minutes:Math.max(3,Math.ceil(words/210))};}
export async function publishedPage(slug:string){return (await published('pages')).find(p=>p.slug===slug);}

export async function publishedFaq(slug:string){return (await published('faqs')).find(p=>p.slug===slug)?.questions||[];}
