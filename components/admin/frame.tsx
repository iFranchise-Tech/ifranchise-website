'use client';
import {usePathname} from 'next/navigation';
export function AdminFrame({children}:{children:React.ReactNode}){return usePathname()==='/admin/preview'?<>{children}</>:<div className="cms-root">{children}</div>}
