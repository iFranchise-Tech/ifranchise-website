'use client';
import {submissionError} from '../lib/intake/receipt.mjs';
import {useRouter} from 'next/navigation';
import {showConfirmation,captureConfirmationOrigin} from '../lib/intake/confirmation.mjs';
import {useRef,useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {PhoneField,EmailField,NameField,validatePhoneFields} from './contact-fields';
import {LocationFields,IntakeConsent,useIntake,readReceipt} from './intake-fields';
import {QUALIFICATIONS,EDUCATION_STATUSES,EMPLOYMENT_STATUSES,NOTICE_PERIODS} from '../lib/intake/constants.mjs';

export function JobApplicationForm({job}:{job:{id:string;slug?:string;title:string}}){
 const router=useRouter();
 const sending=useRef(false),intake=useIntake();
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const [experienceType,setExperienceType]=useState(''),[employmentStatus,setEmploymentStatus]=useState('');
 const id='job-application';
 async function send(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(sending.current)return;validatePhoneFields(e.currentTarget);if(!e.currentTarget.reportValidity())return;sending.current=true;setBusy(true);setError('');const returnTo=captureConfirmationOrigin(window,'job');let redirecting=false;try{const form=e.currentTarget,p=await intake.payload(form,'job');await readReceipt(await fetch('/api/intake/applications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...p,jobSlug:job.slug||job.id}),signal:AbortSignal.timeout(30000)}));redirecting=true;showConfirmation(window,(path:string)=>router.push(path),returnTo);}catch(e:any){setError(submissionError(e))}finally{if(!redirecting){sending.current=false;setBusy(false)}}}

 return <form className="candidate-form" aria-label="Job application" noValidate onSubmit={send}>
  <div className="field-row"><NameField id={id}/><EmailField id={id}/></div>
  <div className="field-row"><PhoneField id={id}/><div className="field"><label htmlFor={id+'-profile'}>LinkedIn or portfolio</label><input id={id+'-profile'} name="profile" type="url" placeholder="https://" maxLength={500}/></div></div>
  <LocationFields id={id}/>
  <fieldset className="candidate-section"><legend>Education</legend>
   <div className="field-row">
    <div className="field"><label htmlFor={id+'-qualification'}>Highest qualification *</label><select id={id+'-qualification'} name="qualification" required defaultValue=""><option value="">Select qualification</option>{QUALIFICATIONS.map(value=><option key={value}>{value}</option>)}</select></div>
    <div className="field"><label htmlFor={id+'-course'}>Course / field of study *</label><input id={id+'-course'} name="course" required minLength={2} maxLength={160} placeholder="e.g. B.Com, Computer Science"/></div>
   </div>
   <div className="field-row">
    <div className="field"><label htmlFor={id+'-education-status'}>Qualification status *</label><select id={id+'-education-status'} name="educationStatus" required defaultValue=""><option value="">Select status</option>{EDUCATION_STATUSES.map(value=><option key={value}>{value}</option>)}</select></div>
    <div className="field"><label htmlFor={id+'-institution'}>School / college / institution *</label><input id={id+'-institution'} name="institution" required minLength={2} maxLength={160} placeholder="Enter institution name"/></div>
   </div>
  </fieldset>
  <fieldset className="candidate-section"><legend>Work experience</legend>
   <div className="field-row">
    <div className="field"><label htmlFor={id+'-experience-type'}>Experience level *</label><select id={id+'-experience-type'} name="experienceType" value={experienceType} onChange={e=>{setExperienceType(e.target.value);setEmploymentStatus('')}} required><option value="">Select experience level</option><option value="fresher">Fresher</option><option value="experienced">Experienced</option></select></div>
    {experienceType==='experienced'&&<div className="field"><label htmlFor={id+'-employment'}>Current employment status *</label><select id={id+'-employment'} name="employmentStatus" required value={employmentStatus} onChange={e=>setEmploymentStatus(e.target.value)}><option value="">Select employment status</option>{EMPLOYMENT_STATUSES.map(value=><option key={value}>{value}</option>)}</select></div>}
   </div>
   {experienceType==='experienced'&&<>
    <div className="field-row"><div className="field"><label htmlFor={id+'-years'}>Experience in years *</label><input id={id+'-years'} name="experienceYears" type="number" min="0" max="60" step="1" required inputMode="numeric" placeholder="e.g. 2"/></div><div className="field"><label htmlFor={id+'-months'}>Additional months *</label><select id={id+'-months'} name="experienceMonths" required defaultValue=""><option value="">Select months</option>{Array.from({length:12},(_,i)=><option key={i} value={i}>{i}</option>)}</select></div></div>
    {employmentStatus==='Currently employed'&&<div className="field-row"><div className="field"><label htmlFor={id+'-notice'}>Notice period *</label><select id={id+'-notice'} name="noticePeriod" required defaultValue=""><option value="">Select notice period</option>{NOTICE_PERIODS.map(value=><option key={value}>{value}</option>)}</select></div></div>}
   </>}
  </fieldset>
  <div className="field"><label htmlFor={id+'-note'}>Cover note</label><textarea id={id+'-note'} name="coverNote" rows={4} maxLength={3000}/></div>
  <div className="field"><label htmlFor={id+'-resume'}>Resume Link (Google Drive) *</label><input id={id+'-resume'} name="resumeLink" type="url" inputMode="url" required maxLength={500} placeholder="https://drive.google.com/file/d/…"/></div>
  <IntakeConsent job/>{error&&<p className="form-message error" role="alert">{error}</p>}<button type="submit" className="p-button" disabled={!intake.ready||busy}>{busy?'Sending application…':'Submit application'}<ArrowUpRight size={18}/></button>
 </form>;
}
