import {permanentRedirect,notFound} from 'next/navigation';
import {redirects} from '../../../lib/content';
export default async function Guide({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const to=(redirects as Record<string,string>)['/guides/'+slug];if(to)permanentRedirect(to);notFound();}
