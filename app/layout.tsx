import type {Metadata} from 'next';
import './globals.css';
import {Header,Footer} from '../components/shell';
import {Measurement} from '../components/measurement';
import {Privacy} from '../components/privacy';
import {SITE} from '../lib/site';
export const metadata:Metadata={metadataBase:new URL(SITE.url),title:{default:'iFranchise — Franchise Consulting & Opportunities in India',template:'%s | iFranchise'},description:'Explore franchise opportunities in India or build your brand’s expansion plan with iFranchise. Clear choices, considered guidance and a more personal path to growth.',robots:{index:!SITE.preview,follow:!SITE.preview},openGraph:{type:'website',locale:'en_IN',siteName:'iFranchise',title:'Your next chapter starts here. | iFranchise',description:'Franchise consulting for ambitious brands and future business owners in India.',images:[{url:'/assets/storefronts.webp',width:1536,height:1024,alt:'Illustrative storefronts for the iFranchise website'}]},twitter:{card:'summary_large_image'},icons:{icon:'/assets/brandmark-purple.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-IN"><body><Header/>{children}<Footer/><Privacy/><Measurement/></body></html>}
