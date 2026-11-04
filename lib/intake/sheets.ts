import {sheetEntry} from './validation.mjs';
import {encodeResume} from './resume.mjs';

/** The existing Apps Script is the sole writer and deduplicates Reference under a lock. */
export async function saveToSheets(config:{SHEETS_WEBHOOK_URL?:string;INTAKE_SIGNING_KEY?:string},record:any,origin:string,resume?:{bytes:Uint8Array;name:string;type?:string}) {
  if(!config.SHEETS_WEBHOOK_URL||!config.INTAKE_SIGNING_KEY)throw Error('sheets_not_configured');
  const endpoint=new URL(config.SHEETS_WEBHOOK_URL);
  const local=import.meta.env.DEV===true&&['localhost','127.0.0.1'].includes(endpoint.hostname);
  if(!local&&(endpoint.protocol!=='https:'||endpoint.hostname!=='script.google.com'||!/^\/macros\/s\/[^/]+\/exec$/.test(endpoint.pathname)))throw Error('invalid_sheets_endpoint');
  if(endpoint.username||endpoint.password||endpoint.search||endpoint.hash)throw Error('invalid_sheets_endpoint');
  if(record.kind==='job'&&!resume)throw Error('resume_required');
  if(resume&&record.kind!=='job')throw Error('unexpected_resume');
  const attachment=resume?await encodeResume(resume):undefined;
  const entry=sheetEntry(record,origin);
  if(attachment)entry.row[12]=''; // The trusted receiver writes the private Drive URL.
  // Nest the new contract so an old receiver rejects it before writing a row.
  // Only small metadata is signed; the signature binds the PDF's SHA-256 digest.
  const body=JSON.stringify(attachment?{version:2,timestamp:Date.now(),application:{...entry,resume:attachment.metadata}}:{...entry,timestamp:Date.now()});
  const key=await crypto.subtle.importKey('jwk',JSON.parse(config.INTAKE_SIGNING_KEY),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
  const signed=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(body));
  const signature=btoa(String.fromCharCode(...new Uint8Array(signed))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  // Apps Script ContentService redirects to its response host; fetch follows that GET.
  const result=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({body,signature,...(attachment?{resume:attachment.base64}:{})}),signal:AbortSignal.timeout(attachment?45000:25000)});
  if(!result.ok||!result.headers.get('content-type')?.toLowerCase().includes('application/json'))throw Error('unconfirmed_sheets_save');
  const receipt:any=await result.json();
  if(receipt?.ok!==true||receipt.reference!==record.reference||(receipt.duplicate!==undefined&&typeof receipt.duplicate!=='boolean'))throw Error('unconfirmed_sheets_save');
  if(attachment&&(receipt.resume?.saved!==true||receipt.resume?.private!==true||receipt.resume?.sha256!==attachment.metadata.sha256||receipt.resume?.size!==attachment.metadata.size||typeof receipt.resume?.url!=='string'||!/^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view$/.test(receipt.resume.url)))throw Error('unconfirmed_resume_save');
  return {duplicate:receipt.duplicate===true,...(attachment?{resumeName:attachment.metadata.name,resumeUrl:receipt.resume.url}:{})};
}
