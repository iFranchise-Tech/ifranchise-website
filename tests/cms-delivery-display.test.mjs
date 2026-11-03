import test from 'node:test';
import assert from 'node:assert/strict';
import {deliveryDisplay} from '../lib/cms/delivery-display.mjs';
test('delivery types and statuses are readable without overstating acceptance as delivery',()=>{
 assert.deepEqual(deliveryDisplay({kind:'invitation',status:'accepted'}),{type:'Staff invitation',status:'Accepted by Resend',error:''});
 assert.equal(deliveryDisplay({kind:'access-help',status:'captured'}).type,'Account access help');
 assert.equal(deliveryDisplay({kind:'website',status:'manual_review'}).status,'Needs review');
 assert.equal(deliveryDisplay({kind:'website',status:'delivered'}).type,'Website enquiry notification');
 assert.equal(deliveryDisplay({kind:'website',status:'delayed'}).status,'Delivery delayed');
});
test('provider errors and unexpected system values never leak into main delivery labels',()=>{
 assert.equal(deliveryDisplay({last_error:'recipient_not_allowed'}).error,'Recipient is outside the allowed delivery list.');
 assert.equal(deliveryDisplay({last_error:'resend_http_429'}).error,'The email provider rejected the delivery request.');
 const display=deliveryDisplay({kind:'raw_kind',status:'raw_status',last_error:'{"secret":"not-for-ui"}'});
 assert.deepEqual(display,{type:'Transactional email',status:'Status unavailable',error:'Delivery needs attention.'});
});
