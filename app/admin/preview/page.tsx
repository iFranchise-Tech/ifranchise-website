import {notFound} from 'next/navigation';
import {adminIdentity,db} from '../../../lib/cms/auth';
import {canView} from '../../../lib/cms/policy.mjs';
import {getRecord} from '../../../lib/cms/store';
import {hydrateArticle,published,publishedPage,publishedFaq} from '../../../lib/cms/public';
import {EditorialArticlePage} from '../../../components/editorial-article';
import {FranchiseDetail} from '../../../components/franchise-detail';
import {JobDetail} from '../../../components/job-detail';
import {HomePage} from '../../../components/home-page';
import {SolutionsPage} from '../../../components/solutions-page';
import {ContactPage} from '../../../components/contact-page';
import {OpportunitiesPage} from '../../../components/opportunities-page';
import {ResourcesPage,VideoPage} from '../../../components/resources-page';
import {Header,Footer} from '../../../components/shell';
import {PremiumMotion} from '../../../components/premium-motion';
export const dynamic='force-dynamic';
export const metadata={title:'Content preview',robots:{index:false,follow:false}};
export default async function Preview({searchParams}:{searchParams:Promise<{id?:string;token?:string;loading?:string}>}){
 let me;try{me=await adminIdentity()}catch{notFound()}
 const {id,token,loading}=await searchParams;if(loading)return <div className="cms-preview-banner" role="status">Preparing preview…</div>;
 let r:any;if(token){const row:any=await db().prepare('SELECT kind,payload FROM cms_previews WHERE id=? AND expires_at>?').bind(token,new Date().toISOString()).first();if(row)r={kind:row.kind,draft:JSON.parse(row.payload)}}else r=await getRecord(id||'');
 if(!r||!canView(me,r.kind))notFound();const p=r.draft,kind=r.kind;
 const [brands,articles,industries]=await Promise.all([published('franchises'),published('articles'),published('industries')]);
 let page;
 if(kind==='franchises')page=<FranchiseDetail brand={p} brands={[p,...brands.filter(b=>b.slug!==p.slug)]}/>;
 else if(kind==='articles'||kind==='blogs')page=<EditorialArticlePage article={hydrateArticle({...p,resourceType:kind==='blogs'?'blog':'article'})} allArticles={kind==='blogs'?await published('blogs'):articles}/>;
 else if(kind==='videos')page=<VideoPage video={p}/>;
 else if(kind==='jobs')page=<JobDetail job={p}/>;
 else if(kind==='pages'||kind==='faqs'&&p.slug==='homepage')page=<HomePage home={kind==='pages'?p:await publishedPage('homepage')} faq={{questions:kind==='faqs'?p.questions:await publishedFaq('homepage')}} brands={brands} articles={articles}/>;
 else if(kind==='faqs'&&p.slug==='list-your-brand')page=<SolutionsPage brands={brands} faqs={p.questions}/>;
 else if(kind==='faqs'&&p.slug==='contact-us')page=<ContactPage brands={brands} faqs={p.questions}/>;
 else if(kind==='faqs'&&p.slug==='general')page=<ResourcesPage mode="faqs" override={{kind,payload:p}}/>;
 else if(kind==='placements'||kind==='industries'||kind==='faqs'){
 const sorted=kind==='placements'?[...brands].sort((a,b)=>{const x=p.ids.indexOf(a.slug),y=p.ids.indexOf(b.slug);return (x<0?1e6:x)-(y<0?1e6:y)}):brands;
 page=<OpportunitiesPage brands={sorted} industries={kind==='industries'?[p,...industries.filter(i=>i.slug!==p.slug)]:industries} faqs={kind==='faqs'?p.questions:await publishedFaq('opportunities')}/>;
 }else notFound();
 return <><div className="cms-preview-banner"><strong>Preview</strong><span>{p.name||p.title}</span><span>Not published</span><a href="/admin">Open admin ↗</a></div><PremiumMotion><Header/>{page}<Footer/></PremiumMotion></>;
}
