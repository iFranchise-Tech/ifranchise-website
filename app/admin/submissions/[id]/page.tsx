import {auditIntake} from '../../../../lib/intake/audit';
import {adminIdentity,db,CmsError} from '../../../../lib/cms/auth';
import {canViewSubmission,publicRecord} from '../../../../lib/intake/access';
import {SubmissionDetails} from '../../../../components/admin/submissions';
import {accessSignInPath} from '@/lib/access-auth';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;try{const me=await adminIdentity(),r:any=await db().prepare('SELECT * FROM website_submissions WHERE id=?').bind(id).first();if(!r||!canViewSubmission(me,r.kind))throw new CmsError(404,'Submission unavailable.');await auditIntake(me.email,r.id,'view submission');return <main className="cms-main submission-page"><a className="cms-link" href="/admin">← Website admin</a><h1>Submission</h1><SubmissionDetails record={publicRecord(r)}/></main>}catch(e){return <main className="cms-access"><section><h1>{e instanceof CmsError&&e.status===401?'Sign in':'Access unavailable'}</h1><p>{e instanceof CmsError?e.message:'This submission is unavailable.'}</p>{e instanceof CmsError&&e.status===401&&<a className="cms-button cms-primary" href={accessSignInPath('/admin/submissions/'+id)} target="_top">Sign in</a>}<a className="cms-link" href="/admin">Website admin</a></section></main>}}
