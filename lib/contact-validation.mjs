import {normalizeEmail} from './email-validation.mjs';
export {emailDomains,emailSuggestions,normalizeEmail,normalizeWorkEmail,emailFieldError} from './email-validation.mjs';
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
