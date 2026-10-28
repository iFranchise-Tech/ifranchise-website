const KEY='ifranchise-submission-confirmed';
export function recordConfirmation(storage, now=Date.now()) {try{storage.setItem(KEY,String(now))}catch{}}
export function hasRecentConfirmation(storage, now=Date.now()) {try{const time=Number(storage.getItem(KEY));return time>0&&now>=time&&now-time<30*60*1000}catch{return false}}
// Call only after readReceipt has confirmed the server accepted the submission.
export function showConfirmation(win) {try{recordConfirmation(win.sessionStorage)}catch{}win.location.assign('/thank-you')}
