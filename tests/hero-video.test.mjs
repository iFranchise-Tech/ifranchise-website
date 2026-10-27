import test from 'node:test';
import assert from 'node:assert/strict';
import {createHeroPlayback,selectHeroFilm,heroFilms} from '../lib/hero-video-playback.mjs';

class Video extends EventTarget {
  src=''; paused=true; ended=false; muted=false; currentTime=0; error=null;
  plays=0; loads=0; reject=null;
  getAttribute(name) { return name==='src'?this.src:null; }
  play() { this.plays++; if(this.reject)return Promise.reject(this.reject); this.paused=false; this.ended=false; return Promise.resolve(); }
  pause() { if(!this.paused){this.paused=true;this.dispatchEvent(new Event('pause'));} }
  load() { this.loads++; this.currentTime=0; this.error=null; this.paused=true; }
  event(name) { this.dispatchEvent(new Event(name)); }
}
const flush=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
function fixture(){
  const video=new Video(); let eligible=true,time=0,tick,cancelled=false; const unavailable=[];
  const controller=createHeroPlayback(video,{canPlay:()=>eligible,source:()=>heroFilms.hd,onUnavailable:value=>unavailable.push(value),now:()=>time,every:callback=>{tick=callback;return 1;},cancel:()=>{cancelled=true;}});
  return {video,controller,unavailable,setEligible:value=>{eligible=value;},advance:amount=>{time+=amount;tick();},cancelled:()=>cancelled};
}
test('source selection preserves detail on retina desktop and portrait mobile without loading all renditions',()=>{
  assert.equal(selectHeroFilm(1440,900,1),heroFilms.hd);
  assert.equal(selectHeroFilm(1440,900,2),heroFilms.qhd);
  assert.equal(selectHeroFilm(2560,1440,1),heroFilms.qhd);
  assert.equal(selectHeroFilm(390,844,3),heroFilms.portrait);
  assert.equal(selectHeroFilm(740,360,2),heroFilms.hd);
  assert.equal(selectHeroFilm(1440,900,2,'3g'),heroFilms.hd);
});
test('defers the video while loading, offscreen or conserving data; resumes when eligible',async()=>{
  const f=fixture();f.setEligible(false);f.controller.sync();await flush();assert.equal(f.video.src,'');assert.equal(f.video.plays,0);
  f.setEligible(true);f.controller.sync();await flush();assert.equal(f.video.src,heroFilms.hd);assert.equal(f.video.paused,false);assert.equal(f.video.muted,true);
  f.setEligible(false);f.controller.sync();await flush();f.advance(20000);assert.equal(f.video.paused,true);assert.equal(f.video.loads,0);
  f.setEligible(true);f.controller.sync();await flush();assert.equal(f.video.paused,false);f.controller.destroy();
});
test('healthy repeated loops never reload or interrupt playback',async()=>{
  const f=fixture();f.controller.sync();await flush();
  for(let i=0;i<120;i++){f.video.currentTime=(i*2)%16.8;f.video.event('timeupdate');f.advance(2000);await flush();}
  assert.equal(f.video.loads,0);assert.equal(f.video.plays,1);assert.equal(f.video.paused,false);f.controller.destroy();
});
test('recovers unexpected pauses and end-of-stream without requiring a page refresh',async()=>{
  const f=fixture();f.controller.sync();await flush();f.video.pause();await flush();assert.equal(f.video.paused,false);
  f.video.currentTime=16.8;f.video.ended=true;f.video.paused=true;f.video.event('ended');await flush();
  assert.equal(f.video.currentTime,0);assert.equal(f.video.paused,false);assert.equal(f.video.loads,0);f.controller.destroy();
});
test('a stalled decoder reloads with a cooldown and stops retrying persistent failure',async()=>{
  const f=fixture();f.controller.sync();await flush();f.advance(8000);await flush();assert.equal(f.video.loads,1);
  f.advance(8000);await flush();assert.equal(f.video.loads,1);
  f.advance(2000);await flush();assert.equal(f.video.loads,2);
  f.advance(10000);await flush();f.advance(10000);assert.equal(f.video.loads,2);assert.equal(f.unavailable.at(-1),true);f.controller.destroy();
});
test('normal progress after a recovered stall resets the retry budget',async()=>{
  const f=fixture();f.controller.sync();await flush();f.advance(8000);await flush();
  f.video.currentTime=2;f.video.event('timeupdate');f.advance(10000);await flush();assert.equal(f.video.loads,2);
  f.video.currentTime=3;f.video.event('timeupdate');f.advance(10000);await flush();assert.equal(f.video.loads,3);f.controller.destroy();
});
test('autoplay denial waits for a user gesture instead of repeatedly loading',async()=>{
  const f=fixture();f.video.reject={name:'NotAllowedError'};f.controller.sync();await flush();f.advance(30000);await flush();
  assert.equal(f.video.plays,1);assert.equal(f.video.loads,0);
  f.video.reject=null;f.controller.sync(true);await flush();assert.equal(f.video.paused,false);f.controller.destroy();
});
test('unsupported media falls back to the poster and network errors can recover',async()=>{
  const f=fixture();f.controller.sync();await flush();f.video.error={code:4};f.video.event('error');f.advance(20000);assert.equal(f.video.loads,0);assert.equal(f.unavailable.at(-1),true);
  f.video.error={code:2};f.controller.sync(true);await flush();assert.equal(f.video.loads,1);f.video.event('canplay');assert.equal(f.unavailable.at(-1),false);f.controller.destroy();
});
test('cleanup cancels recovery and late events cannot start the video again',async()=>{
  const f=fixture();f.controller.sync();f.controller.destroy();await flush();f.video.event('canplay');f.video.event('ended');f.advance(20000);await flush();
  assert.equal(f.cancelled(),true);assert.equal(f.video.plays,0);assert.equal(f.video.loads,0);assert.equal(f.video.paused,true);
});
