import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeName} from '../lib/contact-validation.mjs';
import {citiesForState,validateCity} from '../lib/location-cities.mjs';
import {indianStates} from '../lib/locations.mjs';

test('names accept Unicode letters and natural punctuation without dropping characters',()=>{
 for(const value of ['Abdul Syed','Jean-Luc Martin',"D’Arcy O’Neill",'José García','अब्दुल सैयद'])assert.equal(normalizeName(value),value);
 assert.equal(normalizeName('  Abdul   Syed  '),'Abdul Syed');
 for(const value of ['   ','123','Abdul123','John@Smith','😀 Name','A','-John'])assert.throws(()=>normalizeName(value));
});
test('every state and UT has selectable locations',()=>{assert.equal(indianStates.length,36);for(const state of indianStates)assert.ok(citiesForState(state).length,state)});
test('city selection resolves aliases and rejects incorrect state pairs',()=>{
 assert.equal(validateCity('Bangalore','Karnataka'),'Bengaluru');
 assert.equal(validateCity('Mumbai','Maharashtra'),'Mumbai');
 assert.throws(()=>validateCity('Mumbai','Karnataka'));
 assert.throws(()=>validateCity('Invented City','Delhi'));
 assert.equal(validateCity('Mahe','Puducherry'),'Mahe');
});
