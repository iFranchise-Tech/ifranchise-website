'use client';

import {useId} from 'react';

type Variant = 'investor' | 'expansion' | 'model';
type Tone = 'stone' | 'violet' | 'glass';

/* Original, code-drawn editorial sculptures. No third-party artwork. */
function Materials({id}:{id:string}) {
  return <defs>
    <linearGradient id={`${id}-stone-top`} x1="0" y1="0" x2=".85" y2="1" gradientUnits="objectBoundingBox"><stop stopColor="#fff"/><stop offset=".46" stopColor="#eeebf1"/><stop offset="1" stopColor="#b8acc7"/></linearGradient>
    <linearGradient id={`${id}-stone-left`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e0d9e7"/><stop offset="1" stopColor="#9c8eae"/></linearGradient>
    <linearGradient id={`${id}-stone-right`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a79ab9"/><stop offset="1" stopColor="#645473"/></linearGradient>
    <linearGradient id={`${id}-violet-top`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c7afea"/><stop offset=".45" stopColor="#9670cb"/><stop offset="1" stopColor="#5932a3"/></linearGradient>
    <linearGradient id={`${id}-violet-left`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a284c8"/><stop offset="1" stopColor="#5932a3"/></linearGradient>
    <linearGradient id={`${id}-violet-right`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6d40b4"/><stop offset="1" stopColor="#29134c"/></linearGradient>
    <linearGradient id={`${id}-glass-top`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".95"/><stop offset=".4" stopColor="#e0cafa" stopOpacity=".78"/><stop offset=".83" stopColor="#aa80dc" stopOpacity=".78"/><stop offset="1" stopColor="#f4e9ff" stopOpacity=".9"/></linearGradient>
    <linearGradient id={`${id}-glass-left`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e3d1f6" stopOpacity=".93"/><stop offset="1" stopColor="#9571bd" stopOpacity=".6"/></linearGradient>
    <linearGradient id={`${id}-glass-right`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c6a6e8" stopOpacity=".85"/><stop offset="1" stopColor="#77549f" stopOpacity=".66"/></linearGradient>
    <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2=".7"><stop stopColor="#a99ab9"/><stop offset=".16" stopColor="#f8f6fa"/><stop offset=".4" stopColor="#e6ddec"/><stop offset=".58" stopColor="#a796bc"/><stop offset=".79" stopColor="#faf8fc"/><stop offset="1" stopColor="#a994be"/></linearGradient>
    <linearGradient id={`${id}-portal`} x1=".18" y1="0" x2=".92" y2="1"><stop stopColor="#f0e6ff"/><stop offset=".24" stopColor="#ba98e3"/><stop offset=".57" stopColor="#7751ab"/><stop offset=".8" stopColor="#b18bda"/><stop offset="1" stopColor="#573080"/></linearGradient>
    <linearGradient id={`${id}-rail`} x1="0" y1="1" x2="1" y2="0"><stop stopColor="#fff" stopOpacity=".1"/><stop offset=".45" stopColor="#eee4fa" stopOpacity=".85"/><stop offset="1" stopColor="#b799de"/></linearGradient>
    <radialGradient id={`${id}-pearl`} cx=".29" cy=".24" r=".8"><stop stopColor="#fff"/><stop offset=".27" stopColor="#f1edf5"/><stop offset=".55" stopColor="#d4c7e3"/><stop offset=".78" stopColor="#9b87b2"/><stop offset="1" stopColor="#766487"/></radialGradient>
    <radialGradient id={`${id}-orb`} cx=".28" cy=".23" r=".8"><stop stopColor="#f9edff"/><stop offset=".25" stopColor="#c6a2ed"/><stop offset=".55" stopColor="#9060c9"/><stop offset=".81" stopColor="#5932a3"/><stop offset="1" stopColor="#2f1753"/></radialGradient>
    <radialGradient id={`${id}-floor`}><stop stopColor="#9b79be" stopOpacity=".23"/><stop offset="1" stopColor="#9b79be" stopOpacity="0"/></radialGradient>
    <filter id={`${id}-shadow`} x="-70%" y="-140%" width="240%" height="380%"><feGaussianBlur stdDeviation="13"/></filter>
    <filter id={`${id}-small-shadow`} x="-70%" y="-100%" width="240%" height="300%"><feGaussianBlur stdDeviation="5"/></filter>
    <clipPath id={`${id}-portal-opening`}><path d="M350 170 350 281 443 335 443 224Z"/></clipPath>
  </defs>;
}

function Block({id,x,y,width,depth,height,tone='stone',className}:{id:string;x:number;y:number;width:number;depth:number;height:number;tone?:Tone;className?:string}) {
  const a=[x,y],b=[x+width*.866,y+width*.5],c=[x+(width-depth)*.866,y+(width+depth)*.5],d=[x-depth*.866,y+depth*.5];
  const point=(p:number[])=>p.join(',');
  const bottom=(p:number[])=>[p[0],p[1]+height];
  return <g className={className}>
    <polygon points={[d,c,bottom(c),bottom(d)].map(point).join(' ')} fill={`url(#${id}-${tone}-left)`}/>
    <polygon points={[b,c,bottom(c),bottom(b)].map(point).join(' ')} fill={`url(#${id}-${tone}-right)`}/>
    <polygon points={[a,b,c,d].map(point).join(' ')} fill={`url(#${id}-${tone}-top)`}/>
    <path d={`M${point(d)} L${point(a)} L${point(b)}`} fill="none" stroke="#fff" strokeOpacity=".65" strokeWidth="1"/>
    <path d={`M${point(d)} L${point(c)} L${point(b)}`} fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth=".8"/>
  </g>;
}

function Orb({id,x,y,r=20,purple=false,className}:{id:string;x:number;y:number;r?:number;purple?:boolean;className?:string}) {
  return <g className={className}>
    <ellipse cx={x+4} cy={y+r+4} rx={r*.91} ry={r*.3} fill="#29134c" opacity=".2" filter={`url(#${id}-small-shadow)`}/>
    <circle cx={x} cy={y} r={r} fill={`url(#${id}-${purple?'orb':'pearl'})`}/>
    <path d={`M${x-r*.61} ${y-r*.42} Q${x-r*.42} ${y-r*.78} ${x-r*.03} ${y-r*.78}`} stroke="#fff" strokeWidth="1" opacity=".5" fill="none" strokeLinecap="round"/>
  </g>;
}

function Investor({id}:{id:string}) {
  return <>
    <ellipse cx="355" cy="452" rx="263" ry="84" fill={`url(#${id}-floor)`}/>
    <ellipse cx="360" cy="448" rx="170" ry="35" fill="#29134c" opacity=".19" filter={`url(#${id}-shadow)`}/>
    <g className="fv-assembly fv-investor-assembly">
      <Block id={id} x={356} y={312} width={217} depth={196} height={27}/>
      <Block id={id} x={356} y={303} width={217} depth={196} height={9} tone="glass"/>
      <path d="M109 424 C179 465 221 460 269 430 L353 382" fill="none" stroke="#89799f" strokeWidth="27"/>
      <path d="M109 418 C179 459 221 454 269 424 L353 376" fill="none" stroke={`url(#${id}-metal)`} strokeWidth="26"/>
      <path d="M76 328 C150 371 156 394 214 394 C258 394 294 362 335 341" fill="none" stroke="#8b7c9c" strokeWidth="27"/>
      <path d="M76 322 C150 365 156 388 214 388 C258 388 294 356 335 335" fill="none" stroke={`url(#${id}-metal)`} strokeWidth="26"/>
      <path d="M167 252 C195 268 194 294 239 318 L314 361" fill="none" stroke="#8d7d9f" strokeWidth="27"/>
      <path d="M167 246 C195 262 194 288 239 312 L314 355" fill="none" stroke={`url(#${id}-metal)`} strokeWidth="26"/>
      <path className="fv-path-sheen" d="M76 322 C150 365 156 388 214 388 C258 388 294 356 335 335" fill="none" stroke="#fff" strokeWidth="1.1" strokeDasharray="75 450" opacity=".8"/>
      <path d="M315 105 478 199 531 168 368 74Z" fill={`url(#${id}-glass-top)`}/>
      <path d="M478 199 531 168 531 371 478 402Z" fill={`url(#${id}-violet-right)`}/>
      <g clipPath={`url(#${id}-portal-opening)`}>
        <path d="M350 170 405 138 443 160 443 335 350 281Z" fill={`url(#${id}-violet-right)`}/>
        <path d="M350 281 405 249 443 271 443 335Z" fill={`url(#${id}-metal)`}/>
      </g>
      <path d="M315 105 478 199 478 402 315 308Z M350 170 350 281 443 335 443 224Z" fill={`url(#${id}-portal)`} fillRule="evenodd"/>
      <path d="M315 105 478 199 531 168M315 105 368 74 531 168M478 199V402" fill="none" stroke="#f4eaff" strokeWidth="1.2" opacity=".75"/>
      <path d="M350 170V281L443 335M350 170 443 224V335" fill="none" stroke="#eee2ff" strokeWidth=".9" opacity=".7"/>
      <path d="M330 118 330 298 464 375" fill="none" stroke="#ead9ff" strokeWidth=".8" opacity=".35"/>
      <Orb id={id} x={172} y={362} r={23} className="fv-orb fv-orb-one"/>
      <Orb id={id} x={251} y={413} r={19} purple className="fv-orb fv-orb-two"/>
      <Orb id={id} x={212} y={276} r={16} className="fv-orb fv-orb-three"/>
      <Orb id={id} x={389} y={270} r={28} purple className="fv-orb fv-orb-four"/>
    </g>
  </>;
}

function Expansion({id}:{id:string}) {
  return <>
    <ellipse cx="340" cy="421" rx="280" ry="108" fill={`url(#${id}-floor)`}/>
    <ellipse cx="354" cy="435" rx="212" ry="31" fill="#29134c" opacity=".17" filter={`url(#${id}-shadow)`}/>
    <g className="fv-assembly fv-expansion-assembly">
      <path d="M338 307 338 215 460 145M338 307 185 220M338 307 498 397" fill="none" stroke="#604477" strokeWidth="20" strokeLinejoin="round"/>
      <path d="M338 300 338 208 460 138M338 300 185 213M338 300 498 390" fill="none" stroke={`url(#${id}-metal)`} strokeWidth="20" strokeLinejoin="round"/>
      <path className="fv-path-sheen" d="M185 213 338 300 498 390M338 300V208L460 138" fill="none" stroke="#fff" strokeWidth="1.3" strokeDasharray="48 450"/>
      <Block id={id} x={184} y={129} width={112} depth={112} height={27}/>
      <Block id={id} x={184} y={111} width={112} depth={112} height={14} tone="glass"/>
      <Block id={id} x={459} y={70} width={111} depth={111} height={27}/>
      <Block id={id} x={459} y={52} width={111} depth={111} height={14} tone="glass"/>
      <Block id={id} x={497} y={308} width={111} depth={111} height={27}/>
      <Block id={id} x={497} y={290} width={111} depth={111} height={14} tone="glass"/>
      <Block id={id} x={337} y={253} width={150} depth={150} height={30}/>
      <Block id={id} x={337} y={226} width={150} depth={150} height={20} tone="violet"/>
      <Block id={id} x={337} y={202} width={150} depth={150} height={17} tone="glass"/>
      <path d="M286 261 337 232 388 261 337 291Z" fill="none" stroke="#fdfaff" strokeWidth="1.4" opacity=".85"/>
      <path d="M299 261 337 239 375 261 337 283Z" fill={`url(#${id}-violet-top)`} opacity=".56"/>
      <Orb id={id} x={184} y={139} r={30} className="fv-orb fv-orb-one"/>
      <Orb id={id} x={459} y={80} r={30} purple className="fv-orb fv-orb-two"/>
      <Orb id={id} x={497} y={318} r={30} className="fv-orb fv-orb-three"/>
      <Orb id={id} x={337} y={222} r={24} purple className="fv-orb fv-orb-four"/>
      <path d="M135 188 184 216 232 188M410 129 459 157 507 129M448 367 497 395 545 367" fill="none" stroke="#fff" strokeWidth=".8" opacity=".6"/>
    </g>
  </>;
}

function Model({id}:{id:string}) {
  return <>
    <ellipse cx="350" cy="442" rx="248" ry="84" fill={`url(#${id}-floor)`}/>
    <ellipse cx="350" cy="440" rx="160" ry="32" fill="#29134c" opacity=".18" filter={`url(#${id}-shadow)`}/>
    <g className="fv-assembly fv-model-assembly">
      <Block id={id} x={348} y={303} width={213} depth={213} height={26}/>
      <Block id={id} x={348} y={291} width={213} depth={213} height={10} tone="glass"/>
      <g className="fv-model-lower">
        <Block id={id} x={348} y={252} width={165} depth={165} height={27} tone="violet"/>
        <path d="M247 311 348 369 449 311" fill="none" stroke="#d8bdf4" strokeWidth="1" opacity=".6"/>
        <Block id={id} x={348} y={240} width={165} depth={165} height={9} tone="glass"/>
      </g>
      <g className="fv-model-middle">
        <Block id={id} x={317} y={168} width={88} depth={165} height={54}/>
        <Block id={id} x={393} y={212} width={77} depth={77} height={54}/>
        <path d="M174 251 317 168 460 251 393 289 326 251 250 295Z" fill={`url(#${id}-metal)`}/>
        <path d="M174 251 317 168 460 251M393 289 326 251 250 295" fill="none" stroke="#fff" strokeWidth="1.3" opacity=".85"/>
      </g>
      <g className="fv-model-upper">
        <Block id={id} x={351} y={111} width={165} depth={73} height={43} tone="violet"/>
        <Block id={id} x={288} y={147} width={73} depth={92} height={43} tone="violet"/>
        <path d="M351 111 494 194 431 230 351 184 272 230 208 193 288 147Z" fill={`url(#${id}-glass-top)`}/>
        <path d="M351 111 494 194 431 230 351 184 272 230 208 193" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".65"/>
        <path d="M351 129 466 194 431 214 351 168 272 214 233 192" fill="none" stroke="#efdeff" strokeWidth="1" opacity=".4"/>
      </g>
      <Orb id={id} x={348} y={290} r={28} purple className="fv-orb fv-orb-one"/>
    </g>
  </>;
}

export function FranchiseVisual({variant,className=''}:{variant:Variant;className?:string}) {
  const id=`fv-${useId().replace(/[^a-zA-Z0-9]/g,'')}`;
  return <svg className={`franchise-visual franchise-visual-${variant} ${className}`} viewBox="0 0 680 560" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <Materials id={id}/>
    {variant==='investor'?<Investor id={id}/>:variant==='expansion'?<Expansion id={id}/>:<Model id={id}/>}
  </svg>;
}
