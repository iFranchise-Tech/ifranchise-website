import {ArticleLibrary} from './article-library';
import {EditorialCover} from "./editorial-cover";
import {editorialArticles,articleCards} from '../lib/editorial';
import {editorialCollections} from '../lib/editorial-collections';
import {SITE} from '../lib/site';
export function EditorialCollection({slug}:{slug:string}){
 const c=editorialCollections.find(c=>c.slug===slug)!;
 const items=editorialArticles.filter(a=>a.audience===c.audience&&(!c.category||a.category===c.category));
 const topics=[...new Set(items.map(a=>a.category))];
 const schema={'@context':'https://schema.org','@type':'CollectionPage',name:c.title,description:c.description,url:SITE.url+'/blogs/'+slug,isPartOf:{'@type':'CollectionPage',url:SITE.url+'/blogs'},mainEntity:{'@type':'ItemList',numberOfItems:items.length,itemListElement:items.map((a,i)=>({'@type':'ListItem',position:i+1,name:a.title,url:SITE.url+a.path}))}};
 return <main id="main" className="blogs-page audience-collection"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><header className="blogs-hero"><div className="page-wrap"><nav className="article-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/blogs">Blogs & Resources</a><span>/</span><span>{c.label}</span></nav><div className="collection-heading"><div><h1>{c.title}</h1><p>{c.intro}</p><span className="collection-count">{items.length} articles · Practical explanations, checklists and primary sources</span></div><EditorialCover src={'/art/editorial-integrated/'+c.cover+'.webp'}/></div><nav className="collection-nav" aria-label="Resource collections">{editorialCollections.map(x=><a key={x.slug} href={'/blogs/'+x.slug} aria-current={x.slug===slug?'page':undefined}>{x.label}</a>)}</nav></div></header><div className="section blogs-library"><ArticleLibrary items={articleCards(items)} unified hideAudience/><details className="article-directory"><summary>Browse every article by topic</summary><div className="article-directory-grid">{topics.map(topic=><section key={topic}><h2>{topic}</h2><ul>{items.filter(a=>a.category===topic).map(a=><li key={a.slug}><a href={a.path}>{a.title}</a></li>)}</ul></section>)}</div></details></div></main>;
}
