import test from 'node:test';
import assert from 'node:assert/strict';
import {processEmailQueue} from '../lib/cms/email-delivery.mjs';

function mockRequests(t, responses) {
  const requests=[];
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    requests.push({url,...options});
    assert(responses.length,'Unexpected email request');
    return responses.shift();
  });
  return requests;
}

test('successful queue processing with a failed history refresh preserves the processing result',async t=>{
  const requests=mockRequests(t,[Response.json({configured:true,processed:1}),new Response('<html>Gateway unavailable</html>',{status:502})]);
  const result=await processEmailQueue('delivery-test');
  assert.equal(result.notice,'');
  assert.equal(result.emails,null);
  assert.match(result.error,/Queue processing completed, but delivery history could not be refreshed/);
  assert.match(result.error,/Use Refresh/);
  assert.doesNotMatch(result.error,/up to date|Unable to process|Gateway unavailable/);
  assert.deepEqual(requests.map(r=>[r.url,r.method||'GET']),[['/api/admin/email','POST'],['/api/admin/email','GET']]);
  assert.deepEqual(JSON.parse(requests[0].body),{id:'delivery-test'});
});

test('successful history refresh returns current rows and only then confirms statuses are up to date',async t=>{
  const emails=[{id:'delivery-test',status:'queued',attempts:1}];
  const requests=mockRequests(t,[Response.json({configured:true,processed:1}),Response.json({emails})]);
  const result=await processEmailQueue();
  assert.deepEqual(result.emails,emails);
  assert.equal(result.error,'');
  assert.equal(result.notice,'Queue checked. Delivery statuses are up to date.');
  assert.deepEqual(requests.map(r=>r.method||'GET'),['POST','GET']);
  assert.equal(requests[0].body,undefined);
});

test('a rejected queue-processing request remains a processing error and does not fetch history',async t=>{
  const requests=mockRequests(t,[Response.json({error:'Only a Super Admin can manage email delivery.'},{status:403})]);
  await assert.rejects(()=>processEmailQueue(),/Only a Super Admin/);
  assert.equal(requests.length,1);
  assert.equal(requests[0].method,'POST');
});

for(const refreshFails of [false,true])test(`unconfigured delivery is reported accurately when history ${refreshFails?'fails':'succeeds'}`,async t=>{
  mockRequests(t,[Response.json({configured:false,processed:0}),refreshFails?new Response('',{status:503}):Response.json({emails:[]})]);
  const result=await processEmailQueue();
  assert.match(refreshFails?result.error:result.notice,/Email delivery is not configured for this environment/);
  assert.equal(refreshFails?result.notice:result.error,'');
  assert.doesNotMatch(result.notice+result.error,/Queue processing completed|up to date/);
  assert.deepEqual(result.emails,refreshFails?null:[]);
});
