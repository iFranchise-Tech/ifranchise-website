import test from 'node:test';
import assert from 'node:assert/strict';
import {phoneCountries,normalizePhone,normalizeEmail,normalizeWorkEmail,emailSuggestions,emailFieldError,nationalPhoneInput,phoneInputState,formatNationalPhone} from '../lib/contact-validation.mjs';
import {validateContact} from '../lib/enquiry.mjs';
import {journeyConfig} from '../lib/journey-client.mjs';
test('country catalogue includes supported territories and shared calling codes',()=>{assert(phoneCountries.length>240);assert.equal(new Set(phoneCountries.map(c=>c.code)).size,phoneCountries.length);for(const code of ['IN','GB','US','CA','AE','AU','SG','ZA','BR','JP'])assert(phoneCountries.find(c=>c.code===code));assert.equal(phoneCountries.find(c=>c.code==='CA').dial,'+1');});
test('Indian mobile prefix and exact length are enforced',()=>{for(const n of ['5123456789','1234567890','912345678','91234567890','+44 7700 900123'])assert.throws(()=>normalizePhone(n,'IN'));assert.equal(normalizePhone('91234 56789','IN'),'+919123456789');});
test('international numbers normalize with their selected country and reject mismatch',()=>{assert.equal(normalizePhone('07400 123456','GB'),'+447400123456');assert.equal(normalizePhone('415 555 2671','US'),'+14155552671');assert.equal(normalizePhone('050 123 4567','AE'),'+971501234567');assert.throws(()=>normalizePhone('+91 9123456789','GB'));assert.throws(()=>normalizePhone('abc4155552671','US'));assert.throws(()=>normalizePhone('123','US'));assert.throws(()=>normalizePhone('123','XX'));assert.throws(()=>normalizePhone('+44 20 7946 0018','GB'));});
test('email accepts normal aliases and rejects malformed addresses',()=>{assert.equal(normalizeEmail(' Person+Brand@Gmail.COM '),'person+brand@gmail.com');assert.throws(()=>normalizeEmail(''),/Enter your email/);for(const e of ['a..b@gmail.com','.a@gmail.com','a.@gmail.com','a@-example.com','a@example..com','a@example','a b@gmail.com','a@@gmail.com','a'.repeat(65)+'@gmail.com'])assert.throws(()=>normalizeEmail(e),e);});
test('international contact keeps E164 payload while intake and conversion sending stay disabled',()=>{const c=validateContact({name:'Synthetic QA',phone:'07400 123456',phoneCountry:'GB',email:'test@gmail.com',city:'Mumbai',state:'Maharashtra',contactPermission:true});assert.equal(c.phone,'+447400123456');assert(!('phoneCountry' in c));assert.equal(journeyConfig.intakeEnabled,false);assert.equal(journeyConfig.conversionSending,false);});

