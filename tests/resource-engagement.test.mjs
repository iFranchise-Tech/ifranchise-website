import test from 'node:test';
import assert from 'node:assert/strict';
import {READING_KEY,readSaved,saveResource,removeResource,updatePosition,resumePath} from '../lib/reading-list.mjs';
import {sharedResourceUrl,socialShareUrl,shareChannels} from '../lib/resource-sharing.mjs';
import {track,writeConsent} from '../lib/measurement.mjs';
function storage(){const map=new Map();return{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};}
const path='/blogs/what-is-a-franchise';
test('saving and returning preserves the section and progress, then removal stops position writes',()=>{
 const s=storage();assert.equal(updatePosition(s,path,{progress:.4}),false);assert.equal(readSaved(s).length,0);
 assert.equal(saveResource(s,path,{progress:0}),true);const savedAt=readSaved(s)[0].savedAt;
 assert.equal(updatePosition(s,path,{progress:.42,anchor:'operating-model',offset:.25}),true);
 const reopened=readSaved(s)[0];assert.equal(reopened.savedAt,savedAt);assert.equal(reopened.progress,.42);assert.equal(reopened.anchor,'operating-model');assert.equal(reopened.offset,.25);assert.equal(resumePath(reopened),path+'?resume=1');
 removeResource(s,path);assert.deepEqual(readSaved(s),[]);assert.equal(updatePosition(s,path,{progress:.6}),false);
});
test('malformed or unavailable browser storage fails safely',()=>{
 const s=storage();for(const value of ['broken','null','{}']){s.setItem(READING_KEY,value);assert.deepEqual(readSaved(s),[]);}
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('quota')}};
 assert.deepEqual(readSaved(blocked),[]);assert.equal(saveResource(blocked,path),false);assert.equal(removeResource(undefined,path),false);
});
test('storage validates paths, deduplicates, bounds positions and limits list size',()=>{
 const s=storage();for(const invalid of ['https://example.com','javascript:alert(1)','//host/blogs/example','/admin','/resources/blogs/example?email=someone'])assert.equal(saveResource(s,invalid),false);
 s.setItem(READING_KEY,JSON.stringify([{path,progress:4,offset:-5,anchor:'<script>'},{path},{path:'/resources/videos/example',progress:-1,offset:Infinity}]));
 assert.deepEqual(readSaved(s).map(x=>[x.progress,x.offset,x.anchor]),[[1,0,''],[0,0,'']]);
 for(let n=0;n<105;n++)saveResource(s,'/resources/blogs/item-'+n);assert.equal(readSaved(s).length,100);assert.equal(readSaved(s)[0].path,'/resources/blogs/item-104');
});
test('shares use canonical resource links and channel attribution without copying visitor query data',()=>{
 const url=new URL(sharedResourceUrl('https://ifranchise.example',path+'?email=private&token=secret#operating-model','linkedin','article'));
 assert.equal(url.pathname,path);assert.equal(url.hash,'');assert.equal(url.searchParams.get('utm_source'),'linkedin');assert.equal(url.searchParams.get('utm_campaign'),'resource_share');assert.equal(url.searchParams.get('utm_content'),'article_what-is-a-franchise');assert.equal(url.searchParams.size,4);assert(!url.href.includes('private'));assert(!url.href.includes('secret'));
 for(const channel of shareChannels){const link=socialShareUrl(channel,url.href,'A & B: ₹10 lakh?','https://ifranchise.example/cover.webp');assert(link);assert(link.startsWith(channel==='email'?'mailto:':'https://'));assert(link.includes(encodeURIComponent(url.href)));}
 assert.equal(socialShareUrl('unsupported',url.href,'Title'),null);
});
test('measurement requires active configuration and consent, and never includes arbitrary personal fields',()=>{
 const w={localStorage:storage()};const details={content_id:'example',content_type:'article',content_path:path,channel:'linkedin',action:'open',progress_percent:24.6,email:'private@example.com',name:'Someone',url:'https://private'};
 track(w,'ifranchise_resource_share_intent',details,{enabled:true});assert.equal(w.dataLayer,undefined);
 writeConsent(w.localStorage,{analytics:true,advertising:false});track(w,'ifranchise_resource_share_intent',details);assert.equal(w.dataLayer,undefined);
 track(w,'ifranchise_resource_share_intent',details,{enabled:true});assert.deepEqual(w.dataLayer[0],{event:'ifranchise_resource_share_intent',content_id:'example',content_type:'article',content_path:path,channel:'linkedin',action:'open',progress_percent:25});
 track(w,'test',{content_path:path+'?private=1',content_id:'not a slug',channel:'user@email',progress_percent:Infinity},{enabled:true});assert.deepEqual(w.dataLayer[1],{event:'test'});
});
