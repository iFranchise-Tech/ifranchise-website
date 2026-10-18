'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {track} from '../lib/measurement.mjs';
export function Measurement(){const path=usePathname();useEffect(()=>{const view=()=>{track(window,'ifranchise_page_view');if(path.startsWith('/franchise/'))track(window,'ifranchise_brand_view',{brand_slug:path.split('/').pop()});};view();window.addEventListener('consent-updated',view);return()=>window.removeEventListener('consent-updated',view);},[path]);return null;}
