import Link from 'next/link';
import {AboutPage} from '../../../components/about-page';
import {CareersPage} from '../../../components/careers-page';
import {ManagedLegalPage} from '../../../components/managed-legal-page';
import {SiteSettingsProvider} from '../../../components/site-settings';
import {notFound} from 'next/navigation';
import {adminIdentity,db,CmsError} from '../../../lib/cms/auth';
import {StaffSignIn} from '../../../components/admin/staff-sign-in';
import {canView} from '../../../lib/cms/policy.mjs';
import {getRecord} from '../../../lib/cms/store';
import {hydrateArticle,published,publishedPage,publishedFaq,publishedResources} from '../../../lib/cms/public';
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
 let me;try{me=await adminIdentity()}catch(error){return <StaffSignIn status={error instanceof CmsError?error.status:503} message={error instanceof CmsError?error.message:'The admin portal is temporarily unavailable.'} returnPath="/admin/preview"/>}
 const {id,token,loading}=await searchParams;if(loading)return <div className="cms-preview-banner" role="status">Preparing preview…</div>;
 let r:any;if(token){const row:any=await db().prepare('SELECT kind,payload FROM cms_previews WHERE id=? AND expires_at>?').bind(token,new Date().toISOString()).first();if(row)r={kind:row.kind,draft:JSON.parse(row.payload)}}else r=await getRecord(id||'');
 if(!r||!canView(me,r.kind==='placements'&&r.draft?.slug==='jobs'?'job-order':r.kind))notFound();const p=r.draft,kind=r.kind;
 const [brands,articles,industries]=await Promise.all([published('franchises'),published('articles'),published('industries')]);
 let page;
 if(kind==='franchises')page=<FranchiseDetail brand={p} brands={[p,...brands.filter(b=>b.slug!==p.slug)]}/>;
 else if(kind==='articles'||kind==='blogs')page=<EditorialArticlePage article={hydrateArticle({...p,resourceType:kind==='blogs'?'blog':'article'})} allArticles={await publishedResources()}/>;
 else if(kind==='videos')page=<VideoPage video={p}/>;
 else if(kind==='jobs')page=<JobDetail job={p}/>;
 else if(kind==='pages'&&p.slug==='homepage'||kind==='faqs'&&p.slug==='homepage')page=<HomePage home={kind==='pages'?p:await publishedPage('homepage')} faq={{questions:kind==='faqs'?p.questions:await publishedFaq('homepage')}} brands={brands} articles={await publishedResources()}/>;
 else if(kind==='pages'&&p.slug==='about-us')page=<AboutPage settings={p}/>;
 else if(kind==='pages'&&p.slug==='contact-us')page=<ContactPage brands={brands}/>;
 else if(kind==='pages'&&p.slug==='footer')page=<section className="p-container p-section"><h1>Footer preview</h1><p>Your selected social links appear in the footer below.</p></section>;
 else if(kind==='pages'&&['privacy-policy','terms-and-conditions'].includes(p.slug))page=<ManagedLegalPage page={p} contact={await publishedPage('contact-us')}/>;
 else if(kind==='placements'&&p.slug==='jobs'){const jobs=await published('jobs');page=<CareersPage jobs={[...jobs].sort((a,b)=>(p.ids.indexOf(a.slug)<0?1e6:p.ids.indexOf(a.slug))-(p.ids.indexOf(b.slug)<0?1e6:p.ids.indexOf(b.slug)))}/>;}
 else if(kind==='faqs'&&p.slug==='list-your-brand')page=<SolutionsPage brands={brands} faqs={p.questions}/>;
 else if(kind==='faqs'&&p.slug==='contact-us')page=<ContactPage brands={brands} faqs={p.questions}/>;
 else if(kind==='faqs'&&p.slug==='general')page=<ResourcesPage mode="faqs" override={{kind,payload:p}}/>;
 else if(kind==='placements'||kind==='industries'||kind==='faqs'){
 const sorted=kind==='placements'?[...brands].sort((a,b)=>{const x=p.ids.indexOf(a.slug),y=p.ids.indexOf(b.slug);return (x<0?1e6:x)-(y<0?1e6:y)}):brands;
 page=<OpportunitiesPage brands={sorted} industries={kind==='industries'?[p,...industries.filter(i=>i.slug!==p.slug)]:industries} faqs={kind==='faqs'?p.questions:await publishedFaq('opportunities')}/>;
 }else notFound();
 const [contact,footer]=await Promise.all([publishedPage('contact-us'),publishedPage('footer')]);
 return <SiteSettingsProvider value={{...(kind==='pages'&&p.slug==='contact-us'?p:contact),socialLinks:kind==='pages'&&p.slug==='footer'?p.socialLinks:footer?.socialLinks}}><div className="cms-preview-surface"><div className="cms-preview-banner"><strong>Preview</strong><span>{p.name||p.title}</span><span>Not published</span><Link href="/admin" prefetch={false}>Open admin ↗</Link></div><PremiumMotion><Header preview/>{page}<Footer/></PremiumMotion></div></SiteSettingsProvider>;
}
