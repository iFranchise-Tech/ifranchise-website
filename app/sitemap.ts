import {brands,guides,SITE} from '../lib/site';
import {migratedPaths,redirects} from '../lib/content';
export default function sitemap(){return [...new Set(['','/franchise-opportunities','/franchise-solutions','/insights','/contact-us','/guides','/privacy-policy','/photo-credits',...migratedPaths,...brands.map(b=>'/franchise/'+b.slug),...guides.map(g=>'/guides/'+g.slug)])].filter(path=>!(path in redirects)).map(path=>({url:SITE.url+path}));}
