import {publishedFaq} from '../../lib/cms/public';
import {pageBanners} from '../../lib/page-banners';
import {PhotoHero} from '../../components/photo-hero';
import {InlineLink,Questions} from '../../components/premium';

export const dynamic='force-dynamic';
export const metadata={
 title:'FAQs — Franchising & Working with iFranchise',
 description:'Find answers about exploring franchise opportunities, preparing your brand for expansion and working with iFranchise.',
 alternates:{canonical:'/faq'},
};

export default async function FAQPage(){
 const groups=[
  {slug:'general',title:'Getting started',description:'A few useful answers before your first conversation.'},
  {slug:'opportunities',title:'For investors',description:'Understand the details when comparing franchise opportunities.'},
  {slug:'list-your-brand',title:'For brands',description:'Prepare your business for franchise partners and new locations.'},
 ];
 const questions=await Promise.all(groups.map(group=>publishedFaq(group.slug)));
 const banner=pageBanners.faq;
 return <main id="main" className="p-page resources-page faq-page">
  <PhotoHero editorial imageRatio={banner.ratio} image={banner.image} imageAlt={banner.alt} imagePosition={banner.position} mobileImage={banner.mobileImage} mobileImagePosition={banner.mobilePosition} title="Frequently asked questions" description="Clear answers to your questions about franchising, growing your brand and working with us."/>
  <div className="p-container faq-page-content">
   {groups.map((group,index)=><section className="p-faq-section faq-page-group" aria-labelledby={'faq-'+group.slug} key={group.slug}>
    <div><h2 id={'faq-'+group.slug}>{group.title}</h2><p>{group.description}</p></div>
    <Questions items={questions[index]}/>
   </section>)}
   <div className="faq-page-contact"><div><h2>Still have a question?</h2><p>Tell us what you’re planning. Our team can help you take the next step.</p></div><InlineLink href="/contact-us">Contact us</InlineLink></div>
  </div>
 </main>;
}
