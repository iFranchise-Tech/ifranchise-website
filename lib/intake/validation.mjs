import {NOTICE_VERSION,PRIVACY_REQUEST_TYPES} from './constants.mjs';
import {normalizeEmail} from '../contact-validation.mjs';
import {validateContact} from '../enquiry.mjs';
import {budgetOptions,timeframeOptions} from '../journey-client.mjs';
export const SHEET_URL='https://docs.google.com/spreadsheets/d/1eavzRbd_ajJsX9Hj6XaPiPsksXIzB7pdT8WhI6KesJk/edit';
export {MAX_RESUME} from './constants.mjs';
export function text(value,max=200){return String(value??'').trim().slice(0,max);}
export function validateIntake(p){
 if(!['investor','brand','general','job','privacy'].includes(p.kind))throw Error('Choose an enquiry type.');
 if(!/^[a-f0-9-]{36}$/.test(p.id||''))throw Error('Reload the form and try again.');
 if(p.noticeVersion!==NOTICE_VERSION)throw Error('The privacy notice has been updated. Reload the form and review it before sending.');
 if(p.kind==='privacy'){
  if(p.trap)throw Error('This request could not be verified.');
  if(!PRIVACY_REQUEST_TYPES.includes(p.requestType))throw Error('Choose a privacy request type.');
  return {kind:'privacy',email:normalizeEmail(p.email),requestType:p.requestType,reference:text(p.reference,100),message:text(p.message,2000),noticeVersion:p.noticeVersion,status:'Received',source:{},sourcePage:'/privacy-choices'};
 }
 if(p.adult!==true)throw Error('Please confirm that you are 18 or older.');
 const contact=validateContact({...p,contactPermission:p.consent===true,website:p.trap});
 const data={...contact,kind:p.kind,sourcePage:text(p.sourcePage,400),source:{},consent:true,adult:true,consentVersion:p.noticeVersion,consentPurpose:p.kind==='job'?'Assess this application':'Respond to this enquiry',consentAt:new Date().toISOString()};
 // Optional measurement is inactive. Never trust client-supplied campaign attribution.
 if(!data.sourcePage.startsWith('/')||data.sourcePage.startsWith('//'))data.sourcePage='/';
 if(p.kind==='investor'){
  if(!budgetOptions.includes(p.budget)||!timeframeOptions.includes(p.timeframe))throw Error('Choose your investment range and timeframe.');
  Object.assign(data,{brandSlug:text(p.brandSlug,160),budget:p.budget,timeframe:p.timeframe,brochureRequested:false});
 }
 if(p.kind==='brand'){
  if(text(p.companyName).length<2)throw Error('Enter your business name.');
  const website=text(p.companyWebsite,500);
  if(website){let u;try{u=new URL(website)}catch{throw Error('Enter a valid business website.')}if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error('Enter a valid business website.');}
  if(!timeframeOptions.includes(p.timeframe))throw Error('Choose your expansion timeframe.');
  Object.assign(data,{companyName:text(p.companyName,120),companyWebsite:website,timeframe:p.timeframe});
 }
 if(p.kind==='general'){if(text(p.message,3000).length<10)throw Error('Add a short message (at least 10 characters).');data.message=text(p.message,3000);}
 if(p.kind==='job'){
  if(!p.jobSlug)throw Error('Choose an available role.');
  let experience,experienceYears=0,experienceMonths=0;
  if(p.experienceType==='fresher')experience='Fresher';
  else if(p.experienceType==='experienced'){
   if(!/^\d{1,2}$/.test(String(p.experienceYears))||!/^\d{1,2}$/.test(String(p.experienceMonths)))throw Error('Enter experience in whole years and months.');
   experienceYears=Number(p.experienceYears);experienceMonths=Number(p.experienceMonths);
   if(experienceMonths>11||experienceYears*12+experienceMonths>720||experienceYears*12+experienceMonths<1)throw Error('Enter experience from 1 month to 60 years, with months between 0 and 11.');
   experience=`${experienceYears} ${experienceYears===1?'year':'years'} ${experienceMonths} ${experienceMonths===1?'month':'months'}`;
  }else throw Error('Choose Fresher or Experienced.');
  const profile=text(p.profile,500);if(profile&&!/^https:\/\//.test(profile))throw Error('Use a complete https:// profile link.');
  Object.assign(data,{jobSlug:text(p.jobSlug,160),experience,experienceType:p.experienceType,experienceYears,experienceMonths,noticePeriod:text(p.noticePeriod,120),profile,coverNote:text(p.coverNote,3000)});
 }
 return data;
}
export function sheetEntry(record,origin){
 if(record.kind==='privacy')throw Error('Privacy requests are handled in the private admin workspace.');
 const p=JSON.parse(record.payload),date=new Date(record.created_at).toLocaleString('en-GB',{timeZone:'Asia/Kolkata',hour12:false});
 const common=[record.reference,date,p.name,p.email,p.phone,p.city,p.state||''];
 const tail=[origin+p.sourcePage,p.source?.utm_source||'',p.source?.utm_medium||'',p.source?.utm_campaign||'','Yes','New','',''];
 if(record.kind==='investor')return {tab:'Franchise Enquiries',row:[...common,p.brandName||'Help me explore',p.budget,p.timeframe,p.brochureRequested?'Yes':'No',...tail]};
 if(record.kind==='brand')return {tab:'Brand Expansion',row:[...common,p.companyName,p.companyWebsite,p.timeframe,...tail]};
 if(record.kind==='general')return {tab:'General Enquiries',row:[...common,p.message,...tail]};
 return {tab:'Job Applications',row:[...common,p.jobTitle,p.experience,p.noticePeriod,p.profile,p.coverNote,origin+'/admin/submissions/'+record.id,...tail]};
}
