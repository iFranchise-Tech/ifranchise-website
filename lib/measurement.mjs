// Public configuration contains IDs only. Provider tokens belong in the CRM.
// The default stays off. Production turns it on from the root layout after the
// request host and environment variables are checked.
export const measurementConfig = Object.freeze({enabled:false,gtmId:'',gaMeasurementId:'',noticeVersion:'website-privacy-2026-11-13'});
const GTM_ID=/^GTM-[A-Z0-9]{4,12}$/;
const GA_ID=/^G-[A-Z0-9]{4,16}$/;
let active=measurementConfig;
export function activateMeasurement(config){
  if(config?.enabled===true&&GTM_ID.test(config.gtmId||'')&&GA_ID.test(config.gaMeasurementId||'')){
    active=Object.freeze({enabled:true,gtmId:config.gtmId,gaMeasurementId:config.gaMeasurementId,noticeVersion:measurementConfig.noticeVersion});
    return active;
  }
  active=measurementConfig;
  return active;
}
function resolve(config){return config??active;}
/** Google Tag Manager is the only Google script. GA4 is a container tag, not a second gtag.js. */
export function productionTracking(env,hostname,dev){
  if(dev||hostname!=='www.ifranchise.in')return null;
  const gtmId=String(env?.GTM_ID||''),gaMeasurementId=String(env?.GA_MEASUREMENT_ID||'');
  if(!GTM_ID.test(gtmId)||!GA_ID.test(gaMeasurementId))return null;
  return {enabled:true,gtmId,gaMeasurementId};
}
/** Inline consent default only. It makes no network request and does not load Tag Manager. */
export function gtmHeadScript(){
  return `(function(){window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});window.__ifrConsentInitialized=true;})();`;
}
export const attributionKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','gbraid','wbraid','fbclid','li_fat_id'];
export const CONSENT_KEY='ifranchise_privacy_v1',CONSENT_TTL=180*24*60*60*1000;
const KEY=CONSENT_KEY,ATTR='ifranchise_attribution_v1';
export function consentExpiresAt(consent){return Number.isFinite(consent?.savedAt)?consent.savedAt+CONSENT_TTL:null;}
function dropConsent(storage){try{storage?.removeItem(KEY);}catch{}}
export function readConsent(storage,now=Date.now()){let raw;try{raw=storage?.getItem(KEY);}catch{return null;}if(!raw)return null;try{const c=JSON.parse(raw),age=now-c?.savedAt;if(c?.version===measurementConfig.noticeVersion&&typeof c.analytics==='boolean'&&typeof c.advertising==='boolean'&&Number.isFinite(c.savedAt)&&age>=0&&age<CONSENT_TTL)return c;}catch{}dropConsent(storage);return null;}
export function writeConsent(storage,choices){const c={version:measurementConfig.noticeVersion,analytics:choices.analytics===true,advertising:choices.advertising===true,savedAt:Date.now()};try{storage.setItem(KEY,JSON.stringify(c));if(!c.advertising)storage.removeItem(ATTR);}catch{}return c;}
export function collectAttribution(url){const query=new URL(url).searchParams;return Object.fromEntries(attributionKeys.flatMap(k=>{const value=query.get(k);return value&&value.length<=512?[[k,value]]:[];}));}
export function saveAttribution(win,consent,config){config=resolve(config);if(!config.enabled||!consent?.advertising){try{win.sessionStorage.removeItem(ATTR);win.localStorage.removeItem(ATTR);}catch{}return;}try{const current=collectAttribution(win.location.href);if(Object.keys(current).length){const old=JSON.parse(win.sessionStorage.getItem(ATTR)||'null');win.sessionStorage.setItem(ATTR,JSON.stringify({first:old?.first||current,last:current}));}}catch{}}
export function getAttribution(win,consent){if(!active.enabled||!consent?.advertising)return {};try{return JSON.parse(win.sessionStorage.getItem(ATTR)||'null')?.last||collectAttribution(win.location.href);}catch{return collectAttribution(win.location.href);}}
function gtag(win,...args){function command(){win.dataLayer.push(arguments);}command(...args);}
function clearTrackingCookies(doc,consent){try{const current=doc?.cookie;if(typeof current!=='string'||!current)return;const host=String(doc.location?.hostname||'');const domains=[host,host.replace(/^www\./,'')].filter((d,i,a)=>d&&a.indexOf(d)===i);for(const name of current.split(';').map(part=>part.split('=')[0].trim()).filter(Boolean)){const analytics=/^_ga(?:_|$)/.test(name)||name==='_gid'||name.startsWith('_gat')||name==='_clck'||name==='_clsk';const advertising=name.startsWith('_gcl_')||name==='_fbp'||name==='_fbc';if((consent?.analytics!==true&&analytics)||(consent?.advertising!==true&&advertising)){const base=`${name}=; Max-Age=0; Path=/; SameSite=Lax`;doc.cookie=base;for(const domain of domains)doc.cookie=`${base}; Domain=${domain}`;}}}catch{}}
const state=c=>({analytics_storage:c.analytics?'granted':'denied',ad_storage:c.advertising?'granted':'denied',ad_user_data:c.advertising?'granted':'denied',ad_personalization:c.advertising?'granted':'denied',functionality_storage:'granted',security_storage:'granted'});
export function applyConsent(win,consent,config){config=resolve(config);win.dataLayer=win.dataLayer||[];if(!win.__ifrConsentInitialized){gtag(win,'consent','default',state({}));win.__ifrConsentInitialized=true;}gtag(win,'consent','update',state(config.enabled?consent||{}:{}));clearTrackingCookies(win.document,consent);saveAttribution(win,consent,config);if(!config.enabled||!GTM_ID.test(config.gtmId)||consent?.analytics!==true||win.__ifrGtmLoaded)return;win.__ifrGtmLoaded=true;if(GA_ID.test(config.gaMeasurementId||''))win.dataLayer.push({ga_measurement_id:config.gaMeasurementId});win.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});const script=win.document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(config.gtmId);win.document.head.appendChild(script);}
export function track(win,name,details={},config){config=resolve(config);
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
export function trackReceipt(win,receipt,formId){const c=readConsent(win.localStorage);if(receipt.received!==true||receipt.advertising_event_allowed!==true||!c?.advertising||!active.enabled||typeof receipt.event_id!=='string')return false;win.__ifrEvents=win.__ifrEvents||new Set();if(win.__ifrEvents.has(receipt.event_id))return false;win.__ifrEvents.add(receipt.event_id);win.dataLayer=win.dataLayer||[];win.dataLayer.push({event:'ifranchise_enquiry_received',event_id:receipt.event_id,form_id:formId});return true;}
