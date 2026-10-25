import manifest from './image-manifest.json';

type Variant = [string, number[]];
const images = manifest as unknown as Record<string, Variant>;

// CMS uploads and remote URLs keep their original URL until variants exist.
export function imageSrc(src:string, width=1200){
 const image=images[src];
 if(!image)return src;
 const [stem,widths]=image;
 return `/optimized/${stem}-${widths.find(w=>w>=width)||widths[widths.length-1]}.webp`;
}

export function responsiveImage(src:string, sizes:string, maxWidth=1600){
 if(src.startsWith('/assets/hero-oct25/')&&src.endsWith('.webp'))return {src,srcSet:[768,1200,1672].map(w=>`${w===1672?src:src.replace('.webp','-'+w+'.webp')} ${w}w`).join(', '),sizes};
 const image=images[src];
 if(!image)return {src};
 const [stem,widths]=image;
 const candidates=widths.filter(w=>w<=maxWidth);
 if(!candidates.length)candidates.push(widths[0]);
 return {
  src:imageSrc(src,Math.min(800,maxWidth)),
  srcSet:candidates.map(w=>`/optimized/${stem}-${w}.webp ${w}w`).join(', '),
  sizes,
 };
}
