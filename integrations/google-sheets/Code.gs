// iFranchise website intake. This receiver writes only to the configured workbook.
const SHEET_ID = '1eavzRbd_ajJsX9Hj6XaPiPsksXIzB7pdT8WhI6KesJk';
const PUBLIC_KEY = {"kty":"RSA","n":"7SOBNevxRa0m7ZAks_TFN2C8U7B4I_eMtfyIeJ0Xr11V9B71S1QFFW4LF5XzDZcPrx2hJpduNF5HqeuG0-8F77m9Buy59smQdH5-WH4Rf2yBvrR2MkRiJKyAiLKM57sHeYb7V0jkqM6esjmMTCb4Q8_YGvYUx1mAvCfHdhaiih4OVY9rURzzanTEqeY3dnxci9TqqUlUTFXh3SjWWcWrlfpXFrtcraoVNP6yRzVG5A6RnaqEdotnTdn_AKmrkq-CIlSO_1G-iEIjUe2-bovmk4LY3ZjJbbdWa6c_-Vz7jyuRrVGhhSPdl4gHclNo9PS2zwnfn0WC9TAlvDuX2pi48Q","e":"AQAB"};
const TABS = {'Franchise Enquiries':19,'Brand Expansion':18,'General Enquiries':16,'Job Applications':21};
function doGet(){ return json({service:'iFranchise website enquiries',ready:true}); }
function json(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function hex(bytes){return bytes.map(b=>(b&255).toString(16).padStart(2,'0')).join('');}
function power(base,exp,mod){let result=BigInt(1);base%=mod;while(exp>BigInt(0)){if(exp&BigInt(1))result=result*base%mod;base=base*base%mod;exp>>=BigInt(1);}return result;}
function verified(body,signature){
 try {
  const n=BigInt('0x'+hex(Utilities.base64DecodeWebSafe(PUBLIC_KEY.n)));
  const e=BigInt('0x'+hex(Utilities.base64DecodeWebSafe(PUBLIC_KEY.e)));
  const bytes=Utilities.base64DecodeWebSafe(signature);if(bytes.length!==256)return false;
  const s=BigInt('0x'+hex(bytes));if(s>=n)return false;
  const encoded=power(s,e,n).toString(16).padStart(512,'0');
  const digest=hex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,body,Utilities.Charset.UTF_8));
  return encoded==='0001'+'ff'.repeat(202)+'00'+'3031300d060960864801650304020105000420'+digest;
 }catch(_){return false;}
}
function doPost(e){
 let lock;
 try{
  if(!e.postData||e.postData.contents.length>40000)return json({ok:false});
  const envelope=JSON.parse(e.postData.contents);
  if(typeof envelope.body!=='string'||typeof envelope.signature!=='string'||!verified(envelope.body,envelope.signature))return json({ok:false});
  const data=JSON.parse(envelope.body);
  if(typeof data.timestamp!=="number"||!Number.isFinite(data.timestamp)||Math.abs(Date.now()-data.timestamp)>300000||!TABS[data.tab]||!Array.isArray(data.row)||data.row.length!==TABS[data.tab]||!/^IF-[a-f0-9-]{36}$/.test(data.row[0]))return json({ok:false});
  lock=LockService.getScriptLock();lock.waitLock(20000);
  const sheet=SpreadsheetApp.openById(SHEET_ID).getSheetByName(data.tab);
  if(!sheet||sheet.getRange(1,1).getValue()!=='Reference')return json({ok:false});
  const last=sheet.getLastRow();
  if(last>1&&sheet.getRange(2,1,last-1,1).createTextFinder(data.row[0]).matchEntireCell(true).findNext())return json({ok:true,reference:data.row[0],duplicate:true});
  const row=data.row.map(v=>{const s=String(v==null?'':v).slice(0,6000);return /^[=+\-@\t\r]/.test(s)?"'"+s:s;});
  const range=sheet.getRange(last+1,1,1,row.length);range.setNumberFormat('@');range.setValues([row]);
  SpreadsheetApp.flush();
  return json({ok:true,reference:data.row[0]});
 }catch(_){return json({ok:false});}finally{if(lock)lock.releaseLock();}
}
