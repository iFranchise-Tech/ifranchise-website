import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createHash,generateKeyPairSync,sign} from 'node:crypto';

// Runs the delivered Code.gs itself. Only Google services are replaced; RSA,
// validation, duplicate detection, privacy checks and persistence order are real.
export function createReceiver(keys=generateKeyPairSync('rsa',{modulusLength:2048})) {
 const state={rows:new Map(),files:new Map(),operations:[],folderId:'private-resumes',owner:'contact@ifranchise.in',folderOwner:'contact@ifranchise.in',folderParent:'root',folderSharing:'PRIVATE',folderViewers:[],folderEditors:[],createFailure:false,writeFailure:false,flushFailure:false,header:'Reference',locked:false};
 const person=email=>({getEmail:()=>email});
 const iterator=items=>{let index=0;return {hasNext:()=>index<items.length,next:()=>items[index++]};};
 const fileObject=file=>({
  getId:()=>file.id,getOwner:()=>person(file.owner),isTrashed:()=>!!file.trashed,getName:()=>file.name,
  getSharingAccess:()=>file.sharing,getViewers:()=>file.viewers.map(person),getEditors:()=>file.editors.map(person),
  getParents:()=>iterator([{getId:()=>file.parent}]),getMimeType:()=>file.mime,getSize:()=>file.bytes.length,
  getBlob:()=>({getBytes:()=>Array.from(file.bytes)}),
 });
 const folder={getId:()=>state.folderId,getOwner:()=>person(state.folderOwner),isTrashed:()=>false,
  getSharingAccess:()=>state.folderSharing,getViewers:()=>state.folderViewers.map(person),getEditors:()=>state.folderEditors.map(person),
  getParents:()=>iterator([{getId:()=>state.folderParent}]),
  searchFiles:query=>{const prefix=/title contains '([^']+)'/.exec(query)[1];return iterator([...state.files.values()].filter(f=>f.parent===state.folderId&&!f.trashed&&f.name.includes(prefix)).map(fileObject));},
  createFile:blob=>{if(state.createFailure)throw Error('private Google error');const file={id:'private-file-'+(state.files.size+1),name:blob.name,bytes:Buffer.from(blob.bytes),mime:blob.type,owner:state.owner,sharing:'PRIVATE',editors:[],viewers:[],parent:state.folderId};state.files.set(file.id,file);state.operations.push('file');return fileObject(file);}
 };
 const sheet=tab=>{
  if(!state.rows.has(tab))state.rows.set(tab,[]);
  const rows=state.rows.get(tab);
  const range=(r,c,n=1,width=1)=>({getValue:()=>r===1?state.header:rows[r-2]?.[c-1],getValues:()=>rows.slice(r-2,r-2+n).map(row=>row.slice(c-1,c-1+width)),
   getRow:()=>r,setNumberFormat:()=>{},setValues:values=>{if(state.writeFailure)throw Error('private write error');rows[r-2]=Array.from(values[0]);state.operations.push('row');},
   createTextFinder:ref=>({matchEntireCell:()=>({findNext:()=>{const i=rows.findIndex(row=>row[0]===ref);return i===-1?null:range(i+2,1);}})})});
  return {getLastRow:()=>rows.length+1,getRange:range};
 };
 const context=vm.createContext({
  ContentService:{MimeType:{JSON:'json'},createTextOutput:value=>({setMimeType:()=>value})},
  Utilities:{DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},base64DecodeWebSafe:value=>Array.from(Buffer.from(value,'base64url')),base64Decode:value=>Array.from(Buffer.from(value,'base64')),computeDigest:(_,value)=>Array.from(createHash('sha256').update(typeof value==='string'?value:Buffer.from(value)).digest()),newBlob:(bytes,type,name)=>({bytes,type,name})},
  PropertiesService:{getScriptProperties:()=>({getProperty:()=>state.folderId})},Session:{getEffectiveUser:()=>person(state.owner)},
  DriveApp:{Access:{PRIVATE:'PRIVATE'},getRootFolder:()=>({getId:()=> 'root'}),getFolderById:id=>{if(id!==state.folderId)throw Error('missing folder');return folder;},getFileById:id=>{const file=state.files.get(id);if(!file)throw Error('missing file');return fileObject(file);}},
  LockService:{getScriptLock:()=>({waitLock:()=>{if(state.locked)throw Error('busy');state.locked=true;},releaseLock:()=>{state.locked=false;}})},
  SpreadsheetApp:{openById:id=>{if(id!=='1CtjZy19aXx-o39u3QqZMKxCPaRhyRBPM9Ebmp9ZiWqU')throw Error('wrong workbook');return {getSheetByName:tab=>sheet(tab)};},flush:()=>{if(state.flushFailure)throw Error('private flush error');}},
 });
 const source=readFileSync('integrations/google-sheets/Code.gs','utf8').replace(/const PUBLIC_KEY = .*?;/,`const PUBLIC_KEY = ${JSON.stringify(keys.publicKey.export({format:'jwk'}))};`);
 vm.runInContext(source,context);
 function receive(envelope){return JSON.parse(context.doPost({postData:{contents:JSON.stringify(envelope)}}));}
 function post(data,resume){const body=JSON.stringify(data);return receive({body,signature:sign('RSA-SHA256',Buffer.from(body),keys.privateKey).toString('base64url'),...(resume!==undefined?{resume}: {})});}
 return {state,receive,post,keys};
}
export const PDF=Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF\n');
export function applicationEnvelope(reference='IF-00000000-0000-4000-8000-000000000001',pdf=PDF) {
 const row=[reference,'04/11/2026 10:00 IST','QA Applicant','qa@example.test','+919876543210','Bengaluru','Karnataka','QA Role','Fresher','','https://example.test','Education: Graduate','', 'https://example.test/careers/qa','search','organic','jobs','Yes','New','',''];
 return {version:2,timestamp:Date.now(),application:{tab:'Job Applications',row,resume:{name:'resume.pdf',size:pdf.length,sha256:createHash('sha256').update(pdf).digest('hex')}}};
}
