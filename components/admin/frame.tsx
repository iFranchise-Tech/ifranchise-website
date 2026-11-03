'use client';
import {NotificationProvider} from './notifications';
import {ConfirmationProvider} from './confirmation';
import {usePathname} from 'next/navigation';
import {AdminPortal} from './portal';
import type {ComponentProps} from 'react';
export function AdminFrame({children,me,localSession}:{children:React.ReactNode;me:ComponentProps<typeof AdminPortal>['me'];localSession:boolean}){
 const pathname=usePathname();
 return pathname==='/admin/preview'||pathname.endsWith('/preview')?<>{children}</>:<div className="cms-root"><NotificationProvider><ConfirmationProvider><AdminPortal me={me} localSession={localSession}/></ConfirmationProvider></NotificationProvider></div>;
}
