import {AdminFrame} from '../../components/admin/frame';
import {adminIdentity, CmsError} from '../../lib/cms/auth';
import {StaffSignIn} from '../../components/admin/staff-sign-in';
import Script from 'next/script';
import './admin.css';
import './workspace.css';
export const metadata={title:'Admin',robots:{index:false,follow:false}};
export default async function AdminLayout({children}:{children:React.ReactNode}){
 let me;
 try { me=await adminIdentity(); }
 catch(error){
  const status=error instanceof CmsError?error.status:503;
  const message=error instanceof CmsError?error.message:'The admin portal is temporarily unavailable.';
  return <div className="cms-root"><StaffSignIn status={status} message={message} returnPath="/admin"/></div>;
 }
 return <><Script id="cms-history-guard" strategy="beforeInteractive">{`window.addEventListener('popstate',function(event){window.dispatchEvent(new CustomEvent('cms:history-popstate',{detail:event}));});`}</Script><AdminFrame me={me} localSession={import.meta.env.DEV===true&&me.userId.startsWith('local-dev:')}>{children}</AdminFrame></>;
}
