import type {ReactNode} from 'react';
import {Crumb,RouteLines,ScrollLink} from './premium';

type PhotoHeroProps={
 image:string;
 imageAlt:string;
 title:ReactNode;
 description:string;
 actions:ReactNode;
 breadcrumb?:string;
 scroll:{href:string;label:string};
};

export function PhotoHero({image,imageAlt,title,description,actions,breadcrumb,scroll}:PhotoHeroProps){
 return <section className="p-photo-hero">
  <img className="p-photo-hero-image" src={image} alt={imageAlt} width="1672" height="941" fetchPriority="high"/>
  <div className="p-photo-hero-overlay" aria-hidden="true"/>
  <RouteLines/>
  <div className="p-container p-photo-hero-inner">
   {breadcrumb&&<Crumb label={breadcrumb}/>}
   <div className="p-photo-hero-copy"><h1>{title}</h1><p>{description}</p><div className="p-actions">{actions}</div></div>
   <ScrollLink href={scroll.href}>{scroll.label}</ScrollLink>
  </div>
 </section>;
}
