import type {Metadata} from 'next';
import './globals.css';
import {Header,Footer,WhatsAppButton} from '../components/shell';
import {Measurement} from '../components/measurement';
import {Privacy} from '../components/privacy';
import {SITE} from '../lib/site';
export const metadata:Metadata={metadataBase:new URL(SITE.url),title:{default:'iFranchise — Franchise Consulting & Opportunities in India',template:'%s | iFranchise'},description:'Explore franchise opportunities in India or build your brand’s expansion plan with iFranchise. Compare franchise models, investment requirements and expansion options with practical consulting support.',robots:{index:!SITE.preview,follow:!SITE.preview},openGraph:{type:'website',locale:'en_IN',siteName:'iFranchise',title:'Franchise Consulting & Opportunities in India | iFranchise',description:'Franchise selection, development and expansion consulting for investors and businesses in India.',images:[{url:'/stock/business-consultation.jpg',width:1600,height:1067,alt:'Business consultation'}]},twitter:{card:'summary_large_image'},icons:{icon:'/assets/brandmark-purple.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-IN"><body><Header/>{children}<Footer/><WhatsAppButton/><Privacy/><Measurement/></body></html>}
