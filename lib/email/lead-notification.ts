import {websiteEmail,WEBSITE_FROM} from './templates.mjs';
import {emailOrigin} from './service';

const recipient='contact@ifranchise.in';
const log=(status:string,code?:string)=>console.info(JSON.stringify({service:'website_lead_email',status,...(code?{code}:{})}));

/** No lead payload or retry queue is written to D1/R2. Call only after a NEW Sheets receipt. */
export async function notifySavedLead(env:Cloudflare.Env,record:any) {
  if(env.EMAIL_MODE!=='resend'){log('disabled');return;}
  try {
    const environment=env.EMAIL_ENVIRONMENT||'';
    const localDev=import.meta.env.DEV===true&&environment==='development';
    if(!env.RESEND_API_KEY||!(['preview','production'].includes(environment)||localDev))throw Error('configuration');
    if(env.WEBSITE_NOTIFICATION_TO&&env.WEBSITE_NOTIFICATION_TO.trim().toLowerCase()!==recipient)throw Error('recipient_configuration');
    if(environment!=='production'||import.meta.env.DEV===true){
      const allowed=(env.EMAIL_ALLOWED_RECIPIENTS||'').split(',').map(value=>value.trim().toLowerCase());
      if(!allowed.includes(recipient))throw Error('recipient_not_allowed');
    }
    const message=websiteEmail({to:[recipient],record,origin:emailOrigin(env),storage:'sheets'});
    if(message.from!==WEBSITE_FROM)throw Error('sender_configuration');
    const body=JSON.stringify(message);
    // Retry only this frozen message, within Resend's 24-hour idempotency window.
    // Do not retry from a duplicate Sheets receipt: it cannot return the original
    // payload or notification state. Durable recovery needs receiver support.
    for(let attempt=0;attempt<2;attempt++){
      try {
        // Workers reject redirect:"error". "manual" still refuses to follow a redirect,
        // so the Resend credential is not sent to another host.
        const result=await fetch('https://api.resend.com/emails',{method:'POST',redirect:'manual',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'ifranchise/sheets/'+record.id},body,signal:AbortSignal.timeout(10000)});
        if(result.status>=300&&result.status<400){await result.body?.cancel();log('failed','redirect_rejected');return;}
        if(!result.ok){
          if([408,429].includes(result.status)||result.status>=500)throw Error('provider_temporary');
          log('failed','provider_rejected');return;
        }
        if(!result.headers.get('content-type')?.includes('application/json'))throw Error('provider_unconfirmed');
        const receipt:any=await result.json();
        if(typeof receipt?.id!=='string'||!receipt.id)throw Error('provider_unconfirmed');
        log('accepted');return;
      }catch{if(attempt===1){log('failed','retry_exhausted');return;}}
      await new Promise(resolve=>setTimeout(resolve,1000));
    }
  }catch{log('failed','configuration');}
}
