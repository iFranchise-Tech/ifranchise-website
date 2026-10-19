'use client';

import {useEffect, useRef} from 'react';

/* One decorative field extends behind the introduction and its two routes. */
export function HomeBackdrop() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.documentElement.removeAttribute('data-motion');
    try { sessionStorage.removeItem('ifranchise-motion'); } catch {}
    if (!root.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (root.current) root.current.dataset.visible = String(entry.isIntersecting);
    }, {rootMargin:'80px'});
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={root} className="home-backdrop" data-visible="false" aria-hidden="true">
    <div className="home-backdrop-light"/>
    <svg viewBox="0 0 1600 1500" preserveAspectRatio="xMidYMin slice" focusable="false">
      <g transform="translate(710 -230) rotate(24 480 600)">
        <g className="home-space-grid" fill="none">
          {[0,240,480,720,960].map(x=><path key={'x'+x} d={`M ${x} -200 V 1900`}/>)}
          {[0,240,480,720,960,1200,1440,1680].map(y=><path key={'y'+y} d={`M -240 ${y} H 1200`}/>)}
        </g>
        <g className="home-space home-space-one">
          <rect x="245" y="245" width="470" height="470" rx="4"/>
          <path d="M 275 680 V 275 H 680"/>
          <path className="home-space-edge" d="M 715 245 V 715 H 245"/>
        </g>
        <g className="home-space home-space-two">
          <rect x="725" y="485" width="230" height="470" rx="4"/>
          <path d="M 755 920 V 515 H 925"/>
          <path className="home-space-edge" d="M 955 485 V 955 H 725"/>
        </g>
        <g className="home-space home-space-three">
          <rect x="5" y="725" width="470" height="230" rx="4"/>
          <path d="M 35 920 V 755 H 445"/>
          <path className="home-space-edge" d="M 475 725 V 955 H 5"/>
        </g>
        <g className="home-space home-space-four">
          <rect x="485" y="965" width="470" height="470" rx="4"/>
          <path d="M 515 1400 V 995 H 925"/>
          <path className="home-space-edge" d="M 955 965 V 1435 H 485"/>
        </g>
        <g className="home-space-points">
          {[[240,240],[720,480],[480,960],[960,1440],[0,720]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="4" style={{animationDelay:`-${i*3}s`}}/>)}
        </g>
      </g>
    </svg>
    <div className="home-backdrop-shade"/>
  </div>;
}
