// iFranchise website intake. This receiver writes only to the configured workbook.
const SHEET_ID = '1CtjZy19aXx-o39u3QqZMKxCPaRhyRBPM9Ebmp9ZiWqU';
const PUBLIC_KEY = {"kty":"RSA","n":"255DgHN2TA1iBbK9nke4OuJQI9tqam8oldOZyEEbWmt1YFKK82fIZZbmoDG1eU2rjAODbajxqa-IN92-17gP1HHOq6H7apGNayL2vUbhFJZ2iMPOKz24QmioxQz_0AYHv8yMiNjeJH5aZqpNs1RQ96VWhdcH5u-T-XGrAv99XKb5XbvtB4cP15yLOSFx1-sghLxofzULXHJladksYY3JU6CCphspDymRf_NjIVqnRUoMOtaAyMVeknNiOfEQgAoAZS7YEsbOo4EifzCrTNKClMv1lTlr7NNzMI7aVMz0uwAJt4e7niOT3VC8VvKtfwh7zEvH4KlpPpX_tez5SdkJHw","e":"AQAB"};
const TABS = {'Franchise Enquiries':19,'Brand Expansion':18,'General Enquiries':16,'Job Applications':21};
function doGet(){ return json({service:'iFranchise website enquiries',ready:true,resumeProtocol:2}); }
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

// No tabs, headers, columns, existing rows or sharing permissions are changed.
// Set Script Property RESUME_FOLDER_ID to an owner-only folder directly under
// the deployment owner's My Drive. The deployment must execute as that owner.
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const MAX_ENVELOPE_CHARS = Math.ceil(MAX_RESUME_BYTES / 3) * 4 + 100000;

function reject(code) { throw new Error(code); }
function safeCell(value) {
  const s = String(value == null ? '' : value).slice(0, 6000);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}
