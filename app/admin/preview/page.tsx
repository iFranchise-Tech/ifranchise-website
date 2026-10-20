import {notFound} from 'next/navigation';
import {adminIdentity} from '../../../lib/cms/auth';
import {canView} from '../../../lib/cms/policy.mjs';
import {getRecord} from '../../../lib/cms/store';
import {hydrateArticle,published} from '../../../lib/cms/public';
import {EditorialArticlePage} from '../../../components/editorial-article';
import {FranchiseDetail} from '../../../components/franchise-detail';
import {JobDetail} from '../../../components/job-detail';
import {ThemeToggle} from '../../../components/theme-toggle';
import {HomeBackdrop} from '../../../components/home-backdrop';
export const dynamic='force-dynamic';
export const metadata={title:'Content preview',robots:{index:false,follow:false}};
export default async function Preview({searchParams}:{searchParams:Promise<{id:string}>}){
 let me;try{me=await adminIdentity()}catch{notFound()}
 const {id}=await searchParams,r=await getRecord(id||'');if(!r||!canView(me,r.kind))notFound();const p=r.draft;
 return <><div className="cms-root cms-preview-toolbar"><a className="cms-button" href="/admin">Back to admin</a><span>Draft preview · {p.title||p.name}</span><ThemeToggle/></div>{r.kind==='articles'?<EditorialArticlePage article={hydrateArticle(p)} allArticles={await published('articles')}/>:r.kind==='jobs'?<JobDetail job={p}/>:r.kind==='franchises'?<FranchiseDetail brand={p} brands={[]}/>:r.kind==='pages'&&r.slug==='homepage'?<main className="home-redesign"><div className="home-opening"><HomeBackdrop/><section className="home-lead home-width"><div className="home-lead-copy"><h1>{p.headline} <em>{p.accent}</em></h1><p>{p.intro}</p></div></section><section className="home-overview home-width"><div className="home-overview-heading"><h2>{p.overviewTitle}</h2><p>{p.overviewIntro}</p></div></section></div></main>:<main className="cms-root cms-preview-document"><h1>{p.title}</h1>{p.questions?.map((x:any,i:number)=><section key={i}><h2>{x.q}</h2><p>{x.a}</p></section>)}{p.ids&&<ol>{p.ids.map((s:string)=><li key={s}>{s}</li>)}</ol>}</main>}</>;
}
