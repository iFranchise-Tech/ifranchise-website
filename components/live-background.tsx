'use client';

import {useEffect, useId, useRef} from 'react';
import {MotionControl} from './experience';

type BackgroundKind = 'support' | 'about' | 'expansion' | 'careers';

/* Decorative, continuous fields of colour. Nothing in this layer captures input. */
export function LiveBackground({kind}: {kind: BackgroundKind}) {
  const root = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, '');
  useEffect(() => {
    const element = root.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.visible = String(entry.isIntersecting);
    }, {rootMargin: '40px'});
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const curve = (n: number) => {
    if (kind === 'expansion') return `M ${700+n*25} -180 C ${430+n*20} 160, ${1390+n*19} 130, ${1070+n*21} 510 S ${920+n*24} 920, ${1740+n*29} 1040`;
    if (kind === 'careers') return `M ${560+n*29} -160 C ${1430+n*17} 70, ${490+n*25} 460, ${1040+n*20} 680 S ${1680+n*22} 820, ${1820+n*25} 1080`;
    if (kind === 'support') return `M -240 ${760+n*17} C 280 ${210+n*19}, 850 ${940+n*14}, 1040 ${330+n*13} S 1430 ${-290+n*19}, 1800 ${-80+n*20}`;
    return `M ${550+n*28} -180 C ${1650+n*20} 170, ${390+n*18} 410, ${1080+n*24} 710 S ${1530+n*26} 960, ${1810+n*28} 1080`;
  };

  return <>
    <div ref={root} className={`live-background live-${kind}`} aria-hidden="true" data-visible="false">
      <div className="live-glow live-glow-one"/>
      <div className="live-glow live-glow-two"/>
      <svg className="live-contours" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <linearGradient id={`${id}-ribbon`} x1="0" y1="0" x2="1" y2=".8">
            <stop stopColor="var(--live-shine)" stopOpacity="0"/>
            <stop offset=".34" stopColor="var(--live-shine)" stopOpacity=".22"/>
            <stop offset=".57" stopColor="var(--live-accent)" stopOpacity=".26"/>
            <stop offset=".81" stopColor="var(--live-shine)" stopOpacity=".13"/>
            <stop offset="1" stopColor="var(--live-accent)" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id={`${id}-line`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--live-line)" stopOpacity="0"/>
            <stop offset=".32" stopColor="var(--live-line)" stopOpacity=".28"/>
            <stop offset=".65" stopColor="var(--live-line)" stopOpacity=".48"/>
            <stop offset="1" stopColor="var(--live-line)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <g className="live-ribbon-group" fill="none" strokeLinecap="round">
          <path d={curve(4)} stroke={`url(#${id}-ribbon)`} strokeWidth="180"/>
          <path d={curve(10)} stroke={`url(#${id}-ribbon)`} strokeWidth="110"/>
          {Array.from({length: 16}, (_, n) => <path key={n} d={curve(n)} stroke={`url(#${id}-line)`} strokeWidth={n%5===0 ? 1.5 : .75}/>)}
        </g>
        <g className="live-signal-group" fill="none" stroke="var(--live-line)" strokeWidth="2" strokeLinecap="round">
          {[2,7,12].map((n,i) => <path key={n} className="live-signal" d={curve(n)} pathLength="1000" strokeDasharray="42 958" style={{animationDelay:`-${i*9}s`}}/>)}
        </g>
      </svg>
      <div className="live-reading-shade"/>
    </div>
    <div className="live-motion-control"><MotionControl/></div>
  </>;
}
