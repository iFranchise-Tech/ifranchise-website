import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {esc} from './editorial-artkit.mjs';
import {scenes as collections} from './editorial-collections-art.mjs';
const require=createRequire(import.meta.url);
const sharp=require('../../node_modules/.pnpm/sharp@0.35.5_@types+node@22.19.19/node_modules/sharp');
const root=new URL('../../',import.meta.url).pathname;
const output=new URL('../../work/art-review/',import.meta.url).pathname;
const onlyCollections=process.argv.includes('--collections');
const partial=process.argv.find(x=>x.startsWith('--part='))?.split('=')[1];
const articles=JSON.parse(await fs.readFile(path.join(root,'content/editorial.json'),'utf8'));
let scenes=[];
if(!onlyCollections){for(const suffix of partial?[partial]:['a','b','c'])scenes.push(...(await import(`./editorial-scenes-${suffix}.mjs`)).scenes);}
if(!onlyCollections&&!partial){
 if(scenes.length!==articles.length||new Set(scenes.map(s=>s.slug)).size!==articles.length)throw Error('Missing/duplicate scenes');
 for(const a of articles)if(!scenes.some(s=>s.slug===a.slug))throw Error('Missing '+a.slug);
 if(new Set(scenes.map(s=>createHash('sha256').update(s.body).digest('hex'))).size!==scenes.length)throw Error('Duplicate artwork');
 scenes.sort((a,b)=>articles.findIndex(x=>x.slug===a.slug)-articles.findIndex(x=>x.slug===b.slug));
}
const brand=(await fs.readFile(path.join(root,'public/assets/brandmark-purple.svg'),'utf8')).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'').replaceAll('#32159b','__PURPLE__');
const palettes={
 light:{INK:'#241b35',PURPLE:'#32159B',MID:'#b6a2e7',PALE:'#e7dff7',PAPER:'#faf9fd',WHITE:'#ffffff',GREY:'#9a94a5',SOFT:'#f0edf5'},
 dark:{INK:'#272331',PURPLE:'#704993',MID:'#b5a1ca',PALE:'#ddd3e5',PAPER:'#f2f0f3',WHITE:'#ffffff',GREY:'#96919b',SOFT:'#e7e2eb'}
};
const manifest={};
await fs.mkdir(output,{recursive:true});
for(const [type,items] of [['articles',scenes],['collections',collections]]){
 for(const mode of Object.keys(palettes))await fs.mkdir(path.join(root,'public/art/refined',type,mode),{recursive:true});
 for(const s of items){
  if(!s.body||!s.alt||!s.concept||s.body.includes('undefined')||s.body.includes('NaN'))throw Error('Invalid '+s.slug);
  const marks=s.body.match(/<use href="#brandmark"[^>]*\/>/g)||[];
  if(marks.length!==1)throw Error('Expected one deliberately placed brandmark: '+s.slug+' ('+marks.length+')');
  const artBody=s.body;
  for(const [mode,palette] of Object.entries(palettes)){
   let svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 800" width="1200" height="800" role="img"><title>${esc(s.alt)}</title><desc>${esc(s.concept)}</desc><defs><symbol id="brandmark" viewBox="576 485 507 455">${brand}</symbol></defs><rect width="1200" height="800" fill="__PAPER__"/>${artBody}</svg>`;
   for(const [k,v] of Object.entries(palette))svg=svg.replaceAll('__'+k+'__',v);
   if(/__[A-Z]+__/.test(svg))throw Error('Unknown colour '+s.slug);
   await fs.writeFile(path.join(root,'public/art/refined',type,mode,s.slug+'.svg'),svg);
   await sharp(Buffer.from(svg)).webp({quality:90,effort:5}).toFile(path.join(root,'public/art/refined',type,mode,s.slug+'.webp'));
  }
  if(type==='articles')manifest[s.slug]={alt:s.alt,concept:s.concept};
 }
 // Contact sheets preserve exact compositions for a full visual review.
 for(let page=0;page<Math.ceil(items.length/12);page++){
  const batch=items.slice(page*12,page*12+12),parts=[];
  for(let i=0;i<batch.length;i++){
   const s=batch[i],x=(i%3)*400,y=Math.floor(i/3)*306;
   parts.push({input:await sharp(path.join(root,'public/art/refined',type,'light',s.slug+'.webp')).resize(390,260).png().toBuffer(),left:x,top:y});
   const label=`${type==='articles'?page*12+i+1+ '. ':''}${s.slug}`;
   parts.push({input:Buffer.from(`<svg width="390" height="44"><rect width="390" height="44" fill="white"/><text x="7" y="18" font-family="Arial" font-size="11" fill="#111">${esc(label)}</text></svg>`),left:x,top:y+260});
  }
  await sharp({create:{width:1200,height:Math.ceil(batch.length/3)*306,channels:3,background:'#ffffff'}}).composite(parts).png().toFile(path.join(output,`editorial-${type}-${partial?partial+'-':''}review-${page+1}.png`));
 }
}
if(!onlyCollections&&!partial)await fs.writeFile(path.join(root,'content/editorial-artwork.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({articles:scenes.length,collections:collections.length,palettes:Object.keys(palettes)}));
