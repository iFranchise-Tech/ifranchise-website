import {z} from 'zod';
import {emailFieldError,normalizeWorkEmail} from '../contact-validation.mjs';
import {CmsError} from './auth';
import {assetUrl} from './policy.mjs';
import {franchiseModels} from './catalogue-fields.mjs';
import {validResourceCategory} from '../resource-categories.mjs';
const short=z.string().max(600),long=z.string().max(50000),list=z.array(long).max(200);
const url=z.string().max(1000).refine(v=>assetUrl(v),'Use a local file path or an HTTPS URL.');
const questions=z.array(z.object({q:short,a:long})).max(100);
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'Choose a valid date.');
const article=z.object({slug:short,title:short,excerpt:long,category:short,resourceCategory:z.string().refine(validResourceCategory,'Select a resource category.').optional(),audience:z.enum(['all','brand','investor']),image:url,imageAlt:short,introHighlight:long,sections:z.array(z.object({heading:short,body:list,bullets:list.optional()})).min(1).max(60),faqs:questions,sources:z.array(z.object({label:short,url:z.string().url().startsWith('https://')})).max(100),relatedSlugs:z.array(short).max(100),date}).passthrough();
const brand=z.object({slug:short,name:short,category:short,investment:z.number().min(0).max(1e9).nullable(),budget:short,model:short,models:z.array(z.string().refine(v=>franchiseModels.includes(v),'Select an operating model.')).min(1).max(7),description:long,overview:long,highlights:list,logo:url,gallery:z.array(url).max(40),brochure:z.string().max(1000).refine(v=>!v||/^\/(brochures\/[a-z0-9-]+\.pdf|media\/[a-f0-9-]{36}\.pdf)$/.test(v),'Upload a PDF brochure to the media library.'),brochureEnabled:z.boolean(),faqs:questions,facts:z.record(z.union([z.string().max(5000),z.number(),z.null()]))}).passthrough();
const job=z.object({slug:short,title:short,dept:short,type:short,mode:short,location:short,experience:short,tagline:long,aboutRole:long,responsibilities:list,requirements:list,applyEmail:z.string().superRefine((value,ctx)=>{const message=emailFieldError(value,{work:true});if(message)ctx.addIssue({code:z.ZodIssueCode.custom,message});}).transform(value=>normalizeWorkEmail(value)),applyNote:long}).passthrough();
const home=z.object({slug:z.literal('homepage'),title:short,headline:short,accent:short,intro:long,overviewTitle:short,overviewIntro:long});
const faq=z.object({slug:z.enum(['general','homepage','opportunities','list-your-brand','contact-us']),title:short,questions});
const video=z.object({slug:short,title:short,excerpt:long,youtubeUrl:z.string().max(500),image:url,imageAlt:short,date,transcript:long});
export function youtubeId(value:string){try{const u=new URL(value);if(u.protocol!=='https:')return null;let id=u.hostname==='youtu.be'?u.pathname.slice(1):['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname)?(u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1]):null;return id&&/^[\w-]{11}$/.test(id)?id:null}catch{return null}}
export function validPayload(kind:string,p:any,complete=false){
 const schema=kind==='franchises'?brand:kind==='jobs'?job:['articles','blogs'].includes(kind)?article:kind==='pages'?home:kind==='faqs'?faq:kind==='videos'?video:kind==='industries'?z.object({slug:short,title:short}):z.object({slug:z.literal('franchises'),title:short,ids:z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(500)});
 const r=schema.safeParse(p);if(!r.success)throw new CmsError(422,r.error.issues.map(i=>i.path.join('.')+': '+i.message).slice(0,3).join(' · '));
 const v:any=r.data;if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug)||v.slug.length>120)throw new CmsError(422,'Use a short URL slug with lowercase letters, numbers and hyphens.');
 if(kind==='articles'&&['for-investors','for-brands','franchise-basics','industries'].includes(v.slug))throw new CmsError(422,'This URL is reserved for a collection.');
 if(!(v.name||v.title)?.trim())throw new CmsError(422,'Add a title or brand name.');
 if(kind==='placements'&&new Set(v.ids).size!==v.ids.length)throw new CmsError(422,'Each brand must appear once.');
 if(kind==='franchises'){v.models=[...new Set(v.models)];v.model=v.models.join(', ');delete v.sources;}
 if(kind==='videos'&&v.youtubeUrl&&!youtubeId(v.youtubeUrl))throw new CmsError(422,'Enter a YouTube video URL.');
 if(complete){
 const fields=kind==='franchises'?['name','category','budget','description','overview','logo']:['articles','blogs'].includes(kind)?['title','excerpt','category','image','imageAlt','introHighlight']:kind==='videos'?['title','excerpt','youtubeUrl']:kind==='jobs'?['title','dept','type','location','aboutRole']:kind==='pages'?['headline','intro']:[];
 const missing=fields.find(k=>!v[k]?.trim());if(missing)throw new CmsError(422,'Complete '+missing+' before publishing or submitting.');
 if(['articles','blogs'].includes(kind)&&v.sections.some((s:any)=>!s.heading.trim()||!s.body.some((b:string)=>b.trim())))throw new CmsError(422,'Every section needs a heading and body.');
 if(kind==='jobs'&&(!v.responsibilities.length||!v.requirements.length))throw new CmsError(422,'Add the role responsibilities and requirements.');
 if((v.questions||v.faqs||[]).some((q:any)=>!q.q.trim()||!q.a.trim()))throw new CmsError(422,'Complete each question and answer.');
 if(kind==='franchises'&&!v.faqs.length)throw new CmsError(422,'Add at least one brand FAQ.');

 }
 if(kind==='jobs'){v.id=v.slug;v.active=true;}
 if(complete)for(const k of ['highlights','gallery','responsibilities','requirements','keySkills','relatedSlugs'])if(Array.isArray(v[k]))v[k]=v[k].filter((x:any)=>typeof x!=='string'||x.trim());
 return v;
}
