import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resourceCategories,resourceCategory,filterResources,validResourceCategory} from '../lib/resource-categories.mjs';
const articles=JSON.parse(readFileSync(new URL('../content/editorial.json',import.meta.url))).map(a=>({...a,type:'Article'}));
const blogs=JSON.parse(readFileSync(new URL('../content/cms-blogs.json',import.meta.url))).map(a=>({...a,type:'Blog'}));
const items=[...articles,...blogs];

test('every imported blog and article has exactly one category, without losing any posts',()=>{
 const groups=resourceCategories.map(c=>filterResources(items,{category:c.id}));
 assert.equal(groups.flat().length,items.length);
 assert.equal(new Set(groups.flat().map(a=>a.slug)).size,items.length);
 assert.deepEqual(groups.map(g=>g.length),[61,61,6,8]);
});
test('fundamentals and industry guides retain their topic identity',()=>{
 assert(filterResources(articles,{category:'franchise-basics'}).every(a=>a.category==='Fundamentals'));
 assert.equal(resourceCategory(blogs.find(a=>a.slug==='understand-franchise-operating-responsibilities')),'franchise-basics');
 assert(filterResources(articles,{category:'industries'}).every(a=>a.category==='Industries'));
});
test('an editor can move a post to a new category without rewriting its topic',()=>{
 const edited={...blogs[0],resourceCategory:'for-brands'};
 assert.equal(filterResources([edited],{category:'for-investors'}).length,0);
 assert.equal(filterResources([edited],{category:'for-brands',topic:blogs[0].category}).length,1);
 assert.equal(resourceCategory({...edited,resourceCategory:'invalid'}),'for-investors');
 assert.equal(validResourceCategory('invalid'),false);
});
test('category, topic and search filters combine and reset to the full library',()=>{
 const result=filterResources(items,{category:'for-investors',topic:'Investment',query:'  COST  '});
 assert(result.length>0);
 assert(result.every(a=>a.audience==='investor'&&a.category==='Investment'));
 assert.equal(filterResources(items,{category:'industries',topic:'Investment'}).length,0);
 assert.equal(filterResources(items).length,136);
});
test('video and FAQ entries remain in all resources without becoming articles',()=>{
 const mixed=[...items,{type:'Video',title:'Future video'},{type:'FAQs',title:'Questions'}];
 assert.equal(filterResources(mixed).length,138);
 assert.equal(filterResources(mixed,{category:'franchise-basics'}).length,6);
});
