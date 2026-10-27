import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {isCacheableAsset,isCacheableResponse} from '../lib/asset-cache-policy.mjs';

test('the cache excludes pages, personal data, uploads and application endpoints',()=>{
 for(const path of ['/','/admin','/franchise/emori','/api/intake/session','/api/admin/intake/resume/1','/media/resume.pdf','/api/admin/records','/private/document.webp','/optimized/unhashed.webp','/assets/stock-heroes/private/photo.webp','/assets/stock-heroes/photo.svg','/assets/home-hero/plan-to-presence.mp4'])assert.equal(isCacheableAsset(path),false,path);
 for(const path of ['/_next/static/chunks/index-ab123.js','/_next/static/css/index.ab123.css','/optimized/retail-123456abcdef-800.webp','/fonts/manrope-400.woff2','/assets/ifranchise-wordmark.svg','/assets/stock-heroes/blogs-business-journal-hd-1440.webp','/assets/stock-heroes/mobile/about-collaborative-team-hd.webp','/assets/home-hero/plan-to-presence.webp'])assert.equal(isCacheableAsset(path),true,path);
 assert.equal(isCacheableResponse(new Response('<html>Sign in</html>',{headers:{'content-type':'text/html'}})),false);
 assert.equal(isCacheableResponse(new Response('data',{status:403,headers:{'content-type':'image/webp'}})),false);
 assert.equal(isCacheableResponse(new Response('data',{headers:{'content-type':'image/webp','set-cookie':'private=1'}})),false);
});

test('all generated responsive images exist and preserve source references',async()=>{
 const manifest=JSON.parse(await fs.readFile('lib/image-manifest.json','utf8'));
 for(const [src,[stem,widths]] of Object.entries(manifest)){
  await fs.access('public'+src);
  assert.ok(widths.length>0&&widths.every((w,i)=>!i||w>widths[i-1]));
  for(const width of widths){const file=`/optimized/${stem}-${width}.webp`;assert.ok(isCacheableAsset(file));await fs.access('public'+file);}
 }
 assert.ok(manifest['/stock/careers-collaboration.jpg']);
 assert.equal(manifest['/favicon.png'],undefined);
});

test('service worker reuses static assets, updates caches and ignores all sensitive routes',async()=>{
 const source=await fs.readFile('dist/client/asset-cache-sw.js','utf8'),events={},buckets=new Map([['unrelated-cache',new Map()],['ifranchise-assets-old',new Map()]]);
 let fetches=0,claims=0;
 const context={URL,Response,self:{location:{origin:'https://example.test'},clients:{claim:async()=>claims++},skipWaiting:async()=>{},addEventListener:(n,fn)=>events[n]=fn},caches:{keys:async()=>[...buckets.keys()],delete:async k=>buckets.delete(k),open:async k=>{
  if(!buckets.has(k))buckets.set(k,new Map());const entries=buckets.get(k);
  return {match:async r=>entries.get(r.url)?.clone(),put:async(r,v)=>entries.set(r.url,v.clone()),keys:async()=>[...entries.keys()],delete:async key=>entries.delete(typeof key==='string'?key:key.url)};
 }},fetch:async()=>{fetches++;return new Response('image',{headers:{'content-type':'image/webp'}})}};
 vm.runInNewContext(source,context);
 async function dispatch(path,{method='GET',mode='cors',headers=new Headers()}={}){let response;const waits=[];events.fetch({request:{url:new URL(path,'https://example.test').href,method,mode,headers},respondWith:p=>response=p,waitUntil:p=>waits.push(p)});if(response){const r=await response;await Promise.all(waits);return r;}}
 const asset='/optimized/retail-123456abcdef-800.webp';
 assert.equal(await (await dispatch(asset)).text(),'image');
 assert.equal(await (await dispatch(asset)).text(),'image');assert.equal(fetches,1);
 for(const path of ['/assets/stock-heroes/blogs-business-journal-hd-1440.webp','/assets/stock-heroes/mobile/about-collaborative-team-hd.webp']){const before=fetches;await dispatch(path);await dispatch(path);assert.equal(fetches,before+1);}
 for(const path of ['/api/intake/session','/admin','/','/media/resume.pdf','https://other.test'+asset,asset+'?private=true'])assert.equal(await dispatch(path),undefined,path);
 assert.equal(await dispatch(asset,{method:'POST'}),undefined);
 assert.equal(await dispatch(asset,{mode:'navigate'}),undefined);
 assert.equal(await dispatch(asset,{headers:new Headers({range:'bytes=0-20'})}),undefined);
 const waits=[];events.activate({waitUntil:p=>waits.push(p)});await Promise.all(waits);
 assert.ok(!buckets.has('ifranchise-assets-old'));assert.ok(buckets.has('unrelated-cache'));assert.equal(claims,1);
 // A new release keeps content-hashed images, while stable artwork URLs refresh.
 vm.runInNewContext(source.replace(/const CACHE='[^']+'/,"const CACHE='ifranchise-assets-next-release'"),{...context});
 const nextWaits=[];events.activate({waitUntil:p=>nextWaits.push(p)});await Promise.all(nextWaits);
 const before=fetches;await dispatch(asset);assert.equal(fetches,before,'unchanged optimized image survives deployment');
 await dispatch('/optimized/retail-fedcba654321-800.webp');assert.equal(fetches,before+1,'changed image gets fresh content');
 await dispatch('/assets/stock-heroes/blogs-business-journal-hd-1440.webp');assert.equal(fetches,before+2,'stable URL is refreshed after deployment');
});
