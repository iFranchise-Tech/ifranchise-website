import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(require.resolve('sharp',{paths:[path.dirname(require.resolve('miniflare/package.json',{paths:[path.dirname(require.resolve('wrangler/package.json'))]}))]}));
const publicDir=path.resolve('public'),out=path.join(publicDir,'optimized');
await fs.mkdir(out,{recursive:true});
const roots=['brands','images','art/natural','stock'];
const files=[];
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else if(/\.(webp|jpe?g|png)$/i.test(e.name)&&!e.name.includes('.small.'))files.push(p);}}
for(const root of roots)await walk(path.join(publicDir,root));
// Preserve source files and CMS URLs; only generated display variants are compressed.
const manifest={},report=[];
for(const file of files.sort()){
 const original=await fs.readFile(file),meta=await sharp(original).metadata();
 if(meta.pages>1||!meta.width)continue;
 const url='/'+path.relative(publicDir,file).split(path.sep).join('/');
 const hash=createHash('sha256').update(original).update('webp-v1-q78').digest('hex').slice(0,12);
 const stem=path.basename(file,path.extname(file)).replace(/[^a-z0-9-]/gi,'-')+'-'+hash;
 const widths=[...new Set([160,480,800,1200,1600].filter(w=>w<meta.width).concat(Math.min(meta.width,1600)))];
 const variants=[];
 for(const width of widths){
  const name=stem+'-'+width+'.webp',target=path.join(out,name);
  try{await fs.access(target);}catch{await sharp(original).rotate().resize({width,withoutEnlargement:true}).webp({quality:78,effort:5}).toFile(target);}
  variants.push([width,(await fs.stat(target)).size]);
 }
 manifest[url]=[stem,widths];report.push({src:url,original:original.length,variants});
}
await fs.writeFile('lib/image-manifest.json',JSON.stringify(manifest));
await fs.writeFile('/tmp/ifranchise-image-report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({images:report.length,originalBytes:report.reduce((n,r)=>n+r.original,0),generatedBytes:report.reduce((n,r)=>n+r.variants.reduce((s,v)=>s+v[1],0),0)}));
