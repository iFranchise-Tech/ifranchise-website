import {published} from '../../../lib/cms/public';
import {SavedResources} from '../../../components/saved-resources';
export const metadata={title:'Saved resources',robots:{index:false,follow:false}};
export default async function SavedPage(){
 const [articles,blogs,videos]=await Promise.all([published('articles'),published('blogs'),published('videos')]);
 const items=Object.entries({articles,blogs,videos}).flatMap(([kind,values])=>values.map(a=>({title:a.title,excerpt:a.excerpt,image:a.image,imageAlt:a.imageAlt,minutes:a.minutes,category:a.category,type:kind==='articles'?'Article':kind==='blogs'?'Blog':'Video',path:kind==='videos'?'/resources/videos/'+a.slug:a.path})));
 return <SavedResources items={items}/>;
}
