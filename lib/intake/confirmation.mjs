const KEY='ifranchise-submission-confirmed',RETURN_KEY='ifranchise-submission-return';
const kinds=new Set(['investor','brand','general','job','privacy']);
let memory=null;
export function recordConfirmation(storage, now=Date.now()) {try{storage.setItem(KEY,String(now))}catch{}}
export function hasRecentConfirmation(storage, now=Date.now()) {try{const time=Number(storage.getItem(KEY));return time>0&&now>=time&&now-time<30*60*1000}catch{return false}}
export function safeReturnPath(path) {
 if(typeof path!=='string'||!/^\/(?!\/)/.test(path)||/[\\\u0000-\u0020]/.test(path))return null;
 try{
  const url=new URL(path,'https://return.invalid');
  const decoded=decodeURIComponent(url.pathname);
  if(url.origin!=='https://return.invalid'||/[\\\u0000-\u0020]/.test(decoded)||decoded.includes('%')||decoded.startsWith('//'))return null;
  const normalized=new URL(decoded,url.origin).pathname;
  if(/^\/(?:thank-you|api|admin|cms|cdn-cgi)(?:\/|$)/i.test(normalized)||/\/thank-you\/?$/.test(normalized))return null;
  // Retain navigation context, never form answers or credentials in storage/URLs.
  for(const key of [...url.searchParams.keys()])if(/email|phone|name|message|token|secret|password|resume|address/i.test(key))url.searchParams.delete(key);
  return url.pathname+url.search+url.hash;
 }catch{return null}
}
export function captureConfirmationOrigin(win,kind='general') {
 return {path:safeReturnPath((win.location.pathname||'/')+(win.location.search||'')+(win.location.hash||''))||'/franchise-opportunities',y:Math.max(0,win.scrollY||0),kind:kinds.has(kind)?kind:'general'};
}
export function confirmationReturn(storage) {
 try{if(!hasRecentConfirmation(storage))return null;const target=JSON.parse(storage.getItem(RETURN_KEY));const path=safeReturnPath(target.path);return path&&Number.isFinite(target.y)?{path,y:Math.max(0,target.y),...(kinds.has(target.kind)?{kind:target.kind}:{})}:null}catch{return null}
}
export function confirmationContext(storage) {
 const stored=confirmationReturn(storage);
 return stored||(memory&&Date.now()-memory.at<30*60*1000?memory.target:null);
}
// Invoke only after readReceipt confirms durable acceptance, using the pre-request origin.
export function showConfirmation(win,navigate,target=captureConfirmationOrigin(win)) {
 memory={target,at:Date.now()};
 try{recordConfirmation(win.sessionStorage);win.sessionStorage.setItem(RETURN_KEY,JSON.stringify(target))}catch{}
 if(navigate)navigate('/thank-you');else win.location.assign('/thank-you');
}
