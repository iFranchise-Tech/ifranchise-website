'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
export function Motion(){const path=usePathname();useEffect(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;const elements=document.querySelectorAll<HTMLElement>('[data-reveal]');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){(entry.target as HTMLElement).dataset.revealed='true';observer.unobserve(entry.target);}}),{threshold:.08});elements.forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.dataset.revealed='false';observer.observe(el);}});return()=>{observer.disconnect();elements.forEach(el=>delete el.dataset.revealed);};},[path]);return null;}
