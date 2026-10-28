const KEY='ifranchise-submission-confirmed',RETURN_KEY='ifranchise-submission-return';
export function recordConfirmation(storage, now=Date.now()) {try{storage.setItem(KEY,String(now))}catch{}}
export function hasRecentConfirmation(storage, now=Date.now()) {try{const time=Number(storage.getItem(KEY));return time>0&&now>=time&&now-time<30*60*1000}catch{return false}}
export function safeReturnPath(path) {return typeof path==='string'&&/^\/(?!\/)/.test(path)&&!/[\\\u0000-\u0020]/.test(path)&&!/^\/(?:thank-you|api|admin)(?:[/?#]|$)/.test(path)?path:null}
export function confirmationReturn(storage) {try{if(!hasRecentConfirmation(storage))return null;const target=JSON.parse(storage.getItem(RETURN_KEY));return safeReturnPath(target.path)&&Number.isFinite(target.y)?{path:target.path,y:Math.max(0,target.y)}:null}catch{return null}}
// Call only after the server has acknowledged acceptance. Never persist form answers.
export function showConfirmation(win, navigate) {
 try{recordConfirmation(win.sessionStorage);const path=safeReturnPath((win.location.pathname||'/')+(win.location.hash||''));if(path)win.sessionStorage.setItem(RETURN_KEY,JSON.stringify({path,y:Math.max(0,win.scrollY||0)}))}catch{}
 if(navigate)navigate('/thank-you');else win.location.assign('/thank-you');
}
