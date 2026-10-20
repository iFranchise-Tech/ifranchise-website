import {parsePhoneNumberFromString} from 'libphonenumber-js/max';
import {env} from 'cloudflare:workers';
import {published} from '../../../../lib/cms/public';
import {assertOrigin,boundedBody,failure,CmsError} from '../../../../lib/cms/auth';
import {journeyConfig,budgetOptions,timeframeOptions} from '../../../../lib/journey-client.mjs';
import {validateContact} from '../../../../lib/enquiry.mjs';
export const dynamic='force-dynamic';
export async function POST(req:Request,{params}:{params:Promise<{slug:string}>}){try{
 assertOrigin(req);const {slug}=await params;const brand=(await published('franchises')).find(b=>b.slug===slug);
 if(!brand?.brochure||brand.brochureEnabled===false)throw new CmsError(404,'This brochure is unavailable.');
 // The same launch switch controls enquiries and brochure-gated enquiries.
 if(!journeyConfig.intakeEnabled)throw new CmsError(503,'Online enquiries and brochure downloads are currently paused. Please contact our team.');
 if(!req.headers.get('content-type')?.includes('application/json'))throw new CmsError(415,'Invalid request.');
 let p:any;try{p=JSON.parse(new TextDecoder().decode(await boundedBody(req,16000)))}catch{throw new CmsError(400,'Invalid enquiry.');}
 let contact;try{contact=validateContact({name:p.name,phone:p.phone,phoneCountry:p.phone_country||parsePhoneNumberFromString(String(p.phone))?.country||'IN',email:p.email,city:p.city,contactPermission:p.contact_permission===true,website:p.website});}catch(e:any){throw new CmsError(422,e.message||'Complete your contact details.');}
 if(typeof p.token!=='string'||!p.token||typeof p.challenge!=='string'||!p.challenge||!budgetOptions.includes(p.budget)||!timeframeOptions.includes(p.timeframe))throw new CmsError(422,'Complete the enquiry and verification.');
 const key=brand.brochure.startsWith('/media/')?'cms/'+brand.brochure.slice(7):brand.brochure.slice(1);
 const file=await env.BUCKET?.get(key);if(!file)throw new CmsError(503,'The brochure is being updated. Please contact our team.');
 const res=await fetch(journeyConfig.relayOrigin+'/journeys/investor/submit',{method:'POST',redirect:'error',headers:{'Content-Type':'application/json','Origin':new URL(req.url).origin},body:JSON.stringify({token:p.token,...contact,contact_permission:true,challenge:p.challenge,website:'',interest_slug:slug,budget:p.budget,timeframe:p.timeframe,advertising_permission:false,source:{}})});
 const receipt:any=await res.json();if(!res.ok||receipt.received!==true||typeof receipt.event_id!=='string')throw new CmsError(422,receipt.message||'Your enquiry could not be confirmed. Please try again.');
 return new Response(file.body,{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${slug}-brochure.pdf"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch(e){return failure(e)}}
export function GET(){return new Response('Complete the enquiry to request this brochure.',{status:405,headers:{Allow:'POST','Cache-Control':'no-store'}})}
