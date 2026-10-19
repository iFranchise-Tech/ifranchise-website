import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const sharp=require('../../node_modules/.pnpm/sharp@0.35.5_@types+node@22.19.19/node_modules/sharp');
const root=new URL('../../',import.meta.url).pathname;
const input=path.resolve(root,'../natural-editorial-assets');
const preview=process.argv.includes('--preview');
const articles=JSON.parse(await fs.readFile(path.join(root,'content/editorial.json'),'utf8'));
const collections=JSON.parse(await fs.readFile(path.join(input,'collections.json'),'utf8'));
let assets=[];
for(const part of ['a','b','c','d']){
 try{assets.push(...JSON.parse(await fs.readFile(path.join(input,`batch-${part}.json`),'utf8')));}catch(error){if(!preview)throw error;}
}
const bySlug=new Map(assets.map(a=>[a.slug,a]));
if(assets.length!==bySlug.size)throw Error('Duplicate article slug in artwork manifest');
if(!preview&&(assets.length!==articles.length||articles.some(a=>!bySlug.has(a.slug))))throw Error('Every article must have its own completed natural scene');
const hashes=new Set();
const manifest={mode:'built-in image generation',style:'photorealistic-natural',articles:{},collections:{}};
for(const [kind,items] of [['articles',assets],['collections',collections]]){
 await fs.mkdir(path.join(root,'public/art/natural',kind),{recursive:true});
 await fs.mkdir(path.join(input,kind),{recursive:true});
 for(const item of items){
  const original=path.join(input,kind,item.slug+'.png');
  if(path.resolve(item.source)!==original)await fs.copyFile(item.source,original);
  const bytes=await fs.readFile(original);
  const hash=createHash('sha256').update(bytes).digest('hex');
  if(hashes.has(hash))throw Error('Repeated cover image: '+item.slug);
  hashes.add(hash);
  const metadata=await sharp(bytes).metadata();
  if(Math.abs(metadata.width/metadata.height-1.5)>0.025)throw Error('Cover must preserve the landscape composition: '+item.slug);
  const target=path.join(root,'public/art/natural',kind,item.slug+'.webp');
  await sharp(bytes).resize({width:1200,withoutEnlargement:true}).webp({quality:87,effort:5}).toFile(target);
  await sharp(bytes).resize({width:600,withoutEnlargement:true}).webp({quality:85,effort:5}).toFile(target.replace('.webp','.small.webp'));
  manifest[kind][item.slug]={title:item.title||item.slug,alt:item.alt,scene:item.scene,prompt:item.prompt,sha256:hash,image:`/art/natural/${kind}/${item.slug}.webp`};
 }
}
const websiteManifest={...manifest};
for(const kind of ['articles','collections'])websiteManifest[kind]=Object.fromEntries(Object.entries(manifest[kind]).map(([slug,{prompt,...data}])=>[slug,data]));
await fs.writeFile(path.join(root,'content/editorial-natural-artwork.json'),JSON.stringify(websiteManifest,null,2)+'\n');
await fs.writeFile(path.join(input,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({articleCovers:assets.length,collectionBanners:collections.length,uniqueImages:hashes.size,preview}));
