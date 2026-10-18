import {brands,guides,SITE} from '../lib/site';
import {migratedPaths} from '../lib/content';
export default function sitemap(){return [...new Set(['','/franchise-opportunities','/for-brands','/contact-us','/guides','/privacy-policy',...migratedPaths,...brands.map(b=>'/franchise/'+b.slug),...guides.map(g=>'/guides/'+g.slug)])].map(path=>({url:SITE.url+path}));}
