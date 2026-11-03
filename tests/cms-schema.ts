import assert from 'node:assert/strict';
import {validPayload} from '../lib/cms/validation';
import {defaults,blank} from '../lib/cms/defaults';
let checked=0;
for (const kind of ['franchises','articles','blogs','jobs','pages','faqs','placements','industries']) {
 const item=defaults[kind][0]; if(!item)continue;
 const out=validPayload(kind,structuredClone(item),false,item);
 assert.equal(out.slug,item.slug); checked++;
}
const brand={...blank('franchises'),slug:'validation-brand',name:'Validation brand',faqs:Array.from({length:5},(_,i)=>({q:`Question ${i+1}?`,a:'A concise answer for this validation test.'})),galleryAlt:{'/assets/storefronts.png':'Storefront'},facts:{sqFt:'700',returns:'Current proposal'},returnTerms:{arrangement:'higher',margin:12,guaranteeType:'amount',guarantee:125000,period:'monthly',note:'Whichever is higher'}};
const out=validPayload('franchises',brand);
assert.equal(out.facts.sqFt,'700');assert.equal(out.galleryAlt['/assets/storefronts.png'],'Storefront');
assert.throws(()=>validPayload('franchises',{...brand,returnTerms:{...brand.returnTerms,margin:120}}));
assert.throws(()=>validPayload('franchises',{...brand,returnTerms:{...brand.returnTerms,guarantee:null}}));
assert.throws(()=>validPayload('pages',{slug:'contact-us',title:'Contact',email:'wrong@@gmail.com',phone:'+919123456789',phoneCountry:'IN'}));
const contact=validPayload('pages',{slug:'contact-us',title:'Contact',email:' contact@ifranchise.in ',phone:'+919123456789',phoneCountry:'IN'});
assert.equal(contact.email,'contact@ifranchise.in');assert.equal(contact.phone,'+919123456789');
console.log(`${checked} CMS content types + nested records, returns and contact validation passed.`);
