// Frame the visible mark, excluding the large blank margins in the original assets.
// Original files, colours and artwork are preserved.
const frames:Record<string,{size:[number,number];box:[number,number,number,number];bg:string}>={
  odette:{size:[1254,1254],box:[152,520,936,238],bg:'#fefefe'},
  'original-burger-co':{size:[1254,1254],box:[143,394,990,430],bg:'#0c1bb1'},
  franco:{size:[1225,793],box:[184,259,840,277],bg:'#fefefe'},
  'biggies-burger':{size:[1254,1254],box:[176,351,923,517],bg:'#000'},
  bigguys:{size:[1162,608],box:[416,138,331,313],bg:'#dd0213'},
  'brand-avenue':{size:[225,225],box:[25,99,178,20],bg:'#01165a'},
  'lassi-n-cafe':{size:[1091,635],box:[342,136,380,393],bg:'#e9111a'},
  'fusion-pizza-big-burger':{size:[935,537],box:[262,66,408,400],bg:'#fefefe'},
  'kasturi-creations':{size:[1536,1024],box:[398,216,783,526],bg:'#fefefe'},
  '10-downing-street':{size:[1536,1024],box:[439,120,671,776],bg:'#046438'},
  'freshco-goli-soda':{size:[1536,1024],box:[72,236,1435,559],bg:'#fefefe'},
  emori:{size:[1600,900],box:[181,158,1253,518],bg:'#000'},
};
export function BrandLogo({brand,className=''}:{brand:{slug:string;name:string;logo:string};className?:string}){
  const f=frames[brand.slug];
  return <span className={'brand-logo '+className} style={{background:f?.bg||'#fff'}}>
    {f?<svg viewBox={f.box.join(' ')} role="img" aria-label={brand.name+' logo'} preserveAspectRatio="xMidYMid meet"><image href={brand.logo} width={f.size[0]} height={f.size[1]}/></svg>:<img src={brand.logo} alt={brand.name+' logo'}/>}
  </span>;
}
