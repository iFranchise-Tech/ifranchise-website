import {notFound,redirect} from 'next/navigation';
import {adminRoute,recordPath} from '../../../lib/cms/routes.mjs';
export const dynamic='force-dynamic';
export default async function AdminRoute({params}:{params:Promise<{path:string[]}>}){
 // vinext page params are already URL-encoded; adminRoute decodes each segment.
 const {path}=await params,route=adminRoute('/admin/'+path.join('/'));
 if(!route||route.mode==='preview')notFound();
 if(path.at(-1)==='edit'&&route.id)redirect(recordPath(route.id));
 return null;
}
