import {notFound,permanentRedirect} from 'next/navigation';
import {published} from '../../../../lib/cms/public';
import {VideoPage} from '../../../../components/resources-page';
import {EditorialArticlePage} from '../../../../components/editorial-article';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{type:string;slug:string}>}){const {type,slug}=await params;const item=['blogs','videos'].includes(type)?(await published(type)).find(v=>v.slug===slug):null;return {title:item?.title||'Resource',description:item?.excerpt,alternates:{canonical:'/resources/'+type+'/'+slug}}}
export default async function Page({params}:{params:Promise<{type:string;slug:string}>}){const {type,slug}=await params;if(type==='knowledge-hub'&&['investor','brand'].includes(slug))permanentRedirect('/blogs/'+(slug==='investor'?'for-investors':'for-brands'));if(!['blogs','videos'].includes(type))notFound();const items=await published(type),item=items.find(v=>v.slug===slug);if(!item)notFound();return type==='videos'?<VideoPage video={item}/>:<EditorialArticlePage article={item} allArticles={items}/>}
