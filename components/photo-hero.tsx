import {imageStyle,frameStyle} from '../lib/cms/display.mjs';
import type {ReactNode} from 'react';
import {Crumb,ScrollLink} from './premium';
import {responsiveImage} from '../lib/responsive-image';

type PhotoHeroProps={
 presentation?:any;
 image:string;
 imageAlt:string;
 title:ReactNode;
 description:string;
 actions:ReactNode;
 breadcrumb?:string;
 compact?:boolean;
 scroll?:{href:string;label:string};
};

export function PhotoHero({image,imageAlt,title,description,actions,breadcrumb,scroll,compact=false,presentation}:PhotoHeroProps){
 return <section style={presentation?{...frameStyle(presentation),width:undefined,...(presentation.ratio!=='original'?{minHeight:0}:{}),marginInline:'auto'}:undefined} data-hero-tone="dark" className={'p-photo-hero'+(compact?' p-photo-hero-compact':'')}>
  <img className="p-photo-hero-image" style={presentation?{...imageStyle(presentation),width:(presentation.width||100)+'%',left:((100-(presentation.width||100))/2)+'%'} as any:undefined} {...responsiveImage(image,'100vw')} alt={imageAlt} width="2400" height="1600" fetchPriority="high" decoding="async"/>
  <div className="p-photo-hero-overlay" aria-hidden="true"/>
  <div className="p-container p-photo-hero-inner">
   {breadcrumb&&<Crumb label={breadcrumb}/>}
   <div className="p-photo-hero-copy"><h1>{title}</h1><p>{description}</p><div className="p-actions">{actions}</div></div>
   {scroll&&<ScrollLink href={scroll.href}>{scroll.label}</ScrollLink>}
  </div>
 </section>;
}
