import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
// Preserve existing links in notifications and bookmarks.
export default async function SubmissionLink({params}:{params:Promise<{id:string}>}){
 const {id}=await params;redirect('/admin/inbox/'+id);
}
