// PREVIEW TEST COPY. Do not replace integrations/google-sheets/Code.gs.
// Do not paste the production spreadsheet id or the production public key.
//
// 1. Create a blank spreadsheet, or open the preview test spreadsheet.
// 2. Open Extensions → Apps Script and paste this complete file.
// 3. Leave SHEET_ID and PUBLIC_KEY as set below. PUBLIC_KEY contains only kty, n, and e.
//    Do not paste .secrets/intake-private.jwk.json or the production spreadsheet id.
// 4. Select setupPreviewSpreadsheet and run it. It does not deploy the web app.
// 5. Deploy manually: Deploy → New deployment → Web app.
//    Execute as the spreadsheet owner. Who has access: Anyone.
//    Copy the /exec URL for SHEETS_WEBHOOK_URL.
const SHEET_ID = '1CtjZy19aXx-o39u3QqZMKxCPaRhyRBPM9Ebmp9ZiWqU';
const PUBLIC_KEY = {"kty":"RSA","n":"255DgHN2TA1iBbK9nke4OuJQI9tqam8oldOZyEEbWmt1YFKK82fIZZbmoDG1eU2rjAODbajxqa-IN92-17gP1HHOq6H7apGNayL2vUbhFJZ2iMPOKz24QmioxQz_0AYHv8yMiNjeJH5aZqpNs1RQ96VWhdcH5u-T-XGrAv99XKb5XbvtB4cP15yLOSFx1-sghLxofzULXHJladksYY3JU6CCphspDymRf_NjIVqnRUoMOtaAyMVeknNiOfEQgAoAZS7YEsbOo4EifzCrTNKClMv1lTlr7NNzMI7aVMz0uwAJt4e7niOT3VC8VvKtfwh7zEvH4KlpPpX_tez5SdkJHw","e":"AQAB"};
const TABS = {'Franchise Enquiries':19,'Brand Expansion':18,'General Enquiries':16,'Job Applications':21};
const HEADERS = {
  'Franchise Enquiries': ['Reference','Submitted','Name','Email','Phone','City','State','Brand','Investment range','Timeframe','Brochure requested','Source page','UTM source','UTM medium','UTM campaign','Consent','Status','Assignee','Notes'],
  'Brand Expansion': ['Reference','Submitted','Name','Email','Phone','City','State','Business name','Business website','Timeframe','Source page','UTM source','UTM medium','UTM campaign','Consent','Status','Assignee','Notes'],
  'General Enquiries': ['Reference','Submitted','Name','Email','Phone','City','State','Message','Source page','UTM source','UTM medium','UTM campaign','Consent','Status','Assignee','Notes'],
  'Job Applications': ['Reference','Submitted','Name','Email','Phone','City','State','Role','Experience','Notice period','Profile','Application details','Application link','Source page','UTM source','UTM medium','UTM campaign','Consent','Status','Assignee','Notes']
};

// Run this from the Apps Script editor. It creates missing tabs and blank header cells only.
function setupPreviewSpreadsheet() {
  if (SHEET_ID === 'INSERT_TEST_SPREADSHEET_ID') {
    throw new Error('Replace INSERT_TEST_SPREADSHEET_ID with the test spreadsheet id before running setup.');
  }
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error('Open this script from the test spreadsheet with Extensions → Apps Script, then run setup again.');
  }
  if (active.getId() !== SHEET_ID) {
    throw new Error('SHEET_ID must be the id of this bound test spreadsheet. Setup will not open another spreadsheet.');
  }
  const notes = [];
  Object.keys(HEADERS).forEach(function (name) {
    const headers = HEADERS[name];
    if (headers.length !== TABS[name] || headers[0] !== 'Reference') {
      throw new Error('Header contract for ' + name + ' does not match the receiver.');
    }
    let sheet = active.getSheetByName(name);
    if (!sheet) {
      sheet = active.insertSheet(name);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      notes.push(name + ': created with ' + headers.length + ' headers.');
      return;
    }
    const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const conflicts = [];
    const missing = [];
    for (let i = 0; i < headers.length; i++) {
      const value = current[i];
      if (value === '' || value === null) missing.push(i);
      else if (String(value) !== headers[i]) conflicts.push(columnName(i + 1));
    }
    missing.forEach(function (i) { sheet.getRange(1, i + 1).setValue(headers[i]); });
    if (!missing.length && !conflicts.length) notes.push(name + ': already set. Existing rows were left in place.');
    else if (conflicts.length) notes.push(name + ': filled ' + missing.length + ' blank header cell(s). Left different headers in ' + conflicts.join(', ') + '. Existing rows were left in place.');
    else notes.push(name + ': filled ' + missing.length + ' blank header cell(s). Existing rows were left in place.');
  });
  SpreadsheetApp.flush();
  if (String(PUBLIC_KEY.kty).indexOf('INSERT_') === 0 || String(PUBLIC_KEY.n).indexOf('INSERT_') === 0 || String(PUBLIC_KEY.e).indexOf('INSERT_') === 0) {
    notes.push('Replace PUBLIC_KEY kty, n, and e with the preview public JWK before deploying.');
  }
  notes.push('Setup did not deploy the web app. Deploy it manually and copy the /exec URL.');
  const report = notes.join('\n');
  Logger.log(report);
  return report;
}

function columnName(n) {
  let name = '';
  while (n > 0) {
    const index = (n - 1) % 26;
    name = String.fromCharCode(65 + index) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

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
