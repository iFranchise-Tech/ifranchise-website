const encoder = new TextEncoder();
const base64 = bytes => btoa(String.fromCharCode(...bytes));
const unbase64 = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
export function randomToken() { return base64(crypto.getRandomValues(new Uint8Array(32))).replaceAll('+','-').replaceAll('/','_').replaceAll('=',''); }
export async function tokenHash(value) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join(''); }
async function encryptionKey(secret) {
  const bytes=unbase64(secret || '');
  if(bytes.length!==32)throw Error('Email encryption key is not configured');
  return crypto.subtle.importKey('raw',bytes,'AES-GCM',false,['encrypt','decrypt']);
}
export async function seal(value,secret,id) {
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(id)},await encryptionKey(secret),encoder.encode(JSON.stringify(value)));
  return base64(iv)+'.'+base64(new Uint8Array(ciphertext));
}
export async function unseal(value,secret,id) {
  const [iv,ciphertext]=value.split('.');
  const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:unbase64(iv),additionalData:encoder.encode(id)},await encryptionKey(secret),unbase64(ciphertext));
  return JSON.parse(new TextDecoder().decode(bytes));
}
// Svix's documented signing scheme, using Web Crypto's constant-time verification.
export async function verifyWebhook(body,headers,secret,now=Date.now()) {
  const id=headers.get('svix-id'),timestamp=headers.get('svix-timestamp'),signatures=headers.get('svix-signature');
  if(!id||id.length>200||!/^\d{10}$/.test(timestamp||'')||Math.abs(now/1000-Number(timestamp))>300||!signatures||signatures.length>2000||!secret?.startsWith('whsec_'))throw Error('Invalid signature');
  const key=await crypto.subtle.importKey('raw',unbase64(secret.slice(6)),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  const signed=encoder.encode(`${id}.${timestamp}.${body}`);
  for(const entry of signatures.split(' ')) {
    const [version,signature]=entry.split(',');
    if(version!=='v1'||!signature)continue;
    try { if(await crypto.subtle.verify('HMAC',key,unbase64(signature),signed))return id; } catch { /* try the next rotated signature */ }
  }
  throw Error('Invalid signature');
}
