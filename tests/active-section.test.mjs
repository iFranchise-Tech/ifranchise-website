import test from 'node:test';
import assert from 'node:assert/strict';
import {activeReadingSection} from '../lib/active-section.mjs';

test('current reading section follows scrolling in both directions, including long sections', () => {
  const positions = [{id: 'first', top: 400}, {id: 'long', top: 800}, {id: 'last', top: 2600}];
  const at = y => activeReadingSection(positions.map(s => ({...s, top: s.top - y})), 120);
  assert.equal(at(0), 'first');
  assert.equal(at(700), 'long');
  assert.equal(at(1800), 'long');
  assert.equal(at(2480), 'last');
  assert.equal(at(750), 'long');
  assert.equal(at(0), 'first');
});
test('short final section is selected at the bottom and empty documents are safe', () => {
  assert.equal(activeReadingSection([{id:'first',top:-400},{id:'last',top:180}],120,true), 'last');
  assert.equal(activeReadingSection([],120,true), '');
});
