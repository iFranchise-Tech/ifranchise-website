'use client';
import {useEffect} from 'react';

export function AssetCache(){
 useEffect(()=>{
  if(process.env.NODE_ENV!=='production'||!('serviceWorker' in navigator)||!window.isSecureContext)return;
  const register=()=>{void navigator.serviceWorker.register('/asset-cache-sw.js',{scope:'/',updateViaCache:'none'}).catch(()=>{});};
  if(document.readyState==='complete')register();
  else window.addEventListener('load',register,{once:true});
  return()=>window.removeEventListener('load',register);
 },[]);
 return null;
}
