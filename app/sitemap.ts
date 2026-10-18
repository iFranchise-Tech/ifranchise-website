import {brands,guides,SITE} from '../lib/site';
export default function sitemap(){return ['','/franchise-opportunities','/for-brands','/contact-us','/guides','/privacy-policy',...brands.map(b=>'/franchise/'+b.slug),...guides.map(g=>'/guides/'+g.slug)].map(path=>({url:SITE.url+path}));}
