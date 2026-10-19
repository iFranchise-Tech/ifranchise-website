export type Theme='light'|'dark';
export const DEFAULT_THEME:Theme='dark';
export const THEME_STORAGE_KEY='ifranchise-appearance-v1';
export const themeBootstrap=`(()=>{let t='dark';try{const saved=localStorage.getItem('ifranchise-appearance-v1');if(saved==='light'||saved==='dark')t=saved;}catch{}document.documentElement.dataset.theme=t;})();`;
