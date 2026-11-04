import faqGroups from '../../content/faq-page.json';
import {pageBanners} from '../../lib/page-banners';
import {PhotoHero} from '../../components/photo-hero';
import {FAQLibrary} from '../../components/faq-library';

export const dynamic='force-dynamic';
export const metadata={
 title:'FAQs — Franchising & Working with iFranchise',
 description:'Find answers about exploring franchise opportunities, preparing your brand for expansion and working with iFranchise.',
 alternates:{canonical:'/faq'},
};

export default function FAQPage(){
 const banner=pageBanners.faq;
 return <main id="main" className="p-page resources-page faq-page">
  <PhotoHero editorial imageRatio={banner.ratio} image={banner.image} imageAlt={banner.alt} imagePosition={banner.position} mobileImage={banner.mobileImage} mobileImagePosition={banner.mobilePosition} title="Frequently asked questions" description="Clear answers to your questions about franchising, growing your brand and working with us."/>
  <div className="p-container resource-library faq-page-content" id="resource-library">
   <FAQLibrary groups={faqGroups}/>
  </div>
 </main>;
}
