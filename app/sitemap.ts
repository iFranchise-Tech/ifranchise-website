import {guides,SITE} from '../lib/site';
import {editorialPages,cityByPath,redirects} from '../lib/content';
import {published} from '../lib/cms/public';
export const dynamic='force-dynamic';
export default async function sitemap(){const [brands,articles,jobs]=await Promise.all([published('franchises'),published('articles'),published('jobs')]);return [...new Set(['','/franchise-opportunities','/list-your-brand','/blogs','/blogs/for-investors','/blogs/for-brands','/blogs/franchise-basics','/blogs/industries','/contact-us','/guides','/privacy-and-terms',...Object.keys(editorialPages),...Object.keys(cityByPath),...articles.map(a=>a.path),...jobs.map(j=>'/careers/'+j.id),...brands.map(b=>'/franchise/'+b.slug),...guides.map(g=>'/guides/'+g.slug)])].filter(path=>!(path in redirects)).map(path=>({url:SITE.url+path}));}
