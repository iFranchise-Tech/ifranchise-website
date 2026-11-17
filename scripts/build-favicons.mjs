import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const sharp=require(require.resolve('sharp',{paths:[path.dirname(require.resolve('miniflare/package.json',{paths:[path.dirname(require.resolve('wrangler/package.json'))]}))]}));
const source=await fs.readFile('public/favicon.svg');
const png=size=>sharp(source,{density:384}).resize(size,size).png().toBuffer();

await fs.writeFile('public/favicon-adaptive.svg',source);
await fs.writeFile('public/favicon.png',await png(96));
await fs.writeFile('public/apple-touch-icon.png',await png(180));

// ICO directory entries point to lossless PNGs rendered from the same padded SVG.
const sizes=[16,32,48,96,256];
const images=await Promise.all(sizes.map(png));
const directory=Buffer.alloc(6+16*sizes.length);
directory.writeUInt16LE(1,2);
directory.writeUInt16LE(sizes.length,4);
let offset=directory.length;
for(let i=0;i<sizes.length;i++){
 const entry=6+16*i;
 directory[entry]=sizes[i]%256;
 directory[entry+1]=sizes[i]%256;
 directory.writeUInt16LE(1,entry+4);
 directory.writeUInt16LE(32,entry+6);
 directory.writeUInt32LE(images[i].length,entry+8);
 directory.writeUInt32LE(offset,entry+12);
 offset+=images[i].length;
}
await fs.writeFile('public/favicon.ico',Buffer.concat([directory,...images]));
console.log('Generated transparent SVG, PNG, ICO and Apple icons with matching padding.');
