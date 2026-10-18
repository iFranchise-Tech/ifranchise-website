import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const articles=JSON.parse(readFileSync('content/editorial.json')),root=process.env.TEST_ORIGIN||'http://127.0.0.1:3018';
assert.equal(articles.length,30);assert.equal(new Set(articles.map(a=>a.slug)).size,30);
const sitemap=await(await fetch(root+'/sitemap.xml')).text();
for(const a of articles){
 assert(a.sections.length>=5,a.slug);assert(a.faqs.length>=2,a.slug);assert(a.sources.length>=2,a.slug);
 assert(existsSync('public/art/editorial/'+a.cover+'.webp'),a.slug);
 for(const s of a.relatedSlugs)assert(articles.some(x=>x.slug===s),s);
 const path='/blogs/'+a.slug,r=await fetch(root+path),html=await r.text();assert.equal(r.status,200,path);
 assert.match(html,/<h1[ >]/);assert.match(html,/name="description"/);assert.match(html,/property="og:type" content="article"/);
 assert(html.includes('rel="canonical" href="https://ifranchise-studio-2026.babbysyed.chatgpt.site'+path+'"'),path);
 assert.match(html,/BlogPosting/);assert.match(html,/BreadcrumbList/);assert.match(html,/Sources &amp; further reading/);
 assert.match(html,/noindex/);assert(!html.includes('From the iFranchise editorial archive'),path);
 assert(sitemap.includes('https://ifranchise-studio-2026.babbysyed.chatgpt.site'+path),path);
 for(let i=0;i<a.sections.length;i++)assert(html.includes('id="section-'+(i+1)+'"'),path);
}
const home=await(await fetch(root)).text();assert.match(home,/sculpture-canvas/);assert(!home.includes('sculpture-plane'));
const config=readFileSync('lib/journey-client.mjs','utf8');assert.match(config,/intakeEnabled:\s*false/);assert.match(config,/conversionSending:\s*false/);
console.log('PASS 30 original article pages: metadata, schema, canonical URLs, sources, contents, cover images, related links and sitemap; lead intake and conversion sending remain off.');
