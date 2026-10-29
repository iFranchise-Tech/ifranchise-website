import {z} from 'zod';
import {emailFieldError,normalizeWorkEmail} from '../contact-validation.mjs';
import {editingIssues} from './display.mjs';
import {normalizeEmail,normalizePhone} from '../contact-validation.mjs';
import {CmsError} from './errors';
import {assetUrl} from './policy.mjs';
import {franchiseModels} from './catalogue-fields.mjs';
import {validResourceCategory} from '../resource-categories.mjs';
const short=z.string().max(600),long=z.string().max(50000),list=z.array(long).max(200);
const url=z.string().max(1000).refine(v=>assetUrl(v),'Use a local file path or an HTTPS URL.');
const questions=z.array(z.object({q:short,a:long})).max(100);
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'Choose a valid date.');
const presentation=z.object({fit:z.enum(['cover','contain']),x:z.number().min(0).max(100),y:z.number().min(0).max(100),zoom:z.number().min(1).max(2),ratio:z.enum(['original','16/9','4/3','3/2','1/1','2/1']),width:z.number().min(50).max(100)});
const ref=z.string().regex(/^(articles|blogs|videos):[a-z0-9]+(?:-[a-z0-9]+)*$/);
const refs=z.array(ref).max(30).refine(v=>new Set(v).size===v.length,'Select each resource once.');
const ids=z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(500).refine(v=>new Set(v).size===v.length,'Select each item once.');
const figure=z.object({src:url,alt:short,caption:short.optional(),presentation:presentation.optional()});
const returnTerms=z.object({arrangement:z.enum(['share','minimum','higher','fixed']),margin:z.number().min(0).max(100).nullable(),guaranteeType:z.enum(['percentage','amount']),guarantee:z.number().min(0).max(1e12).nullable(),period:z.enum(['monthly','annual']),note:z.string().max(1000)}).superRefine((t,ctx)=>{if(['share','higher'].includes(t.arrangement)&&t.margin==null)ctx.addIssue({code:'custom',message:'Enter the margin on sales.'});if(t.arrangement!=='share'&&(t.guarantee==null||t.guaranteeType==='percentage'&&t.guarantee>100))ctx.addIssue({code:'custom',message:'Enter the guarantee or fixed return (percentage: 0–100).'});});
const article=z.object({slug:short,title:short,excerpt:long,category:short,resourceCategory:z.string().refine(validResourceCategory,'Select a resource category.').optional(),audience:z.enum(['all','brand','investor']),image:url,imageAlt:short,introHighlight:long,sections:z.array(z.object({heading:short,body:list,bullets:list.optional(),image:figure.optional()}).passthrough()).min(1).max(60),faqs:questions,sources:z.array(z.object({label:short,url:z.string().url().startsWith('https://')})).max(100),relatedSlugs:z.array(short).max(100),relatedResources:refs.optional(),author:z.string().max(120).optional(),authorDescription:short.optional(),readingMinutes:z.number().int().min(1).max(240).nullable().optional(),imageCaption:short.optional(),imagePresentation:presentation.optional(),date}).passthrough();
const brand=z.object({slug:short,name:short,category:short,investment:z.number().min(0).max(1e9).nullable(),budget:short,model:short,models:z.array(z.string().refine(v=>franchiseModels.includes(v),'Select an operating model.')).min(1).max(7),description:long,overview:long,highlights:list,logo:url,gallery:z.array(url).max(40),brochure:z.string().max(1000).nullable().transform(v=>v??'').refine(v=>!v||/^\/(brochures\/[a-z0-9-]+\.pdf|media\/[a-f0-9-]{36}\.pdf)$/.test(v),'Upload a PDF brochure to the media library.'),brochureEnabled:z.boolean(),faqs:questions,caption:short.optional(),logoAlt:short.optional(),galleryAlt:z.record(z.string(),short).optional(),relatedBrands:ids.optional(),logoPresentation:presentation.optional(),galleryPresentation:z.record(z.string(),presentation).optional(),banner:url.optional(),bannerAlt:short.optional(),bannerPresentation:presentation.optional(),spaceRequirement:z.object({mode:z.enum(['fixed','range']),min:z.number().min(0).max(1e9),max:z.number().min(0).max(1e9).nullable()}).refine(v=>v.mode==='fixed'||v.max!=null&&v.max>=v.min,'Maximum area must be at least the minimum.').optional(),locationFormats:z.array(short).max(20).optional(),agreementYears:z.number().min(0).max(100).nullable().optional(),lockInYears:z.number().min(0).max(100).nullable().optional(),outlets:z.number().int().min(0).max(1e7).nullable().optional(),returnTerms:returnTerms.optional(),facts:z.record(z.string(),z.union([z.string().max(5000),z.number(),z.boolean(),z.array(z.union([z.string().max(5000),z.record(z.string(),z.string().max(5000))])).max(200),z.null()]))}).passthrough();
const job=z.object({slug:short,title:short,dept:short,type:short,mode:short,location:short,experience:short,tagline:long,aboutRole:long,responsibilities:list,requirements:list,applyEmail:z.string().superRefine((value,ctx)=>{const message=emailFieldError(value,{work:true});if(message)ctx.addIssue({code:z.ZodIssueCode.custom,message});}).transform(value=>normalizeWorkEmail(value)),applyNote:long}).passthrough();
const home=z.object({slug:z.literal('homepage'),title:short,headline:short,accent:short,intro:long,overviewTitle:short,overviewIntro:long,featuredBrands:ids.optional(),featuredResources:refs.optional(),processImage:url.optional(),processAlt:short.optional(),processPresentation:presentation.optional()});
const about=z.object({slug:z.literal('about-us'),title:short,banner:url,bannerAlt:short,bannerPresentation:presentation.optional()});
const contact=z.object({slug:z.literal('contact-us'),title:short,email:z.string().superRefine((v,c)=>{const e=emailFieldError(v);if(e)c.addIssue({code:'custom',message:e});}),phone:z.string(),phoneCountry:z.string()}).superRefine((v,c)=>{try{v.phone=normalizePhone(v.phone,v.phoneCountry);v.email=normalizeEmail(v.email)}catch(e:any){c.addIssue({code:'custom',path:['phone'],message:e.message});}});
const footer=z.object({slug:z.literal('footer'),title:short,socialLinks:z.array(z.object({name:z.string().min(1).max(60),icon:z.enum(['facebook','instagram','linkedin','x','whatsapp','youtube','link']),href:z.string().url().startsWith('https://').refine(v=>{try{const u=new URL(v);return !u.username&&!u.password}catch{return false}},'Use a public HTTPS link without account credentials.'),visible:z.boolean()})).max(15)});
const legal=z.object({slug:z.enum(['privacy-policy','terms-and-conditions']),title:short,intro:long,date,noticeVersion:z.string().max(80).optional(),opening:long,sections:z.array(z.object({id:z.string().regex(/^[a-z0-9-]+$/),heading:z.string().min(1).max(200),body:z.array(long).min(1).max(100)})).min(1).max(40)}).refine(p=>new Set(p.sections.map(s=>s.id)).size===p.sections.length,'Section identifiers must be unique.');
const page=z.union([home,about,contact,footer,legal]);
const faq=z.object({slug:z.enum(['general','homepage','opportunities','list-your-brand','contact-us']),title:short,questions});
const video=z.object({slug:short,title:short,excerpt:long,youtubeUrl:z.string().max(500),image:url,imageAlt:short,date,transcript:long,relatedResources:refs.optional(),imagePresentation:presentation.optional()});
export function youtubeId(value:string){try{const u=new URL(value);if(u.protocol!=='https:')return null;const id=u.hostname==='youtu.be'?u.pathname.slice(1):['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname)?(u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1]):null;return id&&/^[\w-]{11}$/.test(id)?id:null}catch{return null}}
export function validPayload(kind:string,p:any,complete=false,previous:any={}){
 const schema=kind==='franchises'?brand:kind==='jobs'?job:['articles','blogs'].includes(kind)?article:kind==='pages'?page:kind==='faqs'?faq:kind==='videos'?video:kind==='industries'?z.object({slug:short,title:short}):z.object({slug:z.enum(['franchises','jobs']),title:short,ids:z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(500)});
 const r=schema.safeParse(p);if(!r.success)throw new CmsError(422,r.error.issues.map(i=>(i.path.length?String(i.path.join('.')).replace(/([a-z])([A-Z])/g,'$1 $2')+': ':'')+i.message).slice(0,3).join(' · '));
 const v:any=r.data;const issues=editingIssues(kind,v,previous);if(issues.length)throw new CmsError(422,issues.join(' '));if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug)||v.slug.length>120)throw new CmsError(422,'Use a short URL slug with lowercase letters, numbers and hyphens.');
 if(kind==='articles'&&['for-investors','for-brands','franchise-basics','industries'].includes(v.slug))throw new CmsError(422,'This URL is reserved for a collection.');
 if(!(v.name||v.title)?.trim())throw new CmsError(422,'Add a title or brand name.');
 if(kind==='placements'&&new Set(v.ids).size!==v.ids.length)throw new CmsError(422,'Each brand must appear once.');
 if(kind==='franchises'){v.models=[...new Set(v.models)];v.model=v.models.join(', ');delete v.sources;}
 if(kind==='videos'&&v.youtubeUrl&&!youtubeId(v.youtubeUrl))throw new CmsError(422,'Enter a YouTube video URL.');
 if(complete){
 const fields=kind==='franchises'?['name','category','budget','description','overview','logo']:['articles','blogs'].includes(kind)?['title','excerpt','category','image','imageAlt','introHighlight']:kind==='videos'?['title','excerpt','youtubeUrl']:kind==='jobs'?['title','dept','type','location','aboutRole']:kind==='pages'&&v.slug==='homepage'?['headline','intro']:kind==='pages'&&v.slug==='about-us'?['banner','bannerAlt']:[];
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
