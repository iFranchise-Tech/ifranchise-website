import {AdminFrame} from '../../components/admin/frame';
import './admin.css';
import './workspace.css';
export const metadata={title:'Admin',robots:{index:false,follow:false}};
export default function AdminLayout({children}:{children:React.ReactNode}){return <AdminFrame>{children}</AdminFrame>}
