import {AdminPortal} from '../../components/admin/portal';
import {StaffSignIn} from '../../components/admin/staff-sign-in';
import {adminIdentity, CmsError} from '../../lib/cms/auth';
export const dynamic = 'force-dynamic';
export default async function Admin() {
  try {
    const me=await adminIdentity();
    return <AdminPortal me={me} localSession={import.meta.env.DEV===true && me.userId.startsWith('local-dev:')}/>;
  } catch (error) {
    const status = error instanceof CmsError ? error.status : 500;
    const message = error instanceof CmsError ? error.message : 'The admin portal is temporarily unavailable.';
    return <StaffSignIn status={status} message={message} returnPath="/admin"/>;
  }
}
