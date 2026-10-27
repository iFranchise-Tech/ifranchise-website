import test from 'node:test';
import assert from 'node:assert/strict';
import {loadResourceCollections} from '../lib/resource-loading.mjs';

test('individual resource pages fetch only the requested collection',async()=>{
 for(const kind of ['blogs','articles','videos']){
  const calls=[];
  const result=await loadResourceCollections(async k=>{calls.push(k);return [{slug:k}];},kind);
  assert.deepEqual(calls,[kind]);assert.deepEqual(result,{[kind]:[{slug:kind}]});
 }
});
test('combined resources start all independent reads before awaiting any result',async()=>{
 const calls=[],resolve={};
 const pending=loadResourceCollections(kind=>{calls.push(kind);return new Promise(done=>resolve[kind]=done);});
 assert.deepEqual(calls,['articles','blogs','videos']);
 resolve.videos([{slug:'film'}]);resolve.articles([{slug:'guide'}]);resolve.blogs([{slug:'post'}]);
 assert.deepEqual(await pending,{articles:[{slug:'guide'}],blogs:[{slug:'post'}],videos:[{slug:'film'}]});
});
test('errors propagate instead of publishing an incomplete collection',async()=>{
 await assert.rejects(loadResourceCollections(async()=>{throw new Error('database unavailable');}),/database unavailable/);
});
