import test from 'node:test';
import assert from 'node:assert/strict';
import {locationPopup} from '../lib/location-popup.mjs';
import {internalPage,anchorTop} from '../lib/page-navigation.mjs';
import {safeReturnPath,showConfirmation,confirmationReturn} from '../lib/intake/confirmation.mjs';
const storage=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),map}};
test('city suggestions move above the field when the keyboard occupies the lower viewport',()=>{
 const rect={left:24,width:342,top:300,bottom:350},v={top:0,height:450,width:390};const p=locationPopup(rect,v);
 assert(p.top<rect.top);assert(p.top>=12);assert(p.top+p.maxHeight<=rect.top);assert.equal(p.width,342);
});
test('city suggestions fit below a field when there is room and stay inside narrow screens',()=>{
 const p=locationPopup({left:0,width:500,top:100,bottom:150},{top:0,height:844,width:320});
 assert.equal(p.top,156);assert.equal(p.left,12);assert.equal(p.width,296);assert.equal(p.maxHeight,220);
});
test('anchor navigation leaves the entire form heading below the measured navbar',()=>{
 assert.equal(anchorTop(450,200,80),554);assert.equal(anchorTop(10,0,80),0);
});
test('client routing handles internal pages while preserving external links and file downloads',()=>{
 const base='https://ifranchise.example/contact-us';
 assert.equal(internalPage('/about-us#vision',base),'/about-us#vision');
 for(const path of ['https://outside.example/','mailto:contact@ifranchise.in','tel:+919129130303','/api/intake/session','/admin','/assets/image.webp','/brochures/brand','/file.pdf'])assert.equal(internalPage(path,base),null,path);
});
test('confirmation returns to the originating page and scroll position, without answers or query strings',()=>{
 const s=storage();let destination;
 showConfirmation({sessionStorage:s,location:{pathname:'/franchise/franco',hash:'#enquire',search:'?email=private'},scrollY:950},path=>destination=path);
 assert.equal(destination,'/thank-you');assert.deepEqual(confirmationReturn(s),{path:'/franchise/franco#enquire',y:950});
 assert(!JSON.stringify([...s.map]).includes('email'));assert(!JSON.stringify([...s.map]).includes('private'));
});
test('confirmation cannot redirect off-site or into privileged routes, and expires',()=>{
 for(const path of ['//outside.example','https://outside.example','/\\outside.example','/admin','/api/private','/thank-you'])assert.equal(safeReturnPath(path),null,path);
 const s=storage();s.setItem('ifranchise-submission-confirmed',String(Date.now()-1800001));s.setItem('ifranchise-submission-return',JSON.stringify({path:'/careers',y:400}));assert.equal(confirmationReturn(s),null);
});
