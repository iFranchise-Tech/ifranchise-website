'use client';
import {createContext,useContext} from 'react';
import {socialLinks as defaults} from '../lib/contact';
const defaultsValue={email:'contact@ifranchise.in',phone:'+919129130303',phoneCountry:'IN',socialLinks:defaults.map(s=>({...s,visible:true}))};
const Settings=createContext<any>(defaultsValue);
export function SiteSettingsProvider({value,children}:{value:any;children:React.ReactNode}){return <Settings.Provider value={{...defaultsValue,...value,socialLinks:value?.socialLinks??defaultsValue.socialLinks}}>{children}</Settings.Provider>}
export function useSiteSettings(){return useContext(Settings)}
export function phoneLabel(phone:string){return phone==='+919129130303'?'+91 91291 30303':phone;}