test('requested email acceptance cases and common domain typo suggestions',()=>{
 assert.equal(normalizeEmail(' sumanth.reddy@gmail.com '),'sumanth.reddy@gmail.com');
 for(const email of ['user@','user@gmail','user@@gmail.com','user name@gmail.com','user..name@gmail.com','user@gmial.com'])assert.throws(()=>normalizeEmail(email),email);
 assert.match(emailFieldError('user@gmial.com'),/user@gmail.com/);
 assert.deepEqual(emailSuggestions('sumanth.reddy@gm'),[{email:'sumanth.reddy@gmail.com',kind:'completion'},{email:'sumanth.reddy@gmx.com',kind:'completion'}]);
 assert.deepEqual(emailSuggestions('user@gmial.com'),[{email:'user@gmail.com',kind:'correction'}]);
 assert.equal(emailSuggestions('user@gmail.com').length,0);
 assert.equal(emailSuggestions('user@@gm').length,0);
 assert.equal(emailSuggestions('user name@gm').length,0);
 assert.deepEqual(emailSuggestions('name@if',['ifranchise.in']),[{email:'name@ifranchise.in',kind:'completion'}]);
 for(const provider of ['outlook.com','hotmail.com','yahoo.com','icloud.com','proton.me'])assert(emailSuggestions('person@'+provider.slice(0,3)).some(s=>s.email==='person@'+provider));
});
test('reserved domains and malformed domain labels cannot be submitted',()=>{
 for(const domain of ['example.com','example.org','example.net','sub.example.com','mail.invalid','mail.test','mail.example','mail.localhost','mail.local','mail.internal','-gmail.com','gmail-.com','g_mail.com','gmail..com','gmail.com.','gmail.c','123.123','[127.0.0.1]','gmail.com/path','gmail.com:443','gmail.com%00','a'.repeat(64)+'.com'])assert.throws(()=>normalizeEmail('user@'+domain),domain);
 for(const email of ['user\n@gmail.com','user\t@gmail.com','<user@gmail.com>','user()@gmail.com','user\\name@gmail.com','user,other@gmail.com',null,{}])assert.throws(()=>normalizeEmail(email));
});
test('aliases, international domains, long TLDs and custom domains are not treated as unverified failures',()=>{
 for(const email of ['o\'hara+sales@ifranchise.in','sales/india@company.technology','"sales:india"@ifranchise.in','用户@邮件.中国','user@bücher.de','user@a-custom-domain-that-may-not-exist.com'])assert.doesNotThrow(()=>normalizeEmail(email),email);
 assert.equal(normalizeEmail('user@bücher.de'),'user@xn--bcher-kva.de');
 assert.throws(()=>normalizeEmail('u'.repeat(64)+'@'+Array(24).fill('ü').join('.')+'.com'),/254 bytes/);
 assert.equal(emailFieldError('',{required:false}),'');
 assert.equal(normalizeWorkEmail(' HR@IFRANCHISE.IN '),'hr@ifranchise.in');
 for(const email of ['user@gmail.com','a..b@ifranchise.in','user@ifranchise.in.attacker.com'])assert.throws(()=>normalizeWorkEmail(email));
});
test('national entry rejects letters and normalizes a country-code paste without duplication',()=>{
 assert.equal(nationalPhoneInput('+91 91234-56789','IN'),'9123456789');
 assert.equal(normalizePhone(nationalPhoneInput('+91 9123456789','IN'),'IN'),'+919123456789');
 assert.equal(nationalPhoneInput('09123456789','IN'),'09123456789');
 assert.throws(()=>normalizePhone(nationalPhoneInput('09123456789','IN'),'IN'));
 for(const value of ['912345678','91234567890','919123456789','+91919123456789','5123456789'])assert.throws(()=>normalizePhone(value,'IN'),value);
 for(const value of ['abc','91234a56789','91234#56789','91234+56789','++919123456789'])assert.throws(()=>nationalPhoneInput(value,'IN'),value);
 assert.throws(()=>nationalPhoneInput('+447400123456','IN'));
 assert.throws(()=>nationalPhoneInput('+14165551234','US'),/Canada/);
});
test('country rules, formatting and international pastes cover multiple regions',()=>{
 const cases=[['IN','9123456789','+919123456789'],['GB','07400123456','+447400123456'],['US','4155552671','+14155552671'],['CA','4165551234','+14165551234'],['AE','0501234567','+971501234567'],['AU','0412345678','+61412345678'],['SG','81234567','+6581234567'],['FR','0612345678','+33612345678']];
 for(const [country,national,expected] of cases){assert.equal(normalizePhone(national,country),expected);assert.equal(normalizePhone(formatNationalPhone(national,country),country),expected);assert.equal(normalizePhone(nationalPhoneInput(expected,country),country),expected);assert.throws(()=>normalizePhone('12345',country));assert(phoneCountries.find(c=>c.code===country)?.flag);}
 assert.throws(()=>normalizePhone('81234567','IN'));
});

 test('phone correction clears every previous error and retains excess digits for editing',()=>{
  for(let attempt=0;attempt<3;attempt++){
   for(const raw of ['91234567890','912345678','5123456789','91234a56789','09123456789','919123456789']){
    const invalid=phoneInputState(raw,'IN');assert.equal(invalid.value,raw);assert(invalid.error);
    const corrected=phoneInputState('9123456789','IN');assert.equal(corrected.error,'');assert.equal(normalizePhone(corrected.value,'IN'),'+919123456789');
   }
  }
  const pasted=phoneInputState('+91 91234-567890','IN');assert.equal(pasted.value,'91234567890');assert.match(pasted.error,/exactly 10/);
  assert.deepEqual(phoneInputState('+91 91234-56789','IN'),{value:'9123456789',error:''});
  assert(phoneInputState('07400123456','IN').error);assert.equal(phoneInputState('07400123456','GB').error,'');
  assert(phoneInputState('81234567','IN').error);assert.equal(phoneInputState('81234567','SG').error,'');
  assert(phoneInputState('+447400123456','IN').error);
 });
