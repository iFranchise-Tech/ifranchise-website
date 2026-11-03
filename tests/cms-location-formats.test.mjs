import test from 'node:test';
import assert from 'node:assert/strict';
import {locationFormatOptions,toggleLocationFormat} from '../lib/cms/location-formats.mjs';
test('Location formats collapse case and whitespace aliases without changing raw values',()=>{
 const selected=['HIGH STREET','Malls'],catalogue=['High Street','high street','  High   Street  ','Malls','malls'];
 const options=locationFormatOptions(catalogue,selected);
 assert.deepEqual(options.map(o=>o.label),['High street','Malls']);
 assert.deepEqual(selected,['HIGH STREET','Malls']);assert.equal(options[0].value,'High Street');
 assert.ok(options[0].aliases.includes('HIGH STREET'));
 assert.deepEqual(toggleLocationFormat(selected,options[0],true),selected);
});
test('Editing another option preserves legacy selections; deselect removes only that format',()=>{
 const selected=['High Street','high street','Unknown legacy format'],options=locationFormatOptions(['High Street','Malls'],selected);
 assert.deepEqual(toggleLocationFormat(selected,options[1],true),[...selected,'Malls']);
 assert.deepEqual(toggleLocationFormat(selected,options[0],false),['Unknown legacy format']);
 assert.ok(options.some(o=>o.value==='Unknown legacy format'));
 assert.deepEqual(locationFormatOptions(['',null,'  '],[]),[]);
});
