import {notFound} from 'next/navigation';
import Preview from '../../../preview/page';
import {adminRoute} from '../../../../../lib/cms/routes.mjs';
export const dynamic='force-dynamic';
export default async function RecordPreview({params,searchParams}:{params:Promise<{module:string;id:string}>;searchParams:Promise<{token?:string;loading?:string}>}){
 const p=await params,route=adminRoute('/admin/'+p.module+'/'+p.id+'/preview');
 if(!route||route.mode!=='preview')notFound();
 return Preview({searchParams:Promise.resolve({...await searchParams,id:route.id})});
}
