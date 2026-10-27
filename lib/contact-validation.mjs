import {getCountries,getCountryCallingCode,parsePhoneNumberFromString,AsYouType} from 'libphonenumber-js/max';
import metadata from 'libphonenumber-js/metadata.max.json';
// Google/libphonenumber metadata: mobile possible lengths, falling back to the
// country's general lengths where fixed/mobile share a pattern (e.g. NANP).
export function maximumMobileDigits(country='IN'){const c=metadata.countries[country];return c?Math.max(...(c[11]?.[1]?.[1]||c[3])):15;}
const names=new Intl.DisplayNames(['en'],{type:'region'});
export const phoneCountries=getCountries().map(code=>({code,name:names.of(code)||code,dial:'+'+getCountryCallingCode(code),flag:String.fromCodePoint(...[...code].map(c=>127397+c.charCodeAt(0)))})).sort((a,b)=>a.name.localeCompare(b.name,'en'));
// Strip presentation separators, never letters or an unmarked national prefix.
// A full international paste is accepted only for the selected calling country.
export function nationalPhoneInput(value,country='IN'){
 const raw=String(value??'').trim(),selected=phoneCountries.find(c=>c.code===country);
 if(!selected)throw Error('Select a dialling code.');
 if(!raw)return '';
 if(!/^\+?[\d\s().-]+$/.test(raw))throw Error('Use digits only.');
 const compact=raw.replace(/[\s().-]/g,'');
 if(!compact.startsWith('+')){
  // Keep every entered digit. Validation, not input truncation, checks length.
  return compact;
 }
 if(!compact.startsWith(selected.dial))throw Error('Check the number and selected dialling code.');
 const parsed=parsePhoneNumberFromString(compact,{extract:false});
 if(parsed?.country&&parsed.country!==country)throw Error('Check the selected dialling region.');
 return compact.slice(selected.dial.length);
}
export function formatNationalPhone(value,country='IN'){
 return new AsYouType(country).input(value);
}
export function normalizePhone(value,country='IN'){
 const selected=phoneCountries.find(c=>c.code===country);
 if(!selected)throw Error('Select a dialling code.');
 const raw=String(value||'').trim();
 if(!raw)throw Error('Enter your mobile number.');
 if(!/^\+?[\d\s().-]+$/.test(raw))throw Error('Use digits only.');
 const compact=raw.replace(/[\s().-]/g,'');
 if(country==='IN'){
  const national=compact.startsWith('+91')?compact.slice(3):compact;
  if(national.length!==10)throw Error('Enter a valid 10-digit mobile number.');
  if(!/^[6-9]\d{9}$/.test(national))throw Error('Enter a mobile number starting with 6, 7, 8 or 9.');
 }
 const parsed=parsePhoneNumberFromString(compact,{defaultCountry:country,extract:false});
 if(!parsed||!parsed.isValid()||parsed.country!==country)throw Error('Check the number and selected dialling code.');
 const type=parsed.getType();
 if(type&&type!=='MOBILE'&&type!=='FIXED_LINE_OR_MOBILE')throw Error('Enter a valid mobile number.');
 return parsed.number;
}
export const emailDomains=['gmail.com','outlook.com','hotmail.com','yahoo.com','icloud.com','live.com','aol.com','proton.me','protonmail.com','yahoo.co.in','yahoo.co.uk','zoho.com','gmx.com','mail.com','fastmail.com'];
const domainTypos={'gmial.com':'gmail.com','gamil.com':'gmail.com','gmai.com':'gmail.com','gnail.com':'gmail.com','gmal.com':'gmail.com','gmail.con':'gmail.com','gmail.cmo':'gmail.com','gmail.comm':'gmail.com','outlok.com':'outlook.com','outllok.com':'outlook.com','outlook.con':'outlook.com','hotmial.com':'hotmail.com','hotmai.com':'hotmail.com','hotmil.com':'hotmail.com','yaho.com':'yahoo.com','yahoo.con':'yahoo.com','yhaoo.com':'yahoo.com','iclod.com':'icloud.com'};
const reservedTlds=new Set(['invalid','test','example','localhost','local','internal','onion']);
function emailParts(value){
 if(typeof value!=='string')throw Error('Enter your email address.');
 const email=value.trim().toLowerCase();
 if(!email)throw Error('Enter your email address.');
 if(new TextEncoder().encode(email).length>254)throw Error('Use an email address of 254 bytes or fewer.');
 if(/\s/u.test(email))throw Error('Remove spaces from inside your email address.');
 const parts=email.split('@'),local=parts[0],domain=parts[1];
 if(parts.length!==2||!local||!domain)throw Error('Enter one complete email address, such as name@gmail.com.');
 // Dot-atoms, aliases, quoted ASCII locals and international letters are supported.
 // Spaces, repeated @ and consecutive dots remain disallowed by the input policy.
 const atom=/^[\p{L}\p{M}\p{N}A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/u.test(local);
 const quoted=/^"(?:[\x21\x23-\x3f\x41-\x5b\x5d-\x7e]|\\[\x21-\x3f\x41-\x7e])+"$/.test(local);
 if(new TextEncoder().encode(local).length>64||local.startsWith('.')||local.endsWith('.')||local.includes('..')||!atom&&!quoted)throw Error('Check the part before @. Use a valid mailbox name without consecutive dots.');
 if(!/^[\p{L}\p{M}\p{N}.-]+$/u.test(domain))throw Error('Check the email domain. Use a domain such as gmail.com.');
 let ascii;try{ascii=new URL('https://'+domain).hostname}catch{throw Error('Enter a valid email domain.');}
 const labels=ascii.split('.'),tld=labels.at(-1);
 if(labels.length<2||ascii.length>253||labels.some(label=>label.length>63||!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label))||!(/^[a-z]{2,63}$/i.test(tld)||/^xn--[a-z0-9-]+$/i.test(tld)))throw Error('Enter the full email domain, such as gmail.com.');
 if(reservedTlds.has(tld)||['example.com','example.org','example.net'].some(d=>ascii===d||ascii.endsWith('.'+d)))throw Error('Use your own email address. Example and reserved domains cannot receive this enquiry.');
 if(new TextEncoder().encode(local+'@'+ascii).length>254)throw Error('Use an email address of 254 bytes or fewer.');
 return {local,domain:ascii,email:local+'@'+ascii};
}
export function emailSuggestions(value,domains=emailDomains){
 if(typeof value!=='string')return [];
 const raw=value.trim(),parts=raw.split('@');
 if(parts.length!==2||!parts[0]||/\s/.test(raw))return [];
 const [local,typed]=parts,domain=typed.toLowerCase(),correction=domainTypos[domain];
 if(correction&&domains.includes(correction))return [{email:local+'@'+correction,kind:'correction'}];
 if(domains.includes(domain))return [];
 return domains.filter(d=>d.startsWith(domain)).slice(0,5).map(d=>({email:local+'@'+d,kind:'completion'}));
}
export function normalizeEmail(value){
 const result=emailParts(value),correction=domainTypos[result.domain];
 if(correction)throw Error('Did you mean '+result.local+'@'+correction+'? Check the email domain before continuing.');
 // Syntax validation does not verify DNS, delivery, ownership or mailbox existence.
 return result.email;
}
export function normalizeWorkEmail(value){
 const email=normalizeEmail(value);
 if(email.slice(email.lastIndexOf('@')+1)!=='ifranchise.in')throw Error('Use an iFranchise email address.');
 return email;
}
export function emailFieldError(value,{required=true,work=false}={}){
 if(!required&&typeof value==='string'&&!value.trim())return '';
 try{work?normalizeWorkEmail(value):normalizeEmail(value);return '';}catch(error){return error.message;}
}
export function normalizeName(value){
 const name=String(value||'').trim().replace(/\s+/gu,' ');
 if(name.length<2||name.length>120)throw Error('Enter your full name (2–120 characters).');
 if(!/^[\p{L}\p{M}]+(?:[ \u2019'\-][\p{L}\p{M}]+)*$/u.test(name))throw Error('Use letters, spaces, hyphens or apostrophes in your name.');
 return name;
}
export function contactFieldError(kind,value,country='IN'){
 try{kind==='phone'?normalizePhone(value,country):kind==='name'?normalizeName(value):normalizeEmail(value);return '';}catch(error){return error.message;}
}

// The displayed value and its validation result are always derived together.
// Keep invalid input visible so it can be corrected, never revive an old error.
export function phoneInputState(raw,country='IN'){
 let value=String(raw??'');
 try{value=nationalPhoneInput(value,country)}catch{}
 return {value,error:contactFieldError('phone',value,country)};
}
