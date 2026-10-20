import {Store,Network,ArrowUpRight} from 'lucide-react';
import {SITE} from '../lib/site';
import {socialLinks} from '../lib/contact';
import {published,publishedPage} from '../lib/cms/public';
import {BrandCard} from '../components/ui';
import {PremiumLink,InlineLink,SectionHeading,Questions,RouteLines,ScrollLink} from '../components/premium';
export const dynamic='force-dynamic';
export const metadata={title:'Franchise Consulting Company in India',description:'Explore franchise opportunities and develop your business expansion plan with iFranchise. Advice on franchise selection, business models, operations and growth.',alternates:{canonical:'/'}};
import {HomePage} from '../components/home-page';
export default async function Home(){const [home,faqs,brands,articles]=await Promise.all([publishedPage('homepage'),published('faqs'),published('franchises'),published('articles')]);return <HomePage home={home} faq={faqs.find(f=>f.slug==='homepage')||{questions:[]}} brands={brands} articles={articles}/>;}
