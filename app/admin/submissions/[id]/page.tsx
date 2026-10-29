import {auditIntake} from '../../../../lib/intake/audit';
import {adminIdentity, db, CmsError} from '../../../../lib/cms/auth';
import {canViewSubmission, publicRecord} from '../../../../lib/intake/access';
import {SubmissionDetails} from '../../../../components/admin/submissions';
import {StaffSignIn} from '../../../../components/admin/staff-sign-in';
export const dynamic = 'force-dynamic';
export default async function Page({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    const me = await adminIdentity();
    const record: any = await db().prepare('SELECT * FROM website_submissions WHERE id=?').bind(id).first();
    if (!record || !canViewSubmission(me, record.kind)) throw new CmsError(404, 'Submission unavailable.');
    await auditIntake(me.email, record.id, 'view submission');
    return <main className="cms-main submission-page"><a className="cms-link" href="/admin">← Website admin</a><h1>Submission</h1><SubmissionDetails record={publicRecord(record)}/></main>;
  } catch (error) {
    const status = error instanceof CmsError ? error.status : 500;
    const message = error instanceof CmsError ? error.message : 'This submission is unavailable.';
    return <StaffSignIn status={status} message={message} returnPath={'/admin/submissions/' + id}/>;
  }
}
