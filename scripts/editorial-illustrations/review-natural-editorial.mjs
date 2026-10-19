// Review-only sheets; published images remain complete and unaltered.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require('../../node_modules/.pnpm/sharp@0.35.5_@types+node@22.19.19/node_modules/sharp');
const root=new URL('../../',import.meta.url).pathname;
const output=path.resolve(root,'../natural-editorial-assets/review');
await fs.mkdir(output,{recursive:true});
const m=JSON.parse(await fs.readFile(path.join(root,'content/editorial-natural-artwork.json'),'utf8'));
let items=[...Object.entries(m.collections),...Object.entries(m.articles)];
const onlyNew=process.argv.includes('--new-only');
if(onlyNew){
 const old=JSON.parse(await fs.readFile(path.resolve(root,'../natural-editorial-assets/reviewed-manifest.json'),'utf8'));
 const seen=new Set([...Object.values(old.collections),...Object.values(old.articles)].map(a=>a.sha256));
 items=items.filter(([,a])=>!seen.has(a.sha256));
}
for(let start=0;start<items.length;start+=16){
 const batch=items.slice(start,start+16),layers=[];
 for(let i=0;i<batch.length;i++){
  const [slug,item]=batch[i],left=(i%4)*400,top=Math.floor(i/4)*310;
  layers.push({input:await sharp(path.join(root,'public',item.image)).resize({width:400,height:267,fit:'contain'}).toBuffer(),left,top});
  const label=slug.replaceAll('&','&amp;').replaceAll('<','&lt;');
  layers.push({input:Buffer.from(`<svg width="400" height="43"><rect width="400" height="43" fill="white"/><text x="10" y="22" font-family="Arial" font-size="10" fill="#201334">${label}</text></svg>`),left,top:top+267});
 }
 await sharp({create:{width:1600,height:Math.ceil(batch.length/4)*310,channels:3,background:'#f1eef8'}}).composite(layers).jpeg({quality:90}).toFile(path.join(output,`${onlyNew?'new-':''}sheet-${String(start/16+1).padStart(2,'0')}.jpg`));
}
console.log(`${items.length} images across ${Math.ceil(items.length/16)} review sheets`);
