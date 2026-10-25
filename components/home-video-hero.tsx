import type {ReactNode} from 'react';
import {HeroVideo} from './hero-video';
import {InlineLink,PremiumLink,ScrollLink} from './premium';

export function HomeVideoHero({title,description}:{title:ReactNode;description:string}){
 return <section className="p-video-hero" aria-label="Franchise consulting">
  <HeroVideo/>
  <div className="p-video-hero-shade" aria-hidden="true"/>
  <div className="p-container p-video-hero-inner">
   <div className="p-video-hero-copy"><p className="p-video-hero-eyebrow">Connect. Expand. Grow.</p><h1>{title}</h1><p className="p-video-hero-intro">{description}</p><div className="p-actions"><PremiumLink href="/franchise-opportunities">Explore opportunities</PremiumLink><InlineLink href="/list-your-brand">List your Brand</InlineLink></div></div>
   <ScrollLink href="#our-work">How we can help</ScrollLink>
  </div>
 </section>;
}
