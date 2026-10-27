import {loadResourceCollections} from '../lib/resource-loading.mjs';
import {pageBanners} from '../lib/page-banners';
import {selectedItems,resourceKey} from '../lib/cms/display.mjs';
import {publishedResources} from '../lib/cms/public';
import {responsiveImage} from '../lib/responsive-image';
import {published} from '../lib/cms/public';
import {PhotoHero} from './photo-hero';
import {Crumb,PremiumLink} from './premium';
import {ResourceActions} from './resource-actions';
import {validResourceCategory} from '../lib/resource-categories.mjs';
import {ResourceLibrary} from './resource-library';
const resourceBanners:Record<string,{title:string;description:string;ratio:string;image:string;alt:string;position:string}>={
 all:{title:'Resources',description:'Practical insights for choosing franchise opportunities, building franchise systems and growing a business in India.',...pageBanners.resources},
 blogs:{title:'Franchise insights',description:'Explore perspectives on franchise opportunities, business models, industry developments and brand expansion.',...pageBanners.blogs},
 articles:{title:'Articles on franchising and business growth',description:'Practical guidance on franchise investment, operating models, business planning and expansion decisions.',...pageBanners.articles},
 videos:{title:'Franchise learning and insights',description:'Watch informative content about franchise models, business opportunities, operations and expansion.',...pageBanners.videos}
};
export async function ResourcesPage({mode='all',category='all',override}:{mode?:string;category?:string;override?:{kind:string;payload:any}}){
 const banner=resourceBanners[mode]||resourceBanners.all;
 const lists:Record<string,any[]>=await loadResourceCollections(published,mode);if(override&&lists[override.kind])lists[override.kind]=[override.payload,...lists[override.kind].filter(v=>v.slug!==override.payload.slug)];
 const items=Object.entries(lists).flatMap(([kind,values])=>(mode==='all'||mode===kind)?values.map(a=>({title:a.title,excerpt:a.excerpt,image:a.image,imageAlt:a.imageAlt,minutes:a.minutes,date:a.date,category:a.category,resourceCategory:a.resourceCategory,audience:a.audience,type:kind==='articles'?'Article':kind==='blogs'?'Blog':'Video',path:kind==='videos'?'/resources/videos/'+a.slug:a.path})):[]);
 items.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 return <main id="main" className="p-page resources-page"><PhotoHero editorial imageRatio={banner.ratio} image={banner.image} imageAlt={banner.alt} imagePosition={banner.position} title={banner.title} description={banner.description}/><section className="p-container resource-library" id="resource-library"><ResourceLibrary key={mode} mode={mode} initialCategory={validResourceCategory(category)?category:'all'} items={items}/></section></main>;
}
export async function VideoPage({video:v}:{video:any}){const related=selectedItems(v.relatedResources,(await publishedResources()).map((r:any)=>({...r,resourceId:resourceKey(r)})),'resourceId')||[];return <main id="main" className="p-page reading-video-page"><ResourceActions key={v.slug} resource={{path:'/resources/videos/'+v.slug,title:v.title,type:'video',image:v.image}}/><div className="p-container resource-video"><Crumb label="Video"/><a className="p-link" href="/resources/videos">← All videos</a><h1>{v.title}</h1><p className="p-lead">{v.excerpt}</p><div data-reading-content><a className="resource-video-link" href={v.youtubeUrl} target="_blank" rel="noopener noreferrer">{v.image&&<img {...responsiveImage(v.image,'(max-width: 900px) 92vw, 1000px')} decoding="async" alt={v.imageAlt||v.title} width="1200" height="675"/>}<span>Watch on YouTube ↗</span></a>{v.transcript&&<section id="transcript"><h2>Transcript</h2>{v.transcript.split('\n\n').map((p:string,i:number)=><p key={i}>{p}</p>)}</section>}</div>{related.length>0&&<section className="p-section"><h2>Continue reading</h2><div className="p-reading-grid">{related.map((r:any)=><a className="p-reading-card" href={r.path} key={r.resourceId}>{r.image&&<img src={r.image} alt={r.imageAlt||r.title} loading="lazy"/>}<h3>{r.title}</h3><span>Explore resource ↗</span></a>)}</div></section>}</div></main>}
