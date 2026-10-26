import {notFound} from 'next/navigation';
import {published} from '../../../../lib/cms/public';
import {EnquiryConfirmation} from '../../../../components/enquiry-confirmation';
export const dynamic='force-dynamic';
export const metadata={title:'Franchise enquiry confirmation',robots:{index:false,follow:false}};
export default async function ThankYou({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const brand=(await published('franchises')).find(b=>b.slug===slug);if(!brand)notFound();
 return <EnquiryConfirmation brand={{slug:brand.slug,name:brand.name,logo:brand.logo,logoAlt:brand.logoAlt,logoPresentation:brand.logoPresentation}}/>;
}
