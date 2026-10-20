'use client';
import {usePathname} from 'next/navigation';
import {Header,Footer,WhatsAppButton} from './shell';
import {Measurement} from './measurement';
import {PremiumMotion} from './premium-motion';
import {Privacy} from './privacy';
export function SiteFrame({children}:{children:React.ReactNode}){const path=usePathname();if(path==='/admin'||path.startsWith('/admin/'))return <>{children}</>;return <PremiumMotion><Header/>{children}<Footer/><WhatsAppButton/><Privacy/><Measurement/></PremiumMotion>}
