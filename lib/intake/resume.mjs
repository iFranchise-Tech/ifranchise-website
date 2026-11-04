import {MAX_RESUME} from './validation.mjs';

// Structural checks, not a malware scanner. Files remain private and are never
// served or executed by the website.
export function validateResume({bytes,name,type=''}) {
  if(!(bytes instanceof Uint8Array)||!bytes.length||bytes.length>MAX_RESUME||
    typeof name!=='string'||!/\.pdf$/i.test(name)||
    !['','application/pdf','application/octet-stream'].includes(type.toLowerCase())||
    !/^%PDF-[12]\.\d[\r\n]/.test(new TextDecoder().decode(bytes.subarray(0,12)))||
    !/%%EOF[\t\n\r ]*$/.test(new TextDecoder().decode(bytes.subarray(Math.max(0,bytes.length-1024))))) {
    throw Error('Upload a complete PDF résumé up to 5 MB.');
  }
  const clean=name.replace(/[^a-zA-Z0-9 ._-]/g,'').replace(/^\.+/,'').trim();
  return (clean.slice(0,-4).slice(0,100).trim()||'resume')+'.pdf';
}

export async function encodeResume(file) {
  const name=validateResume(file);
  const sha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',file.bytes)),b=>b.toString(16).padStart(2,'0')).join('');
  // Chunk at a multiple of three: bounded argument lists, no giant binary string.
  const parts=[];
  for(let i=0;i<file.bytes.length;i+=24576)parts.push(btoa(String.fromCharCode(...file.bytes.subarray(i,i+24576))));
  return {metadata:{name,size:file.bytes.length,sha256},base64:parts.join('')};
}
