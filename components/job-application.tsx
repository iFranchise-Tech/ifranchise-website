'use client';
import {showConfirmation} from '../lib/intake/confirmation.mjs';
import {useRef,useState} from 'react';
import {ArrowUpRight,FileUp} from 'lucide-react';
import {PhoneField,EmailField,NameField,validatePhoneFields} from './contact-fields';
import {LocationFields,IntakeConsent,useIntake,readReceipt} from './intake-fields';
import {MAX_RESUME,QUALIFICATIONS,EDUCATION_STATUSES,EMPLOYMENT_STATUSES,NOTICE_PERIODS} from '../lib/intake/constants.mjs';

export function JobApplicationForm({job}:{job:{id:string;slug?:string;title:string}}){
 const sending=useRef(false),intake=useIntake();
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const [fileName,setFileName]=useState(''),[experienceType,setExperienceType]=useState(''),[employmentStatus,setEmploymentStatus]=useState('');
 const id='job-application';
 async function send(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(sending.current)return;validatePhoneFields(e.currentTarget);if(!e.currentTarget.reportValidity())return;sending.current=true;setBusy(true);setError('');let redirecting=false;try{const form=e.currentTarget,p=await intake.payload(form,'job'),fd=new FormData(form),file=fd.get('resume') as File;if(!file?.size||file.size>MAX_RESUME)throw Error('Upload a PDF resume up to 5 MB.');const body=new FormData();body.set('payload',JSON.stringify({...p,resume:undefined,jobSlug:job.slug||job.id}));body.set('resume',file);await readReceipt(await fetch('/api/intake/applications',{method:'POST',body}));redirecting=true;showConfirmation(window);}catch(e:any){setError(e.message)}finally{if(!redirecting){sending.current=false;setBusy(false)}}}

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
  <div className="field resume-field"><label htmlFor={id+'-resume'}><FileUp size={20}/>Resume * <small>PDF · up to 5 MB</small></label><input id={id+'-resume'} name="resume" type="file" accept="application/pdf,.pdf" required onChange={e=>{const file=e.target.files?.[0];e.target.setCustomValidity(file&&(file.size>MAX_RESUME||!file.name.toLowerCase().endsWith('.pdf'))?'Choose a PDF up to 5 MB.':'');setFileName(file?.name||'')}}/>{fileName&&<span>{fileName}</span>}</div>
  <IntakeConsent job/>{error&&<p className="form-message error" role="alert">{error}</p>}<button type="submit" className="p-button" disabled={!intake.ready||busy}>{busy?'Sending application…':'Submit application'}<ArrowUpRight size={18}/></button>
 </form>;
}
