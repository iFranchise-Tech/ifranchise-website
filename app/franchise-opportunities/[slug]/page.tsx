import {notFound} from 'next/navigation';
import {FranchiseDetail} from '../../../components/franchise-detail';
import {published} from '../../../lib/cms/public';

export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const brands=await published('franchises');
 const {slug}=await params,b=brands.find(b=>b.slug===slug);
 return b?{title:b.name+' Franchise | Investment, Business & Enquiry',description:b.description,alternates:{canonical:'/franchise-opportunities/'+b.slug},openGraph:{images:[b.gallery[0]||b.logo]}}:{};
}
export default async function Brand({params}:{params:Promise<{slug:string}>}){
 const brands=await published('franchises');const {slug}=await params,b=brands.find(b=>b.slug===slug);if(!b)notFound();
 return <FranchiseDetail brand={b} brands={brands}/>;
}
