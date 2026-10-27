import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {isCacheableAsset,isCacheableResponse} from '../lib/asset-cache-policy.mjs';

const root=path.resolve('dist/client'),hash=createHash('sha256');
async function walk(dir){for(const entry of (await fs.readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
 const file=path.join(dir,entry.name);
 if(entry.isDirectory())await walk(file);
 else if(isCacheableAsset('/'+path.relative(root,file).split(path.sep).join('/'))){hash.update(path.relative(root,file));hash.update(await fs.readFile(file));}
}}
await walk(root);
const revision=hash.digest('hex').slice(0,16);
const source=`/* Generated from this deployment's static assets. */
const CACHE='ifranchise-assets-${revision}', IMAGES='ifranchise-assets-images-v1', PREFIX='ifranchise-assets-', LIMIT=180;
${isCacheableAsset.toString()}
${isCacheableResponse.toString()}
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE&&key!==IMAGES)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||request.mode==='navigate'||request.headers.has('range')||url.origin!==self.location.origin||url.search||!isCacheableAsset(url.pathname))return;
 event.respondWith((async()=>{
  let cache;
  // Optimized image URLs contain a source-content hash. Keep their bounded
  // cache across releases so a code update does not redownload unchanged art.
  // Assets with stable URLs still use the deployment-specific cache.
  const cacheName=url.pathname.startsWith('/optimized/')?IMAGES:CACHE;
  try{cache=await caches.open(cacheName);const saved=await cache.match(request);if(saved)return saved;}catch{}
  const response=await fetch(request);
  if(cache&&isCacheableResponse(response)){
   const copy=response.clone();
   event.waitUntil((async()=>{try{
    await cache.put(request,copy);
    const keys=await cache.keys();
    for(const key of keys.slice(0,Math.max(0,keys.length-LIMIT)))await cache.delete(key);
   }catch{}})());
  }
  return response;
 })());
});
`;
await fs.writeFile(path.join(root,'asset-cache-sw.js'),source);
console.log('Static asset cache revision: '+revision);
