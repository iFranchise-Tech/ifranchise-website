import test from 'node:test';
import assert from 'node:assert/strict';
import {cmsRequest} from '../lib/cms/client.mjs';

test('CMS requests retain server validation messages and reject gateway HTML cleanly',async t=>{
 t.mock.method(globalThis,'fetch',async()=>Response.json({error:'Choose a reporting manager.'},{status:422}));
 await assert.rejects(()=>cmsRequest('/api/admin'),/Choose a reporting manager/);
 globalThis.fetch=async()=>new Response('<html>private gateway diagnostics</html>',{status:502});
 await assert.rejects(()=>cmsRequest('/api/admin'),{message:'The request could not be completed. Please try again.'});
});
test('expired CMS sessions give actionable guidance even with a non-JSON response',async t=>{
 t.mock.method(globalThis,'fetch',async()=>new Response('Unauthorized',{status:401}));
 await assert.rejects(()=>cmsRequest('/api/admin'),/session has expired.*Sign in again/);
});
test('CMS transport failures are readable while cancellation remains distinguishable',async t=>{
 t.mock.method(globalThis,'fetch',async()=>{throw new TypeError('Failed to fetch')});
 await assert.rejects(()=>cmsRequest('/api/admin'),/Unable to connect/);
 const aborted=new DOMException('Aborted','AbortError');globalThis.fetch=async()=>{throw aborted};
 await assert.rejects(()=>cmsRequest('/api/admin'),error=>error===aborted);
});
test('CMS requests reject malformed success responses and disable caching',async t=>{
 t.mock.method(globalThis,'fetch',async(_url,options)=>{assert.equal(options.cache,'no-store');return Response.json({records:[]})});
 assert.deepEqual(await cmsRequest('/api/admin'),{records:[]});
 globalThis.fetch=async()=>new Response('<html>Sign in</html>');
 await assert.rejects(()=>cmsRequest('/api/admin'),/unexpected response/);
});

test('CMS rejects redirects before parsing and never follows sign-in HTML',async t=>{
 t.mock.method(globalThis,'fetch',async(_url,options)=>{assert.equal(options.redirect,'manual');assert.equal(options.credentials,'same-origin');assert.equal(options.headers.get('accept'),'application/json');return new Response(null,{status:302,headers:{location:'/admin'}})});
 await assert.rejects(()=>cmsRequest('/api/admin'),error=>error.status===401&&/session has expired/.test(error.message));
});
test('CMS validates content type and malformed JSON, and sanitizes technical errors',async t=>{
 t.mock.method(globalThis,'fetch',async()=>new Response('{"records":[]}',{headers:{'content-type':'text/html'}}));
 await assert.rejects(()=>cmsRequest('/api/admin'),/unexpected response/);
 globalThis.fetch=async()=>new Response('<!DOCTYPE html>',{headers:{'content-type':'application/json'}});
 await assert.rejects(()=>cmsRequest('/api/admin'),/unexpected response/);
 globalThis.fetch=async()=>Response.json({error:'Unexpected token <, <!DOCTYPE html> is not valid JSON'},{status:400});
 await assert.rejects(()=>cmsRequest('/api/admin'),{message:'The request could not be completed. Please try again.'});
 globalThis.fetch=async()=>Response.json({error:'Private database diagnostics'},{status:500});
 await assert.rejects(()=>cmsRequest('/api/admin'),{message:'The request could not be completed. Please try again.'});
 globalThis.fetch=async()=>new Response('Forbidden',{status:403});
 await assert.rejects(()=>cmsRequest('/api/admin'),error=>error.status===403&&/access/.test(error.message));
});
test('CMS failure can be retried without returning fake empty records',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async()=>++calls===1?new Response('<html>Unavailable</html>',{status:503}):Response.json({records:[{id:'one'}]}));
 await assert.rejects(()=>cmsRequest('/api/admin'));
 assert.deepEqual(await cmsRequest('/api/admin'),{records:[{id:'one'}]});assert.equal(calls,2);
});
