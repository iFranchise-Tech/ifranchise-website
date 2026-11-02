import {invitationEmail, activationEmail, accessHelpEmail, adminEmail, websiteEmail} from '../../lib/email/templates.mjs';

// Fictional fixtures only. This module cannot send email or access credentials.
export const origin = 'https://preview.example.test';
export const sampleToken = 'preview_'.padEnd(43, 'x');
const staff = {email:'ananya@example.test', name:'Ananya Rao', origin};
export const emailPreviews = [
  {id:'invitation', label:'Staff invitation', message:invitationEmail({...staff, role:'editor', token:sampleToken})},
  {id:'activation', label:'Account activated', message:activationEmail(staff)},
  {id:'access-help', label:'Account access help', message:accessHelpEmail(staff)},
  {id:'admin', label:'Admin notification', message:adminEmail({to:['it@ifranchise.in'], action:'publish', actor:'editor@example.test', reference:'articles:building-a-franchise-ready-business', origin})},
  ...[
    ['investor','Franchise enquiry','Rohan Mehta'], ['brand','Brand expansion','Kavya Shah'],
    ['general','General enquiry','Arjun Menon'], ['job','Job application','Priya Nair'],
  ].map(([kind,label,name], index) => ({id:kind, label, message:websiteEmail({to:['contact@ifranchise.in'], origin,
    record:{kind, reference:`IF-72bf1d85-2ab6-4ead-96a0-507fa0ad720${index}`, payload:JSON.stringify({name, email:'sender@example.test', jobTitle:'Business Development Manager', message:'Private content — never include in email.', phone:'+91 90000 00000'}), resume_key:'private/resume.pdf'}})})),
  // Render the existing admin template's delivery-action variant for review.
  // This fixture does not add a new automatic notification or webhook side effect.
  {id:'delivery-activity', label:'Delivery activity (admin variant)', message:adminEmail({to:['it@ifranchise.in'], action:'retry email', actor:'admin@example.test', reference:'email:2cd65ec6-3fe8-4ddd-b188-09de2c532d36', origin})},
];
