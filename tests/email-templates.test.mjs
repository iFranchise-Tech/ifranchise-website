import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emailPreviews, origin, sampleToken} from './fixtures/email-previews.mjs';
import {invitationEmail, activationEmail, accessHelpEmail, adminEmail, websiteEmail} from '../lib/email/templates.mjs';

for (const {id,message} of emailPreviews) test(`${id}: accessible email structure, centered fallback CTA and complete plain text`, () => {
  assert.match(message.html, /<html lang="en"/);
  assert.equal((message.html.match(/<h1\b/g)||[]).length, 1);
  assert.match(message.html, /max-width:600px/);
  assert.match(message.html, /<td align="center"[^>]*text-align:center/);
  assert.match(message.html, /\[if mso\][\s\S]*width="600"/);
  assert.match(message.html, /<v:roundrect[^>]*width:224px/);
  assert.match(message.html, /alt="iFranchise — Connect\. Expand\. Grow\."/);
  assert(!/<script\b|<form\b|<svg\b|display:\s*(grid|flex)|linear-gradient|@import|data:image/i.test(message.html));
  assert(Buffer.byteLength(message.html)<30000, 'well below Gmail clipping thresholds');
  const cta = message.html.match(/class="email-cta" href="([^"]+)"/)[1];
  assert.match(message.html, new RegExp('href="'+cta.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'"'));
  assert(message.text.includes(cta.replaceAll('&amp;','&')));
  assert(message.text.includes('iFranchise'));
  assert(message.text.includes(message.from.includes('<it@') ? 'it@ifranchise.in' : 'contact@ifranchise.in'));
  assert(!message.html.includes('undefined') && !message.text.includes('undefined'));
});

test('invitation CTA preserves the exact fragment token in HTML, Outlook and plain text', () => {
  const message=emailPreviews[0].message, url=`${origin}/cms/activate#token=${sampleToken}`;
  assert.equal(message.html.split(`href="${url}"`).length-1,2);
  assert(message.text.includes(url));
  assert.match(message.text,/14 days/);assert.match(message.text,/only once/);
  assert(!message.html.includes('?token='));
});

test('all dynamic fields stay escaped, including unknown actions and application titles', () => {
  const attack='\"><img src=x onerror=alert(1)>&\'account';
  const messages=[invitationEmail({email:attack,name:attack,role:attack,origin,token:sampleToken}),
    activationEmail({email:attack,name:attack,origin}),adminEmail({to:[],action:attack,actor:attack,reference:attack,origin}),
    ...['investor','brand','general','job'].map(kind=>websiteEmail({to:[],origin,record:{kind,reference:attack,payload:JSON.stringify({name:attack,jobTitle:attack,email:'sender@example.test',message:'PRIVATE-CONTENT',phone:'PRIVATE-PHONE'}),resume_key:'PRIVATE-CV'}}))];
  for(const message of messages){assert(!message.html.includes('<img src=x'));assert(message.html.includes('&lt;img'));assert(!message.html.includes('PRIVATE-CV'));}
});

test('unsafe link schemes and embedded credentials are rejected', () => {
  for(const invalid of ['javascript:alert(1)','data:text/html,unsafe','https://user:pass@example.test','http://external.example.test']) {
    assert.throws(()=>activationEmail({email:'a@example.test',name:'A',origin:invalid}));
  }
  assert.match(activationEmail({email:'a@example.test',name:'A',origin:'http://127.0.0.1:3023'}).html,/http:\/\/127\.0\.0\.1:3023\/admin/);
});

test('recovery is Workspace guidance, and delivery activity makes no delivery claim', () => {
  const help=accessHelpEmail({email:'a@example.test',origin});
  assert.match(help.text,/Google Workspace through Cloudflare Access/);
  assert.match(help.text,/does not change your password or grant access/);
  assert(!help.html.includes('#token=') && !help.html.includes('/reset'));
  assert.match(emailPreviews.at(-1).message.text,/not a delivery confirmation/);
});

test('sender identities, Reply-To and enquiry privacy are retained for every variant', () => {
  for(const {id,message} of emailPreviews){const publicEmail=['investor','brand','general','job'].includes(id);assert.equal(message.from,publicEmail?'iFranchise <contact@ifranchise.in>':'iFranchise <it@ifranchise.in>');assert.equal(message.reply_to,publicEmail?'sender@example.test':'it@ifranchise.in');assert(!message.text.includes('private/resume.pdf'));}
  assert.throws(()=>websiteEmail({to:[],origin,record:{kind:'privacy',payload:'{}'}}));
});

test('email logo is a real PNG with explicit retina dimensions', () => {
  const png=readFileSync(new URL('../public/assets/ifranchise-email-logo.png',import.meta.url));
  assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),704);assert.equal(png.readUInt32BE(20),176);
});

