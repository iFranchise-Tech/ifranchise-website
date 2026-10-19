import {EditorialCollection} from '../../../components/editorial-collection';
import {editorialCollections} from '../../../lib/editorial-collections';
const c=editorialCollections.find(x=>x.slug==='industries')!;
export const metadata={title:c.title,description:c.description,alternates:{canonical:'/blogs/'+c.slug},openGraph:{title:c.title,description:c.description,images:[{url:'/art/editorial-integrated/'+c.cover+'.webp'}]}};
export default function Collection(){return <EditorialCollection slug={c.slug}/>;}
