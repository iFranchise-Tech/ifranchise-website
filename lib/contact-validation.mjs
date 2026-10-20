import {getCountries,getCountryCallingCode,parsePhoneNumberFromString} from 'libphonenumber-js/max';
const names=new Intl.DisplayNames(['en'],{type:'region'});
export const phoneCountries=getCountries().map(code=>({code,name:names.of(code)||code,dial:'+'+getCountryCallingCode(code)})).sort((a,b)=>a.name.localeCompare(b.name,'en'));
export function normalizePhone(value,country='IN'){
 const selected=phoneCountries.find(c=>c.code===country);
 if(!selected)throw Error('Choose a country for your mobile number.');
 const raw=String(value||'').trim();
 if(!raw)throw Error('Enter your mobile number.');
 if(!/^\+?[\d\s().-]+$/.test(raw))throw Error('Use numbers only, with your selected country code.');
 const compact=raw.replace(/[\s().-]/g,'');
 if(country==='IN'){
  const national=compact.startsWith('+91')?compact.slice(3):compact;
  if(!/^[6-9]\d{9}$/.test(national))throw Error('Enter 10 digits, starting with 6, 7, 8 or 9.');
 }
 const parsed=parsePhoneNumberFromString(compact,{defaultCountry:country,extract:false});
 if(!parsed||!parsed.isValid()||parsed.country!==country)throw Error('Enter a valid mobile number for '+selected.name+' ('+selected.dial+').');
 const type=parsed.getType();
 if(type&&type!=='MOBILE'&&type!=='FIXED_LINE_OR_MOBILE')throw Error('Enter a mobile number, not a landline or service number.');
 return parsed.number;
}
export function normalizeEmail(value){
 const email=String(value||'').trim().toLowerCase();
 if(!email)throw Error('Enter your email address.');
 if(email.length>254)throw Error('Use an email address of 254 characters or fewer.');
 const parts=email.split('@'),local=parts[0],domain=parts[1];
 if(parts.length!==2||!local||local.length>64||local.startsWith('.')||local.endsWith('.')||local.includes('..')||!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)||!domain)throw Error('Enter an email address such as you@example.com.');
 const labels=domain.split('.');
 if(labels.length<2||labels.some(label=>label.length>63||!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label))||!(/^[a-z]{2,63}$/i.test(labels.at(-1))||/^xn--[a-z0-9-]+$/i.test(labels.at(-1))))throw Error('Check the email domain, for example example.com.');
 return email;
}
export function contactFieldError(kind,value,country='IN'){
 try{kind==='phone'?normalizePhone(value,country):normalizeEmail(value);return '';}catch(error){return error.message;}
}