test('lead notification includes labelled contact, enquiry, timestamp and safe source details in HTML and text', () => {
  const message=websiteEmail({to:['contact@ifranchise.in'],origin,record:{id:'synthetic-lead',kind:'investor',created_at:'2026-11-03T06:00:00Z',payload:JSON.stringify({
    name:'Ananya Rao',email:'ananya@example.test',phone:'+14155552671',state:'Karnataka',city:'Bengaluru',brandName:'Example & Co',budget:'Exploring',timeframe:'Just exploring',message:'Please share the available formats.',
    sourcePage:'/franchise-opportunities/example?email=private@example.test&secret=PRIVATE-SECRET&tracking=PRIVATE-QUERY#PRIVATE-HASH',
  })}});
  assert.equal(message.from,'iFranchise <contact@ifranchise.in>');assert.deepEqual(message.to,['contact@ifranchise.in']);
  assert.equal(message.reply_to,'ananya@example.test');
  for(const content of [message.html,message.text]){
    for(const value of ['Received','IST','Contact details','Ananya Rao','ananya@example.test','+14155552671','Karnataka','Bengaluru','Investment preference','Exploring','Please share the available formats.','Source page',origin+'/franchise-opportunities/example',origin+'/admin/inbox/synthetic-lead'])assert(content.includes(value),value);
    for(const excluded of ['private@example.test','PRIVATE-SECRET','PRIVATE-QUERY','PRIVATE-HASH'])assert(!content.includes(excluded),excluded);
  }
  assert(message.html.includes('Example &amp; Co'));assert(message.text.includes('Example & Co'));
});

test('unsafe or missing source pages are omitted rather than presented as trusted attribution', () => {
  for(const sourcePage of [undefined,'https://external.example','//external.example','/admin/inbox','/api/private','/cms/activate#token=private','/bad\\path']){
    const message=websiteEmail({to:['contact@ifranchise.in'],origin,record:{kind:'general',payload:JSON.stringify({name:'Test',email:'test@example.test',sourcePage})}});
    assert(!message.html.includes('Source page'));assert(!message.text.includes('Source page'));
  }
});

test('lead notifications include complete application and business details, with private storage references excluded', () => {
  for(const [kind,fields,values] of [
    ['brand',{companyName:'Example Brand',companyWebsite:'https://example.test',timeframe:'This year',message:'Expansion plans'},['Business name','Example Brand','Business website','https://example.test','Expansion timeframe','This year','Expansion plans']],
    ['job',{jobTitle:'Business Development Associate',experience:'2 years, 6 months',employmentStatus:'Currently employed',noticePeriod:'30 days',qualification:'Bachelor’s degree',course:'B.Com',educationStatus:'Completed',institution:'Example College',profile:'https://example.test/profile',coverNote:'My application note'},['Role','Business Development Associate','2 years, 6 months','Currently employed','30 days','Bachelor’s degree','B.Com','Completed','Example College','https://example.test/profile','My application note','Résumé','CV & portfolio.pdf (available in CMS)']],
    ['general',{message:'Please discuss our plans.'},['Message','Please discuss our plans.']],
  ]){
    const email=websiteEmail({to:['contact@ifranchise.in'],origin,record:{kind,created_at:'2026-11-03T06:00:00Z',resume_name:kind==='job'?'CV & portfolio.pdf':null,resume_key:'PRIVATE-STORAGE-KEY',payload:JSON.stringify({name:'Sample Visitor',email:'visitor@example.test',phone:'+919876543210',state:'Karnataka',city:'Bengaluru',sourcePage:'/contact-us',...fields})}});
    for(const value of values){assert(email.text.includes(value),value);assert(email.html.includes(value.replaceAll('&','&amp;')),value);}
    for(const content of [email.html,email.text])assert(!content.includes('PRIVATE-STORAGE-KEY'));
  }
});

test('only existing allowlisted attribution is rendered, escaped and clearly labelled as visitor supplied', () => {
  const email=websiteEmail({to:['contact@ifranchise.in'],origin,record:{kind:'general',payload:JSON.stringify({name:'Test',email:'visitor@example.test',source:{utm_source:'Example & Co',utm_medium:'social',utm_campaign:'<img src=x onerror=alert(1)>',token:'PRIVATE-TOKEN',email:'PRIVATE-ADDRESS',ip:'PRIVATE-IP'}})}});
  for(const content of [email.html,email.text]){
    for(const value of ['Campaign attribution (visitor supplied)','Campaign source','Campaign medium','social','Campaign name'])assert(content.includes(value));
    for(const value of ['PRIVATE-TOKEN','PRIVATE-ADDRESS','PRIVATE-IP'])assert(!content.includes(value));
  }
  assert(email.html.includes('Example &amp; Co'));assert(email.html.includes('&lt;img'));assert(!email.html.includes('<img src=x'));
  const without=websiteEmail({to:['contact@ifranchise.in'],origin,record:{kind:'general',payload:'{}'}});
  assert(!without.text.includes('Campaign attribution'));
});
