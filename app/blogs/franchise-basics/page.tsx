import {EditorialCollection} from '../../../components/editorial-collection';
import {editorialCollections} from '../../../lib/editorial-collections';
const c=editorialCollections.find(x=>x.slug==='franchise-basics')!;
export const metadata={title:c.title,description:c.description,alternates:{canonical:'/blogs/'+c.slug},openGraph:{title:c.title,description:c.description,images:[{url:'/art/natural/collections/'+c.slug+'.webp',alt:c.imageAlt,width:1200,height:800}]}};
export default function Collection(){return <EditorialCollection slug={c.slug}/>;}
