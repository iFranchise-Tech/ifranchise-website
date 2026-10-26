import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {homepageReading,applyCommercial,editingIssues,formatReturns,selectedItems,resourceKey,imageStyle,frameStyle} from '../lib/cms/display.mjs';
import {imageDimensions} from '../lib/cms/image-dimensions.mjs';
import {canEdit,canView,canApprove} from '../lib/cms/policy.mjs';

test('return arrangements retain the investment basis and payment period',()=>{
 const t={arrangement:'higher',margin:12,guaranteeType:'amount',guarantee:125000,period:'monthly',note:'Excluding the franchise fee'};
 assert.equal(formatReturns(t),'12% margin on sales or a minimum guarantee of ₹1,25,000 monthly, whichever is higher. Excluding the franchise fee');
 assert.equal(formatReturns({...t,arrangement:'share',note:''}),'12% margin on sales');
 assert.equal(formatReturns({...t,arrangement:'minimum',guaranteeType:'percentage',guarantee:15,period:'annual',note:''}),'Minimum guarantee of 15% of total investment annually');
 assert.equal(formatReturns({...t,arrangement:'fixed',note:''}),'Fixed return of ₹1,25,000 monthly');
 assert.match(formatReturns({...t,margin:null}),/Enter the values/);
});
test('commercial values are non-destructive, preserve free text and expose structured values',()=>{
 const original={facts:{returns:'Tiered bespoke conditions',sqFt:'Ask the brand'},spaceRequirement:{mode:'range',min:500,max:1000},agreementYears:5,lockInYears:2,outlets:0,locationFormats:['Malls','High street']};
 const b=applyCommercial(original);assert.equal(b.facts.returns,original.facts.returns);assert.equal(original.facts.sqFt,'Ask the brand');assert.equal(b.facts.sqFt,'500–1,000 sq. ft.');assert.equal(b.facts.outlets,'0');assert.equal(b.facts.agreementTerm,'5 years');assert.equal(b.facts.locationType,'Malls / High street');
 assert.equal(applyCommercial({...original,spaceRequirement:{mode:'fixed',min:700,max:null}}).facts.sqFt,'700 sq. ft.');
});
test('legacy over-limit content is retained until the corresponding list is edited',()=>{
 const old={gallery:Array.from({length:20},(_,i)=>'/images/'+i+'.webp'),overview:'x'.repeat(1100),highlights:['x'.repeat(150)],faqs:[{q:'x'.repeat(101),a:'x'.repeat(401)}]};
 assert.deepEqual(editingIssues('franchises',old,old),[]);
 assert.deepEqual(editingIssues('franchises',{...old,name:'Updated name'},old),[]);
 assert.match(editingIssues('franchises',{...old,gallery:[...old.gallery].reverse()},old).join(),/10 gallery/);
 assert.match(editingIssues('franchises',{...old,overview:'x'.repeat(1001)},old).join(),/1,000/);
 assert.deepEqual(editingIssues('franchises',{...old,gallery:old.gallery.slice(0,10),overview:'x'.repeat(1000),highlights:['x'.repeat(100)],faqs:Array.from({length:5},(_,i)=>({q:String(i)+'x'.repeat(99),a:'x'.repeat(400)}))},old),[]);
});
test('FAQ limits and duplicate questions apply consistently to managed pages',()=>{
 for(const slug of ['homepage','list-your-brand','opportunities','contact-us']){
  assert.match(editingIssues('faqs',{slug,questions:Array.from({length:6},(_,i)=>({q:'Question '+i,a:'Answer'}))}).join(),/5 FAQs/);
  assert.match(editingIssues('faqs',{slug,questions:[{q:'SAME',a:'A'},{q:' same ',a:'B'}]}).join(),/different/);
 }
});
test('manual relationships preserve order, empty selections and missing-reference fallbacks',()=>{
 const items=[{slug:'a'},{slug:'b'}];assert.equal(selectedItems(undefined,items),null);assert.deepEqual(selectedItems([],items),[]);assert.deepEqual(selectedItems(['b','missing','a'],items),[items[1],items[0]]);
 assert.equal(resourceKey({slug:'one',resourceType:'blog'}),'blogs:one');assert.equal(resourceKey({slug:'one',resourceType:'video'}),'videos:one');
});
test('framing describes CSS display changes without touching source images',()=>{
 assert.equal(imageStyle({fit:'contain',x:25,y:70,zoom:1.3}).objectPosition,'25% 70%');assert.equal(frameStyle({ratio:'16/9',width:75}).aspectRatio,'16/9');assert.equal(frameStyle({ratio:'original'}).aspectRatio,undefined);
});
test('image dimensions validate actual WebP headers and reject malformed or excessive images',()=>{
 const file=readFileSync(new URL('../public/art/natural/articles/what-is-a-franchise.webp',import.meta.url));const dimensions=imageDimensions(file,'image/webp');assert(dimensions.width>=32&&dimensions.height>=32);
 assert.throws(()=>imageDimensions(new Uint8Array(30),'image/webp'),/dimensions|header/);
 const png=Buffer.alloc(33);png.write('IHDR',12);png.writeUInt32BE(20000,16);png.writeUInt32BE(20000,20);assert.throws(()=>imageDimensions(png,'image/png'),/megapixels/);
 png.writeUInt32BE(1200,16);png.writeUInt32BE(800,20);assert.deepEqual(imageDimensions(png,'image/png'),{width:1200,height:800});
});
test('job display order inherits jobs permission, never franchise permissions',()=>{
 const hr={email:'hr@ifranchise.in',status:'active',role:'approver',scopes:['jobs']},brands={...hr,scopes:['franchises']};
 assert(canEdit(hr,'job-order'));assert(!canView(hr,'placements'));assert(!canEdit(brands,'job-order'));
 assert(canApprove(hr,{kind:'placements',slug:'jobs',submittedBy:hr.email},[]));assert(!canApprove(brands,{kind:'placements',slug:'jobs',submittedBy:hr.email},[]));
});

test('homepage editor and public page share the same automatic reading selections',()=>{const items=[{slug:'brand-guide',audience:'brand'},{slug:'investor-guide',audience:'investor'},{slug:'what-is-a-franchise',audience:'all'}];assert.deepEqual(homepageReading(items).map(x=>x.slug),['what-is-a-franchise','investor-guide','brand-guide']);});
