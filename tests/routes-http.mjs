import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:3019';
assert.ok(['127.0.0.1','localhost'].includes(new URL(origin).hostname),'Local audit only');
const xml=await (await fetch(origin+'/sitemap.xml')).text();
const paths=[...new Set([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname).concat(['/about-us','/careers','/privacy-choices','/resources/saved','/thank-you']))];
const results=[],assets=new Set();let index=0;
async function work(){while(index<paths.length){let path=paths[index++],start=performance.now();const r=await fetch(origin+path),html=await r.text();results.push({path,status:r.status,ms:Math.round(performance.now()-start)});for(const m of html.matchAll(/(?:src|href)="(\/[^"?#]+)(?:[^\"]*)"/g))if(/\.(?:css|js|woff2|webp|png|jpe?g|svg|mp4|ico)$/i.test(m[1]))assets.add(m[1]);}}
await Promise.all(Array.from({length:3},work));
const badAssets=[];for(const path of assets){let r=await fetch(origin+path,{method:'HEAD'});if(r.status!==200)badAssets.push({path,status:r.status});}
const out={pages:results.length,assets:assets.size,failedPages:results.filter(r=>r.status!==200),failedAssets:badAssets,localPageResponseMs:{min:Math.min(...results.map(x=>x.ms)),max:Math.max(...results.map(x=>x.ms)),median:results.map(x=>x.ms).sort((a,b)=>a-b)[Math.floor(results.length/2)]},results};
await fs.writeFile('../audit/route-results.json',JSON.stringify(out,null,2));console.log(JSON.stringify({...out,results:undefined}));assert.equal(out.failedPages.length,0);assert.equal(out.failedAssets.length,0);
