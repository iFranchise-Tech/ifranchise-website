'use client';
import {NotificationProvider} from './notifications';
import {ConfirmationProvider} from './confirmation';
import {usePathname} from 'next/navigation';
import {AdminPortal} from './portal';
import type {ComponentProps} from 'react';
import {SessionBoundary} from './session-boundary';
export function AdminFrame({children,me,localSession}:{children:React.ReactNode;me:ComponentProps<typeof AdminPortal>['me'];localSession:boolean}){
 const pathname=usePathname();
 return <SessionBoundary email={me.email} version={me.version}>{pathname==='/admin/preview'||pathname.endsWith('/preview')?<>{children}</>:<div className="cms-root"><NotificationProvider><ConfirmationProvider><AdminPortal me={me} localSession={localSession}/></ConfirmationProvider></NotificationProvider></div>}</SessionBoundary>;
}
