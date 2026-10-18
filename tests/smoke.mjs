import assert from 'node:assert/strict';
const root=process.env.TEST_ORIGIN||'http://127.0.0.1:3018';
const routes=['/','/franchise-opportunities','/for-brands','/contact-us','/guides','/privacy-policy','/franchise/odette','/franchise/emori','/franchise/kasturi-creations','/guides/franchise-models','/guides/franchise-enquiry-checklist','/guides/franchise-ready-brand'];
for(const path of routes){const res=await fetch(root+path);assert.equal(res.status,200,path);const html=await res.text();assert.match(html,/<h1[ >]/,path+' h1');assert.match(html,/name="description"/,path+' description');assert.match(html,/rel="canonical"/,path+' canonical');assert.match(html,/noindex/,path+' preview protected');assert.doesNotMatch(html,/codex-preview|Starter Project/,path+' starter removed');console.log('PASS '+path+' · server HTML, metadata and preview noindex');}
const map=await (await fetch(root+'/sitemap.xml')).text();for(const path of routes)assert.ok(map.includes('https://ifranchise-studio-2026.babbysyed.chatgpt.site'+path),'sitemap '+path);
assert.match(await(await fetch(root+'/robots.txt')).text(),/Disallow: \/\s/);
for(const asset of ['/assets/storefronts.webp','/assets/wordmark.svg','/assets/brandmark-purple.svg','/assets/odette.webp','/assets/emori.webp','/assets/kasturi.webp'])assert.equal((await fetch(root+asset)).status,200,asset);
assert.equal((await fetch(root+'/franchise/not-a-brand')).status,404);
console.log('PASS sitemap, robots, image assets and 404 route');
