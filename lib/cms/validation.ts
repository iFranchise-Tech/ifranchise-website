import {z} from 'zod';
import {CmsError} from './auth';
import {assetUrl,workEmail} from './policy.mjs';
const short=z.string().max(600),long=z.string().max(50000),list=z.array(long).max(200);
const url=z.string().max(1000).refine(v=>assetUrl(v),'Use a local file path or an HTTPS URL.');
const section=z.object({heading:short,body:list,bullets:list.optional()}).passthrough();
const article=z.object({slug:short,title:short,excerpt:long,category:short,audience:z.enum(['all','brand','investor']),image:url,imageAlt:short,introHighlight:long,sections:z.array(section).min(1).max(60),faqs:z.array(z.object({q:short,a:long})).max(100),sources:z.array(z.object({label:short,url:z.string().url().startsWith('https://')})).max(100),relatedSlugs:z.array(short).max(100),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'Choose a valid date.')}).passthrough();
const brand=z.object({slug:short,name:short,category:short,investment:z.number().min(0).max(1e9).nullable(),budget:short,model:short,description:long,overview:long,highlights:list,sources:z.array(z.object({title:short,url:z.string().url().startsWith('https://')})).max(100),logo:url,gallery:z.array(url).max(40),brochure:url,facts:z.record(z.union([z.string().max(5000),z.number(),z.null()]))}).passthrough();
const job=z.object({slug:short,title:short,dept:short,type:short,mode:short,location:short,experience:short,tagline:long,aboutRole:long,responsibilities:list,requirements:list,applyEmail:z.string().email().refine(workEmail,'Use an iFranchise email address.'),applyNote:long}).passthrough();
const home=z.object({slug:z.literal('homepage'),title:short,headline:short,accent:short,intro:long,overviewTitle:short,overviewIntro:long});
const faqs=z.object({slug:z.literal('faqs'),title:short,questions:z.array(z.object({q:short,a:long})).min(1).max(60)});
export function validPayload(kind:string,p:any,complete=false){
 const schema=kind==='franchises'?brand:kind==='jobs'?job:kind==='articles'?article:kind==='pages'?(p.slug==='homepage'?home:faqs):z.object({slug:z.literal('franchises'),title:short,ids:z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(500)});
 const r=schema.safeParse(p);if(!r.success)throw new CmsError(422,r.error.issues.map(i=>i.path.join('.')+': '+i.message).slice(0,3).join(' · '));
 const v:any=r.data;if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug)||v.slug.length>120)throw new CmsError(422,'Use a short URL slug with lowercase letters, numbers and hyphens.');
 if(kind==='articles'&&['for-investors','for-brands','franchise-basics','industries'].includes(v.slug))throw new CmsError(422,'This URL is reserved for a collection.');
 if(!(v.name||v.title)?.trim())throw new CmsError(422,'Add a title or brand name.');
 if(kind==='placements'&&new Set(v.ids).size!==v.ids.length)throw new CmsError(422,'Each brand must appear once.');
 if(complete){
 const fields=kind==='franchises'?['name','category','budget','model','description','overview','logo']:kind==='articles'?['title','excerpt','category','image','imageAlt','introHighlight']:kind==='jobs'?['title','dept','type','location','aboutRole']:kind==='pages'&&v.slug==='homepage'?['headline','intro']:[];
 const missing=fields.find(k=>!v[k]?.trim());if(missing)throw new CmsError(422,'Complete '+missing+' before publishing or submitting.');
 if(kind==='articles'&&v.sections.some((s:any)=>!s.heading.trim()||!s.body.some((b:string)=>b.trim())))throw new CmsError(422,'Every article section needs a heading and body.');
 if(kind==='jobs'&&(!v.responsibilities.length||!v.requirements.length))throw new CmsError(422,'Add the role responsibilities and requirements.');
 if(kind==='pages'&&v.slug==='faqs'&&v.questions.some((q:any)=>!q.q.trim()||!q.a.trim()))throw new CmsError(422,'Complete each question and answer.');
 }
 if(kind==='jobs'){v.id=v.slug;v.active=true;}
 if(complete){for(const k of ['highlights','gallery','responsibilities','requirements','keySkills','relatedSlugs'])if(Array.isArray(v[k]))v[k]=v[k].filter((x:any)=>typeof x!=='string'||x.trim());}
 return v;
}
