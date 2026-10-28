import test from 'node:test';
import assert from 'node:assert/strict';
import {matchingCities} from '../lib/location-search.mjs';
import {indianStates,validateManualCity,validateState} from '../lib/locations.mjs';
import {recordConfirmation,hasRecentConfirmation,showConfirmation} from '../lib/intake/confirmation.mjs';
import {readConsent,CONSENT_TTL,CONSENT_KEY,measurementConfig,consentExpiresAt} from '../lib/measurement.mjs';
import {outletLabel} from '../lib/return-details.mjs';
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}};
test('locations support aliases, two-character suggestions, custom names and all states',()=>{
 const cities=[{name:'Bengaluru',aliases:['Bangalore']},{name:'Mysuru',aliases:['Mysore']}];
 assert.equal(indianStates.length,36);assert.equal(validateState('Karnataka'),'Karnataka');
 assert.deepEqual(matchingCities(cities,'b'),[]);assert.equal(matchingCities(cities,' BANG ')[0].name,'Bengaluru');
 assert.equal(matchingCities(cities,'mysore')[0].name,'Mysuru');assert.deepEqual(matchingCities(cities,'unknown'),[]);
 assert.equal(validateManualCity('Chikkaballapur'),'Chikkaballapur');assert.throws(()=>validateManualCity('City123'));assert.throws(()=>validateState('Not a state'));
});
test('thank-you requires a recent acknowledgement, expires and exposes no submission data',()=>{
 const s=storage(),now=2000000;assert.equal(hasRecentConfirmation(s,now),false);
 recordConfirmation(s,now);assert.equal(hasRecentConfirmation(s,now+1),true);
 assert.equal(hasRecentConfirmation(s,now-1),false);assert.equal(hasRecentConfirmation(s,now+1800000),false);
 assert.equal(hasRecentConfirmation({getItem(){throw Error('blocked')}},now),false);
 let destination;showConfirmation({sessionStorage:s,location:{assign:path=>destination=path}});assert.equal(destination,'/thank-you');
});
test('consent expires at 180 days, rejects future/corrupt/version-mismatched values',()=>{
 const s=storage(),now=Date.now(),value={version:measurementConfig.noticeVersion,analytics:false,advertising:false,savedAt:now};
 s.setItem(CONSENT_KEY,JSON.stringify(value));assert.ok(readConsent(s,now+CONSENT_TTL-1));assert.equal(readConsent(s,now+CONSENT_TTL),null);assert.equal(consentExpiresAt(value),now+CONSENT_TTL);
 assert.equal(readConsent(s,now-1),null);s.setItem(CONSENT_KEY,JSON.stringify({...value,version:'old'}));assert.equal(readConsent(s,now),null);s.setItem(CONSENT_KEY,'broken');assert.equal(readConsent(s,now),null);
});
test('outlet counts and qualitative brand presence do not get duplicate suffixes',()=>{
 assert.equal(outletLabel({outlets:'50+'}),'50+ outlets');assert.equal(outletLabel({outlets:'22 Outlets (2025)'}),'22 Outlets (2025)');assert.equal(outletLabel({outlets:'Global network'}),'Global network');assert.equal(outletLabel({outlets:'1'}),'1 outlet');assert.equal(outletLabel({outlets:''}),null);
});
