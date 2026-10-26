import test from 'node:test';
import assert from 'node:assert/strict';
import {scrollbarGeometry,scrollFromThumb} from '../lib/scrollbar.mjs';
test('overlay scroll thumb follows top, middle and bottom of page',()=>{const top=scrollbarGeometry(800,3200,0),middle=scrollbarGeometry(800,3200,1200),bottom=scrollbarGeometry(800,3200,2400);assert.equal(top.height,200);assert.equal(top.top,0);assert.equal(middle.top,300);assert.equal(bottom.top,600);assert.equal(scrollFromThumb(300,top.max,top.travel),1200);assert.equal(scrollFromThumb(-300,top.max,top.travel),-1200)});
test('scroll thumb handles short pages, tiny windows and overscroll',()=>{assert.equal(scrollbarGeometry(800,500,0).max,0);assert.equal(scrollbarGeometry(800,500,0).height,800);assert.equal(scrollFromThumb(100,0,0),0);assert.equal(scrollbarGeometry(20,10000,0).height,20);assert.equal(scrollbarGeometry(800,3200,-30).top,0);assert.equal(scrollbarGeometry(800,3200,3000).top,600)});
