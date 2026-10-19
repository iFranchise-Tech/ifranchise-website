import type {Metadata} from 'next';

/** Browser artwork follows the device, independently of the website's data-theme. */
export const faviconMetadata:Metadata['icons']={
 icon:[
  {url:'/favicon.png',type:'image/png',sizes:'96x96'},
  {url:'/favicon-adaptive.svg',type:'image/svg+xml',sizes:'any'},
 ],
 apple:[{url:'/apple-touch-icon.png',sizes:'180x180',type:'image/png'}],
};
