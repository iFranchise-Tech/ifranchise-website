import type {Metadata} from 'next';

/** The approved blue brandmark has a solid white background across website and device themes. */
export const faviconMetadata:Metadata['icons']={
 icon:[
  {url:'/favicon.ico?v=20261104-white',type:'image/x-icon',sizes:'16x16 32x32 48x48'},
  {url:'/favicon.png?v=20261104-white',type:'image/png',sizes:'96x96'},
  {url:'/favicon.svg?v=20261104-white',type:'image/svg+xml',sizes:'any'},
 ],
 apple:[{url:'/apple-touch-icon.png?v=20261104-white',sizes:'180x180',type:'image/png'}],
};
