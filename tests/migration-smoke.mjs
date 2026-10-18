import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=process.env.TEST_ORIGIN||'http://127.0.0.1:3018';
const read=n=>JSON.parse(readFileSync(new URL('../content/'+n+'.json',import.meta.url),'utf8'));
const brands=read('brands'),routes=[...new Set([...read('route-inventory').map(x=>x.path),'/franchise-solutions','/insights','/data-rights-request','/for-brands','/guides','/guides/franchise-models','/guides/franchise-enquiry-checklist','/guides/franchise-ready-brand'])];
assert.equal(brands.length,12);assert.equal(read('blogs').length,7);assert.equal(read('knowledge').length,16);
const errors=[];for(let i=0;i<routes.length;i+=4)await Promise.all(routes.slice(i,i+4).map(async path=>{try{const r=await fetch(root+path),html=await r.text();assert.equal(r.status,200,path);assert.match(html,/<h1[ >]/);assert.match(html,/name="description"/);assert.match(html,/rel="canonical"/);assert.match(html,/noindex/);assert.doesNotMatch(html,/Internal Server Error|Starter Project|John Doe|15,725/);}catch(e){errors.push(path+': '+e.message);}}));assert.deepEqual(errors,[]);
for(const b of brands){assert(existsSync(new URL('../public'+b.logo,import.meta.url)),b.logo);for(const a of b.gallery)assert(existsSync(new URL('../public'+a,import.meta.url)),a);if(b.brochure)assert(existsSync(new URL('../public'+b.brochure,import.meta.url)),b.brochure);}
const map=await(await fetch(root+'/sitemap.xml')).text();for(const p of routes.filter(p=>!(p in read('redirects'))))assert(map.includes('https://ifranchise-studio-2026.babbysyed.chatgpt.site'+(p==='/'?'':p)),'sitemap '+p);
for(const [from,to]of Object.entries(read('redirects'))){const r=await fetch(root+from,{redirect:'manual'});assert.equal(r.status,308,from);assert.equal(r.headers.get('location'),to,from);}
assert.equal((await fetch(root+'/not-an-existing-route')).status,404);assert.equal((await fetch(root+'/franchise/not-a-brand')).status,404);
console.log('PASS '+routes.length+' server-rendered pages, 12 brands, legacy article redirects, migrated brand media, sitemap, '+Object.keys(read('redirects')).length+' redirects and 404s');
