import {notFound,permanentRedirect} from 'next/navigation';
import {ResourcesPage} from '../../../components/resources-page';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{type:string}>}){const {type}=await params;return {title:type==='faqs'?'Franchising FAQs':type[0]?.toUpperCase()+type.slice(1),description:'Explore iFranchise resources on franchise opportunities, operations and business expansion.',alternates:{canonical:'/resources/'+type}}}
export default async function Page({params}:{params:Promise<{type:string}>}){const {type}=await params;if(type==='knowledge-hub')permanentRedirect('/resources');if(!['blogs','articles','faqs','videos'].includes(type))notFound();return <ResourcesPage mode={type}/>}
