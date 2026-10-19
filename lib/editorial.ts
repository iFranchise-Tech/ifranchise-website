import library from '../content/editorial.json';
import artwork from '../content/editorial-natural-artwork.json';
const illustrations=artwork.articles as Record<string,{alt:string}>;
export type EditorialArticle={slug:string;title:string;excerpt:string;category:string;audience:string;cover:string;introHighlight:string;sections:{heading:string;body:string[];bullets?:string[];id?:string}[];faqs:{q:string;a:string}[];sources:{label:string;url:string}[];relatedSlugs:string[];date:string;path:string;label:string;image:string;thumbnail:string;imageAlt:string;minutes:number;words:number};
export const editorialArticles:EditorialArticle[]=(library as any[]).map(a=>{const words=[a.introHighlight,...a.sections.flatMap((s:any)=>[s.heading,...s.body,...(s.bullets||[])]),...a.faqs.flatMap((f:any)=>[f.q,f.a])].join(' ').split(/\s+/).length;return {...a,path:'/blogs/'+a.slug,label:a.category,image:'/art/natural/articles/'+a.slug+'.webp',thumbnail:'/art/natural/articles/'+a.slug+'.webp',imageAlt:illustrations[a.slug]?.alt||a.excerpt,minutes:Math.max(3,Math.ceil(words/210)),words,sections:a.sections.map((s:any,i:number)=>({...s,id:'section-'+(i+1)}))};});

export function articleCards(items:EditorialArticle[]){return items.map(({path,title,excerpt,label,thumbnail,imageAlt,audience,minutes})=>({path,title,excerpt,label,thumbnail,imageAlt,audience,minutes}));}
