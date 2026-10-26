import {ResourcesPage} from '../../components/resources-page';
export const dynamic='force-dynamic';
export const metadata={title:'Resources — Franchise Guides, Blogs & Videos',description:'Explore franchise articles, blogs and videos about business ownership, operations and expansion.',alternates:{canonical:'/resources'}};
export default async function Page({searchParams}:{searchParams:Promise<{category?:string}>}){const {category}=await searchParams;return <ResourcesPage category={category}/>}
