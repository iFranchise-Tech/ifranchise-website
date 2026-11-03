import test from 'node:test';
import assert from 'node:assert/strict';
import {createNavigationCache} from '../lib/cms/navigation-cache.mjs';
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}

test('intent prefetch and navigation share one request; later visits read fresh data',async()=>{
 let calls=0;const pending=deferred();const cache=createNavigationCache(()=>{calls++;return pending.promise});
 cache.prefetch('articles');cache.prefetch('articles');const read=cache.read('articles');
 pending.resolve({records:['current']});assert.deepEqual(await read,{records:['current']});assert.equal(calls,1);
 await cache.read('articles');assert.equal(calls,2);
});
test('completed prefetches expire and explicit refresh bypasses them',async()=>{
 let time=0,calls=0;const cache=createNavigationCache(async()=>++calls,{now:()=>time,ttl:5000});
 cache.prefetch('articles');await Promise.resolve();time=5000;assert.equal(await cache.read('articles'),2);
 cache.prefetch('articles');await Promise.resolve();assert.equal(await cache.read('articles',true),4);
});
test('failed speculation retries normally while a failed active read remains an error',async()=>{
 let calls=0;const cache=createNavigationCache(async()=>{calls++;if(calls===1)throw Error('Session expired');return {records:[]}});
 cache.prefetch('team');await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(await cache.read('team'),{records:[]});assert.equal(calls,2);
 const rejected=createNavigationCache(async()=>{throw Error('Access denied')});
 await assert.rejects(rejected.read('private'),/Access denied/);
});
test('invalidation prevents a late pre-mutation result from being reused',async()=>{
 const old=deferred();let calls=0;const cache=createNavigationCache(()=>++calls===1?old.promise:Promise.resolve({version:2}));
 cache.prefetch('articles');await Promise.resolve();cache.clear();old.resolve({version:1});await Promise.resolve();
 assert.deepEqual(await cache.read('articles'),{version:2});
});
test('an obsolete rejection cannot evict a newer prefetch',async()=>{
 const old=deferred();let calls=0;const cache=createNavigationCache(()=>++calls===1?old.promise:Promise.resolve({version:2}));
 cache.prefetch('articles');await Promise.resolve();cache.clear();cache.prefetch('articles');await Promise.resolve();old.reject(Error('obsolete'));
 await new Promise(resolve=>setImmediate(resolve));assert.deepEqual(await cache.read('articles'),{version:2});assert.equal(calls,2);
});
test('prefetch storage is bounded and scoped to a portal instance',async()=>{
 const calls=[];const cache=createNavigationCache(async key=>{calls.push(key);return key},{limit:2});
 for(const key of ['one','two','three'])cache.prefetch(key);await Promise.resolve();await cache.read('one');assert.equal(calls.filter(k=>k==='one').length,2);
 const other=createNavigationCache(async()=>({user:'other'}));assert.deepEqual(await other.read('two'),{user:'other'});
});

test('retained route reads deduplicate fresh visits and expire, invalidate and retry correctly',async()=>{
 let time=0,calls=0;const cache=createNavigationCache(async()=>++calls,{retain:true,now:()=>time});
 assert.deepEqual(await Promise.all([cache.read('blogs'),cache.read('blogs')]),[1,1]);
 assert.equal(await cache.read('blogs'),1);time=5000;assert.equal(await cache.read('blogs'),2);
 assert.equal(await cache.read('blogs',true),3);cache.clear();assert.equal(await cache.read('blogs'),4);
 let attempts=0;const failed=createNavigationCache(async()=>{if(++attempts===1)throw Error('Access denied');return 'fresh'}, {retain:true});
 await assert.rejects(failed.read('private'),/Access denied/);assert.equal(await failed.read('private'),'fresh');
});
