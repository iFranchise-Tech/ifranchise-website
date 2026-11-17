import type {Metadata} from 'next';

/** Transparent padding protects the approved brandmark when search results apply a circular mask. */
export const faviconMetadata:Metadata['icons']={
 icon:[
  {url:'/favicon.ico?v=20261117-padded',type:'image/x-icon',sizes:'16x16 32x32 48x48 96x96 256x256'},
  {url:'/favicon.png?v=20261117-padded',type:'image/png',sizes:'96x96'},
  {url:'/favicon.svg?v=20261117-padded',type:'image/svg+xml',sizes:'any'},
 ],
 apple:[{url:'/apple-touch-icon.png?v=20261117-padded',sizes:'180x180',type:'image/png'}],
};
