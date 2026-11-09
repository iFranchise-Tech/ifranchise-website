import test from 'node:test';
import assert from 'node:assert/strict';
import {legacyBrandDestination} from '../lib/brand-routes.mjs';
import {safeReturnPath,showConfirmation,confirmationReturn} from '../lib/intake/confirmation.mjs';

test('legacy brand links redirect to the canonical detail or confirmation route',()=>{
 for(const slug of ['odette','emori','original-burger-co']){
  assert.equal(legacyBrandDestination(slug),`/franchise-opportunities/${slug}`);
  assert.equal(legacyBrandDestination(slug,{},true),`/franchise-opportunities/${slug}/thank-you`);
 }
});

test('legacy redirects preserve campaign parameters, repeated values and empty values safely',()=>{
 const destination=legacyBrandDestination('odette',{utm_source:'Google & social',tag:['one','two'],empty:'',missing:undefined});
 const url=new URL(destination,'https://ifranchise.in');
 assert.equal(url.pathname,'/franchise-opportunities/odette');
 assert.equal(url.searchParams.get('utm_source'),'Google & social');
 assert.deepEqual(url.searchParams.getAll('tag'),['one','two']);
 assert.equal(url.searchParams.get('empty'),'');
 assert(!url.searchParams.has('missing'));
 assert.equal(legacyBrandDestination('brand/with?query#fragment'),'/franchise-opportunities/brand%2Fwith%3Fquery%23fragment');
});

test('enquiries already opened on legacy URLs retain brand context using the new routes',()=>{
 const values=new Map(),storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
 let destination;
 showConfirmation({sessionStorage:storage},path=>destination=path,{path:'/franchise/odette?utm_source=search&email=private#enquire',kind:'investor',y:500});
 assert.equal(destination,'/franchise-opportunities/odette/thank-you');
 assert.deepEqual(confirmationReturn(storage),{path:'/franchise-opportunities/odette?utm_source=search#enquire',kind:'investor',y:500});
 assert.equal(safeReturnPath('/franchise/odette/thank-you'),null);
 assert.equal(safeReturnPath('/franchise-opportunities/odette/thank-you'),null);
});
