import test from 'node:test';
import assert from 'node:assert/strict';
import {activityDisplay} from '../lib/cms/activity.mjs';
const actor='sumanth.reddy@ifranchise.in';
const members=[{email:actor,name:'Sumanth Reddy'},{email:'staff@example.test',name:'Ananya Rao'}];
const records=[{id:'jobs:designer',draft:{title:'UI/UX Designer'}}];
const event=(extra={})=>({action:'save',record_id:'jobs:designer',actor,note:'',...extra});
test('activity resolves actual record and actor names without changing the stored event',()=>{
 const row=event(),copy=structuredClone(row),display=activityDisplay(row,records,members);
 assert.deepEqual(display,{action:'Saved draft',module:'Careers',target:'UI/UX Designer',actorName:'Sumanth Reddy',actorEmail:actor,detail:''});assert.deepEqual(row,copy);
});
test('intake audit ID lists and JSON metadata never enter the activity display',()=>{
 for(const note of ['f059ecb5-57f4-4686-9033-11f064bc10f8,another-id','{"token":"private"}']) {
 const display=activityDisplay(event({record_id:'intake:list',action:'view submissions',note}),records,members);
 assert.equal(display.action,'Viewed submissions');assert.equal(display.target,'Submission list');assert.equal(display.module,'Inbox');assert.equal(display.detail,'');assert.ok(!JSON.stringify(display).includes(note));
 }
});
test('team, order, media and email events map to their own modules and accurate actions',()=>{
 for(const [action,id,module,target,label] of [
 ['invite employee','team:staff@example.test','Team & access','Ananya Rao','Invited employee'],
 ['accept invitation','team:staff@example.test','Team & access','Ananya Rao','Activated account'],
 ['publish','placements:jobs','Careers','Job display order','Published content'],
 ['save','placements:franchises','Franchise opportunities','Franchise display order','Saved draft'],
 ['upload','blogs:media','Blogs','Media file','Uploaded file'],
 ['retry email','email:private-uuid','Email delivery','Transactional email','Requested email retry'],
 ['download resume','intake:private-uuid','Inbox','Job application','Downloaded résumé'],
 ]){const display=activityDisplay(event({action,record_id:id}),records,members);assert.equal(display.action,label);assert.equal(display.module,module);assert.equal(display.target,target);}
});
test('privacy status is shown only for a recorded recognized status',()=>{
 assert.equal(activityDisplay(event({action:'privacy request status',record_id:'intake:uuid',note:'Completed'})).detail,'Completed');
 assert.equal(activityDisplay(event({action:'privacy request status',record_id:'intake:uuid',note:'{"raw":true}'})).detail,'');
});
test('missing records and unknown actions do not invent record names or expose technical values',()=>{
 const display=activityDisplay(event({action:'raw_internal_value',record_id:'blogs:uuid',note:'{"raw":true}'}));
 assert.equal(display.action,'Recorded activity');assert.equal(display.target,'Record unavailable');assert.equal(display.module,'Blogs');assert.equal(display.actorEmail,actor);assert.equal(display.actorName,'');assert.equal(display.detail,'');
 assert.equal(activityDisplay(event({action:'archive'})).action,'Recorded removal action');
});
test('brochure imports and upload filenames are accurate; non-email system identifiers are not rendered',()=>{
 assert.equal(activityDisplay(event({action:'secure brochure import'})).action,'Imported secure brochure');
 assert.equal(activityDisplay(event({action:'upload',record_id:'blogs:media',note:'Team portrait.webp'})).target,'Team portrait.webp');
 assert.equal(activityDisplay(event({actor:'f059ecb5-57f4-4686-9033-11f064bc10f8'})).actorEmail,'');
});
