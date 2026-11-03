import {sheetEntry} from './validation.mjs';

/** The existing Apps Script is the sole writer and deduplicates Reference under a lock. */
export async function saveToSheets(config:{SHEETS_WEBHOOK_URL?:string;INTAKE_SIGNING_KEY?:string},record:any,origin:string) {
  if(!config.SHEETS_WEBHOOK_URL||!config.INTAKE_SIGNING_KEY)throw Error('sheets_not_configured');
  const endpoint=new URL(config.SHEETS_WEBHOOK_URL);
  const local=import.meta.env.DEV===true&&['localhost','127.0.0.1'].includes(endpoint.hostname);
  if(!local&&(endpoint.protocol!=='https:'||endpoint.hostname!=='script.google.com'||!/^\/macros\/s\/[^/]+\/exec$/.test(endpoint.pathname)))throw Error('invalid_sheets_endpoint');
  if(endpoint.username||endpoint.password||endpoint.search||endpoint.hash)throw Error('invalid_sheets_endpoint');
  const body=JSON.stringify({...sheetEntry(record,origin),timestamp:Date.now()});
  const key=await crypto.subtle.importKey('jwk',JSON.parse(config.INTAKE_SIGNING_KEY),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
  const signed=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(body));
  const signature=btoa(String.fromCharCode(...new Uint8Array(signed))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  // Apps Script ContentService redirects to its response host; fetch follows that GET.
  const result=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({body,signature}),signal:AbortSignal.timeout(25000)});
  if(!result.ok||!result.headers.get('content-type')?.toLowerCase().includes('application/json'))throw Error('unconfirmed_sheets_save');
  const receipt:any=await result.json();
  if(receipt?.ok!==true||receipt.reference!==record.reference||(receipt.duplicate!==undefined&&typeof receipt.duplicate!=='boolean'))throw Error('unconfirmed_sheets_save');
  return {duplicate:receipt.duplicate===true};
}
