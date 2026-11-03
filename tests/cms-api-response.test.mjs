import test from 'node:test';
import assert from 'node:assert/strict';
import {cmsApiResponse,isCmsApiPath} from '../lib/cms/api-response.mjs';
const req=(path='/api/admin',method='GET')=>new Request('https://preview.example'+path,{method});
test('API route misses and framework HTML errors return real JSON error statuses',async t=>{
 t.mock.method(console,'error',()=>{});
 for(const status of [404,405,500,502]){
  const response=await cmsApiResponse(req('/api/admin/missing'),async()=>new Response('<!DOCTYPE html><h1>Framework stack</h1>',{status,headers:{'content-type':'text/html'}}));
  assert.equal(response.status,status);assert.match(response.headers.get('content-type'),/json/);assert.equal(response.headers.get('cache-control'),'no-store');
  assert.doesNotMatch((await response.json()).error,/<|stack|doctype/i);
 }
 const thrown=await cmsApiResponse(req(),async()=>{throw Error('Private exception')});assert.equal(thrown.status,500);
 const wrongSuccess=await cmsApiResponse(req(),async()=>new Response('<html>wrong page</html>'));assert.equal(wrongSuccess.status,502);
});
test('API redirects become session errors; authorization JSON stays intact',async t=>{
 t.mock.method(console,'error',()=>{});
 const redirect=await cmsApiResponse(req(),async()=>Response.redirect('https://identity.example',302));assert.equal(redirect.status,401);
 for(const status of [200,401,403,422]){const original=Response.json(status===200?{records:[{id:'real'}]}:{error:'Access denied'},{status});assert.equal(await cmsApiResponse(req(),async()=>original),original)}
});
test('Binary resume downloads, public pages and local login/logout retain their responses',async()=>{
 const pdf=new Response('%PDF-1.7',{headers:{'content-type':'application/pdf'}});
 assert.equal(await cmsApiResponse(req('/api/admin/intake/resume/id'),async()=>pdf),pdf);
 for(const path of ['/contact-us','/api/admin/local-dev-session','/api/admin/local-dev-logout']){const original=Response.redirect('https://preview.example/admin',303);assert.equal(await cmsApiResponse(req(path,'POST'),async()=>original),original)}
 assert.equal(isCmsApiPath('/api/admin/missing'),true);assert.equal(isCmsApiPath('/api/administer'),false);assert.equal(isCmsApiPath('/api/cms/access-help'),true);
});
