'use client';
import {useEffect} from 'react';

export function AssetCache(){
 useEffect(()=>{
  if(process.env.NODE_ENV!=='production'||!('serviceWorker' in navigator)||!window.isSecureContext)return;
  const register=()=>{void navigator.serviceWorker.register('/asset-cache-sw.js',{scope:'/',updateViaCache:'none'}).catch(()=>{});};
  // Hydration has already begun. Install during idle time rather than waiting
  // for every image or third-party request to finish; slow assets must not hold
  // up the cache that makes subsequent navigation faster.
  if('requestIdleCallback' in window){
   const idle=window.requestIdleCallback(register,{timeout:2000});
   return()=>window.cancelIdleCallback(idle);
  }
  const timer=setTimeout(register,800);
  return()=>clearTimeout(timer);
 },[]);
 return null;
}