function digestBytes(bytes) {
  return hex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes));
}
function onlyOwner(item, owner) {
  const actualOwner = item.getOwner();
  if (item.isTrashed() || !actualOwner || actualOwner.getEmail().toLowerCase() !== owner ||
      item.getSharingAccess() !== DriveApp.Access.PRIVATE ||
      item.getEditors().some(user => user.getEmail().toLowerCase() !== owner) ||
      item.getViewers().some(user => user.getEmail().toLowerCase() !== owner)) {
    reject('private_storage_required');
  }
}
function soleParent(item, expectedId) {
  const parents = item.getParents();
  if (!parents.hasNext() || parents.next().getId() !== expectedId || parents.hasNext()) {
    reject('private_storage_required');
  }
}
function privateResumeFolder() {
  const id = PropertiesService.getScriptProperties().getProperty('RESUME_FOLDER_ID');
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) reject('resume_not_configured');
  const owner = Session.getEffectiveUser().getEmail().toLowerCase();
  if (!owner) reject('private_storage_required');
  const folder = DriveApp.getFolderById(id);
  // A root-level, owner-only folder avoids inherited access from shared parents.
  onlyOwner(folder, owner);
  soleParent(folder, DriveApp.getRootFolder().getId());
  return {folder, owner};
}
function resumeBytes(meta, encoded) {
  if (!meta || typeof meta.name !== 'string' || !/^[a-zA-Z0-9 _.-]{1,104}\.pdf$/i.test(meta.name) ||
      !Number.isInteger(meta.size) || meta.size <= 0 || meta.size > MAX_RESUME_BYTES ||
      !/^[a-f0-9]{64}$/.test(meta.sha256) || typeof encoded !== 'string' ||
      encoded.length !== Math.ceil(meta.size / 3) * 4) reject('invalid_resume');
  const bytes = Utilities.base64Decode(encoded);
  if (bytes.length !== meta.size || digestBytes(bytes) !== meta.sha256) reject('invalid_resume');
  const ascii = part => part.map(b => String.fromCharCode(b & 255)).join('');
  if (!/^%PDF-[12]\.\d[\r\n]/.test(ascii(bytes.slice(0, 12))) ||
      !/%%EOF[\t\n\r ]*$/.test(ascii(bytes.slice(-1024)))) reject('invalid_resume');
  return bytes;
}
function applicationFileName(data, row) {
  const identity = row.slice();
  identity[1] = ''; // Received timestamp changes on a network retry.
  identity[12] = ''; // Populated by this receiver, never by the visitor.
  const binding = hex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    JSON.stringify({row:identity, resume:data.resume}), Utilities.Charset.UTF_8));
  // Atomic filename metadata binds the reference, applicant fields and PDF.
  // No second metadata write is needed after Drive creates the file.
  return row[0] + '-' + binding + '.pdf';
}
function fileReceipt(file, storage, name, meta, checkContent) {
  onlyOwner(file, storage.owner);
  soleParent(file, storage.folder.getId());
  if (file.getName() !== name || file.getMimeType() !== 'application/pdf' || file.getSize() !== meta.size ||
      (checkContent && digestBytes(file.getBlob().getBytes()) !== meta.sha256)) reject('resume_conflict');
  return {saved:true, private:true, sha256:meta.sha256, size:meta.size,
    url:'https://drive.google.com/file/d/' + file.getId() + '/view'};
}
function saveResume(data, row, bytes, existingRow) {
  const storage = privateResumeFolder();
  const name = applicationFileName(data, row);
  if (existingRow) {
    const url = String(existingRow[12] || '');
    const match = /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view$/.exec(url);
    if (!match) reject('resume_conflict'); // Never overwrite historical rows.
    return fileReceipt(DriveApp.getFileById(match[1]), storage, name, data.resume, true);
  }
  // Reuse a private file after a failed/ambiguous spreadsheet write. The lock
  // serializes concurrent submissions, including uploads with the same reference.
  const files = storage.folder.searchFiles("trashed = false and title contains '" + row[0] + "-'");
  if (files.hasNext()) {
    const file = files.next();
    if (files.hasNext()) reject('resume_conflict');
    return fileReceipt(file, storage, name, data.resume, true);
  }
  const file = storage.folder.createFile(Utilities.newBlob(bytes, 'application/pdf', name));
  // Do not append a row unless Drive confirms the private file exists.
  return fileReceipt(file, storage, name, data.resume, false);
}
function doPost(e) {
  let lock, locked = false;
  try {
    if (!e || !e.postData || typeof e.postData.contents !== 'string' || e.postData.contents.length > MAX_ENVELOPE_CHARS) return json({ok:false});
    const envelope = JSON.parse(e.postData.contents);
    if (typeof envelope.body !== 'string' || envelope.body.length > 40000 ||
        typeof envelope.signature !== 'string' || envelope.signature.length > 512 ||
        !verified(envelope.body, envelope.signature)) return json({ok:false});
    const signed = JSON.parse(envelope.body);
    if (!signed || typeof signed.timestamp !== 'number' || !Number.isFinite(signed.timestamp) ||
        Math.abs(Date.now() - signed.timestamp) > 300000) return json({ok:false});
    const isApplication = signed.version === 2;
    const data = isApplication ? signed.application : signed;
    if (!data || !Object.prototype.hasOwnProperty.call(TABS, data.tab) ||
        !Array.isArray(data.row) || data.row.length !== TABS[data.tab] ||
        typeof data.row[0] !== 'string' || !/^IF-[a-f0-9-]{36}$/.test(data.row[0]) ||
        data.row.some(v => v !== null && !['string','number','boolean'].includes(typeof v))) return json({ok:false});
    if (isApplication !== (data.tab === 'Job Applications') ||
        (!isApplication && (data.resume !== undefined || envelope.resume !== undefined))) return json({ok:false});
    if (isApplication && data.row[12] !== '') return json({ok:false});
    const bytes = isApplication ? resumeBytes(data.resume, envelope.resume) : null;
    const row = data.row.map(safeCell);
    lock = LockService.getScriptLock();
    lock.waitLock(20000);
    locked = true;
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(data.tab);
    if (!sheet || sheet.getRange(1, 1).getValue() !== 'Reference') return json({ok:false});
    const last = sheet.getLastRow();
    const found = last > 1 ? sheet.getRange(2, 1, last - 1, 1).createTextFinder(row[0]).matchEntireCell(true).findNext() : null;
    if (found && !isApplication) return json({ok:true, reference:row[0], duplicate:true});
    const existing = found ? sheet.getRange(found.getRow(), 1, 1, TABS[data.tab]).getValues()[0] : null;
    const resume = isApplication ? saveResume(data, row, bytes, existing) : null;
    if (found) return json({ok:true, reference:row[0], duplicate:true, resume});
    if (resume) row[12] = resume.url;
    const range = sheet.getRange(last + 1, 1, 1, row.length);
    range.setNumberFormat('@');
    range.setValues([row]);
    SpreadsheetApp.flush();
    return json({ok:true, reference:row[0], ...(resume ? {resume} : {})});
  } catch (_) {
    // Never return raw Google errors, identities, filenames or credentials.
    // A saved file is retained privately on failure so an identical retry can
    // recover it, including when the spreadsheet write succeeded but timed out.
    return json({ok:false});
  } finally {
    if (locked) lock.releaseLock();
  }
}
