import {SITE} from '../lib/site';
export default function robots(){return {rules:{userAgent:'*',...(SITE.preview?{disallow:'/'}:{allow:'/',disallow:'/api/'})},sitemap:SITE.url+'/sitemap.xml'};}
