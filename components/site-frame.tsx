'use client';
import {usePathname} from 'next/navigation';
import {Header,Footer,WhatsAppButton} from './shell';
import {Measurement} from './measurement';
import {PremiumMotion} from './premium-motion';
import {Privacy} from './privacy';
import {PageNavigation} from './page-navigation';
import {AssetCache} from './asset-cache';
export function SiteFrame({children}:{children:React.ReactNode}){const path=usePathname();if(path==='/admin'||path.startsWith('/admin/'))return <>{children}</>;return <PremiumMotion><PageNavigation/><Header/>{children}<Footer/><WhatsAppButton/><Privacy/><Measurement/><AssetCache/></PremiumMotion>}
