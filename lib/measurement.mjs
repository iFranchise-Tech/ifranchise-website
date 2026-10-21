// Public configuration contains IDs only. Provider tokens belong in the CRM.
// Re-notice visitors with a new noticeVersion before activating any optional provider.
export const measurementConfig = Object.freeze({enabled:false,gtmId:'',noticeVersion:'website-privacy-2026-10-19'});
export const attributionKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','gbraid','wbraid','fbclid','li_fat_id'];
const KEY='ifranchise_privacy_v1',ATTR='ifranchise_attribution_v1';
export function readConsent(storage){try{const c=JSON.parse(storage?.getItem(KEY)||'null'),age=Date.now()-c?.savedAt;return c?.version===measurementConfig.noticeVersion&&typeof c.analytics==='boolean'&&typeof c.advertising==='boolean'&&Number.isFinite(c.savedAt)&&age>=0&&age<15552000000?c:null;}catch{return null;}}
export function writeConsent(storage,choices){const c={version:measurementConfig.noticeVersion,analytics:choices.analytics===true,advertising:choices.advertising===true,savedAt:Date.now()};try{storage.setItem(KEY,JSON.stringify(c));if(!c.advertising)storage.removeItem(ATTR);}catch{}return c;}
export function collectAttribution(url){const query=new URL(url).searchParams;return Object.fromEntries(attributionKeys.flatMap(k=>{const value=query.get(k);return value&&value.length<=512?[[k,value]]:[];}));}
export function saveAttribution(win,consent,config=measurementConfig){if(!config.enabled||!consent?.advertising){try{win.sessionStorage.removeItem(ATTR);win.localStorage.removeItem(ATTR);}catch{}return;}try{const current=collectAttribution(win.location.href);if(Object.keys(current).length){const old=JSON.parse(win.sessionStorage.getItem(ATTR)||'null');win.sessionStorage.setItem(ATTR,JSON.stringify({first:old?.first||current,last:current}));}}catch{}}
export function getAttribution(win,consent){if(!measurementConfig.enabled||!consent?.advertising)return {};try{return JSON.parse(win.sessionStorage.getItem(ATTR)||'null')?.last||collectAttribution(win.location.href);}catch{return collectAttribution(win.location.href);}}
function gtag(win,...args){function command(){win.dataLayer.push(arguments);}command(...args);}
const state=c=>({analytics_storage:c.analytics?'granted':'denied',ad_storage:c.advertising?'granted':'denied',ad_user_data:c.advertising?'granted':'denied',ad_personalization:c.advertising?'granted':'denied'});
export function applyConsent(win,consent,config=measurementConfig){win.dataLayer=win.dataLayer||[];if(!win.__ifrConsentInitialized){gtag(win,'consent','default',state({}));win.__ifrConsentInitialized=true;}gtag(win,'consent','update',state(config.enabled?consent||{}:{}));saveAttribution(win,consent,config);if(!config.enabled||!/^GTM-[A-Z0-9]{4,12}$/.test(config.gtmId)||!(consent?.analytics||consent?.advertising)||win.__ifrGtmLoaded)return;win.__ifrGtmLoaded=true;win.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});const script=win.document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtm.js?id='+config.gtmId;win.document.head.appendChild(script);}
export function track(win,name,details={},config=measurementConfig){
 let c;try{c=readConsent(win.localStorage);}catch{return;}
 if(!c?.analytics||!config.enabled)return;
 const safe={};
 for(const key of ['journey','brand_slug','form_id','event_id'])if(typeof details[key]==='string')safe[key]=details[key].slice(0,100);
 if(typeof details.content_id==='string'&&/^[a-z0-9-]{1,150}$/.test(details.content_id))safe.content_id=details.content_id;
 if(['article','blog','video'].includes(details.content_type))safe.content_type=details.content_type;
 if(typeof details.content_path==='string'&&/^\/(?:blogs|resources\/(?:blogs|videos))\/[a-z0-9-]+$/.test(details.content_path))safe.content_path=details.content_path;
 if(['whatsapp','linkedin','facebook','x','telegram','reddit','pinterest','email','instagram','copy_link','native'].includes(details.channel))safe.channel=details.channel;
 if(['save','remove','open','copy','handoff'].includes(details.action))safe.action=details.action;
 if(Number.isFinite(details.progress_percent))safe.progress_percent=Math.max(0,Math.min(100,Math.round(details.progress_percent)));
 win.dataLayer=win.dataLayer||[];win.dataLayer.push({event:name,...safe});
}
export function trackReceipt(win,receipt,formId){const c=readConsent(win.localStorage);if(receipt.received!==true||receipt.advertising_event_allowed!==true||!c?.advertising||!measurementConfig.enabled||typeof receipt.event_id!=='string')return false;win.__ifrEvents=win.__ifrEvents||new Set();if(win.__ifrEvents.has(receipt.event_id))return false;win.__ifrEvents.add(receipt.event_id);win.dataLayer=win.dataLayer||[];win.dataLayer.push({event:'ifranchise_enquiry_received',event_id:receipt.event_id,form_id:formId});return true;}
