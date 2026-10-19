/**
 * Art-direct the generated editorial cast beside each article's unique native scene.
 * Original people illustrations remain intact; typography and the approved mark
 * are authored as vectors, avoiding generated lettering or altered logo geometry.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {esc} from './editorial-artkit.mjs';
import {scenes as collectionScenes} from './editorial-collections-art.mjs';
const require=createRequire(import.meta.url);
const sharp=require('../../node_modules/.pnpm/sharp@0.35.5_@types+node@22.19.19/node_modules/sharp');
const root=new URL('../../',import.meta.url).pathname;
const proof=path.join(root,'work/human-art-review');
const castRoot=path.join(root,'public/assets/editorial-people');
const inputArg=process.argv.find(x=>x.startsWith('--assets='));
const input=inputArg?.slice(9);
const preview=process.argv.includes('--preview');
const articles=JSON.parse(await fs.readFile(path.join(root,'content/editorial.json'),'utf8'));
let scenes=[];
for(const part of ['a','b','c'])scenes.push(...(await import(`./editorial-scenes-${part}.mjs`)).scenes);
const casts={
 'consultation':'Two business professionals discuss a plan at a round table',
 'financial-review':'A business analyst reviews financial records at her desk',
 'legal-advice':'An advisor and business owner review a folder together',
 'business-owner':'A business owner holds her planning folder',
 'strategy-session':'Two professionals discuss a business plan at a desk',
 'customer-conversation':'A business professional speaks with a customer',
 'location-planning':'A business owner and advisor examine a site plan',
 'team-coaching':'Three colleagues discuss their work around a table',
 'quality-review':'Two operations professionals review a checklist',
 'healthcare-advisor':'A healthcare professional and business manager discuss their work',
 'hospitality-manager':'A hospitality manager reviews a reception record',
 'cafe-operator':'A café operator stands beside her coffee counter',
 'retail-review':'A shop owner and advisor examine a retail product',
 'learning-session':'A trainer and adult learner work through a notebook',
 'service-professional':'A service professional reviews a work record',
 'logistics-team':'An operations team reviews an organised delivery'
};
await fs.mkdir(castRoot,{recursive:true});
await fs.mkdir(proof,{recursive:true});
if(input){for(const name of Object.keys(casts)){
 const png=path.join(input,name+'.png');
 try{await fs.access(png);}catch{if(preview)continue;throw Error('Missing people asset: '+name);}
 await sharp(png).resize({width:1280,height:1280,fit:'inside',withoutEnlargement:true}).webp({quality:94,alphaQuality:100,effort:5}).toFile(path.join(castRoot,name+'.webp'));
}}
const available=[];for(const name of Object.keys(casts)){try{await fs.access(path.join(castRoot,name+'.webp'));available.push(name);}catch{}}
if(!preview&&available.length!==Object.keys(casts).length)throw Error('Expected complete editorial cast');
const hash=s=>createHash('sha256').update(s).digest('hex');
const seed=s=>[...s].reduce((n,c)=>((n*31+c.charCodeAt(0))>>>0),7);
const choose=(items,key)=>items[seed(key)%items.length];
const exact={
 'what-is-a-franchise':'consultation', 'types-of-franchises':'business-owner',
 'franchise-investment-costs':'financial-review','how-to-franchise-your-business':'strategy-session',
 'choosing-franchise-location':'location-planning',
 'food-and-beverage-franchise-india':'cafe-operator','retail-franchise-india':'retail-review',
 'education-franchise-india':'learning-session','beauty-wellness-franchise-india':'customer-conversation',
 'service-franchise-india':'service-professional','healthcare-franchise-india':'healthcare-advisor',
 'automotive-franchise-india':'service-professional','hospitality-franchise-india':'hospitality-manager',
 'for-investors':'consultation','for-brands':'strategy-session','franchise-basics':'learning-session','industries':'retail-review',
 'franchise-supplier-approval-process':'logistics-team','women-franchise-investors':'business-owner'
};
function castFor(s,a){
 let name=exact[s.slug];
 if(!name){
  const k=s.slug;
  const choices=/train|learn|coaching|onboard|manual|sop/.test(k)?['learning-session','team-coaching','quality-review']:
   /food|cafe|waste/.test(k)?['cafe-operator','quality-review']:
   /supplier|stock|inventory|procurement|delivery/.test(k)?['logistics-team','retail-review','quality-review']:
   /site|location|lease|catchment|territor|premises|field|visit/.test(k)?['location-planning','quality-review','business-owner']:
   /legal|agreement|contract|renewal|exit|transfer|compliance|ip-|confidential|consent|privacy|fraud|rights/.test(k)?['legal-advice','consultation','quality-review']:
   /customer|market|enquir|call|crm|digital|lead|referral|communication/.test(k)?['customer-conversation','strategy-session','business-owner']:
   /fee|cost|fund|budget|capital|cash|finance|financial|financing|credit|royalt|profit|economics|payback|money|deposit/.test(k)?['financial-review','consultation','legal-advice','business-owner']:
   /staff|hire|hiring|recruit|team|manager|roster|operator/.test(k)?['team-coaching','customer-conversation','quality-review']:
   a?.audience==='brand'?['strategy-session','business-owner','quality-review','consultation']:['consultation','financial-review','business-owner','strategy-session'];
  name=choose(choices,k);
 }
 return available.includes(name)?name:(preview?'consultation':name);
}
const brand=(await fs.readFile(path.join(root,'public/assets/brandmark-purple.svg'),'utf8')).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'').replaceAll('#32159b','__PURPLE__');
const palettes={
 light:{INK:'#29213c',PURPLE:'#32159B',MID:'#ad96dc',PALE:'#e4dcf3',PAPER:'#f9f7fc',WHITE:'#ffffff',GREY:'#8a8198',SOFT:'#eee9f5',wall:'#fcfaf8',floor:'#ebe3f5',arch:'#eee7f6'},
 dark:{INK:'#302738',PURPLE:'#704993',MID:'#b19bc5',PALE:'#dfd5e7',PAPER:'#f5f1f7',WHITE:'#ffffff',GREY:'#8b8093',SOFT:'#ebe4ee',wall:'#f4eff4',floor:'#ddd1e4',arch:'#e5dce9'}
};
const manifest={},compositions=[],peopleData={};
for(const name of available){
 const asset=sharp(path.join(castRoot,name+'.webp'));
 const {data,info}=await asset.clone().ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width,top=info.height,right=0,bottom=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>25){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 left=Math.max(0,left-18);top=Math.max(0,top-18);right=Math.min(info.width,right+18);bottom=Math.min(info.height,bottom+18);
 peopleData[name]={data:(await asset.clone().png().toBuffer()).toString('base64'),width:info.width,height:info.height,viewBox:[left,top,right-left,bottom-top].join(' ')};
}
for(const [kind,items] of [['articles',scenes],['collections',collectionScenes]]){
 for(const mode of ['light','dark'])await fs.mkdir(path.join(root,'public/art/human',kind,mode),{recursive:true});
 const ordered=kind==='articles'?articles.map(a=>items.find(s=>s.slug===a.slug)):items;
 for(let i=0;i<ordered.length;i++){
  const s=ordered[i];if(!s)throw Error('Missing scene');
  if(preview&&!['what-is-a-franchise','franchise-investment-costs','choosing-franchise-location','food-and-beverage-franchise-india','for-investors','for-brands','franchise-basics','industries'].includes(s.slug))continue;
  const a=articles.find(a=>a.slug===s.slug),cast=castFor(s,a);
  if((s.body.match(/<use href="#brandmark"/g)||[]).length!==1)throw Error('Expected one approved mark: '+s.slug);
  const right=seed(s.slug)%3===1;
  const wide=['consultation','team-coaching','strategy-session','legal-advice','retail-review','learning-session','logistics-team','location-planning','quality-review','healthcare-advisor','customer-conversation'].includes(cast);
  const solo=['business-owner','service-professional'].includes(cast);
  const person={x:right?(solo?770:620):10,y:wide?105:68,w:solo?420:(wide?570:545),h:wide?635:672};
  const panel={x:right?45:(solo?440:585),y:seed(s.slug)%2?137:116,w:solo?710:570,h:solo?510:470};
  // Deliberately non-overlapping safe regions: the complete character silhouette
  // stays outside the unique topic board, including its exact approved brandmark.
  if(person.x<0||person.y<0||person.x+person.w>1200||person.y+person.h>800||panel.x<0||panel.y<0||panel.x+panel.w>1200||panel.y+panel.h>800)throw Error('Out-of-bounds placement: '+s.slug);
  if(!(person.x+person.w<=panel.x||panel.x+panel.w<=person.x))throw Error('Overlapping subject and topic board: '+s.slug);
  const alt=`${casts[cast]}. ${s.alt}`;
  for(const [mode,p] of Object.entries(palettes)){
   const body=s.body.replaceAll('<text ','<text font-kerning="normal" ');
   const art=`<svg x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" viewBox="60 75 1080 650" preserveAspectRatio="xMidYMid meet"><rect x="60" y="75" width="1080" height="650" fill="__PAPER__"/>${body}</svg>`;
   let svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="800" viewBox="0 0 1200 800" role="img"><title>${esc(alt)}</title><desc>${esc(s.concept)}</desc><defs><symbol id="brandmark" viewBox="576 485 507 455">${brand}</symbol><linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${p.wall}"/><stop offset="1" stop-color="${p.floor}"/></linearGradient><radialGradient id="floor"><stop stop-color="#6a517b" stop-opacity=".17"/><stop offset="1" stop-color="#6a517b" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="800" fill="url(#wall)"/>${seed(s.slug)%2===0?`<path d="M${right?670:55} 708V300a230 230 0 0 1 460 0v408Z" fill="${p.arch}"/>`:`<rect x="${right?660:55}" y="80" width="465" height="628" rx="10" fill="${p.arch}"/><path d="M${right?815:210} 80V708M${right?970:365} 80V708M${right?660:55} 260h465" stroke="__MID__" stroke-opacity=".18"/>`}<path d="M45 708H1155" stroke="__MID__" stroke-opacity=".35"/><ellipse cx="${right?900:290}" cy="738" rx="275" ry="30" fill="url(#floor)"/><rect x="${panel.x+7}" y="${panel.y+24}" width="${panel.w}" height="${panel.h-34}" rx="8" fill="__MID__" opacity=".12"/><rect x="${panel.x}" y="${panel.y+16}" width="${panel.w}" height="${panel.h-34}" rx="7" fill="__PAPER__" stroke="__MID__" stroke-width="1"/>${art}<svg x="${person.x}" y="${person.y}" width="${person.w}" height="${person.h}" viewBox="${peopleData[cast].viewBox}" preserveAspectRatio="xMidYMax meet"><image width="${peopleData[cast].width}" height="${peopleData[cast].height}" href="data:image/png;base64,${peopleData[cast].data}"/></svg></svg>`;
   for(const [k,v] of Object.entries(p))svg=svg.replaceAll('__'+k+'__',v);
   if(/__[A-Z]+__/.test(svg))throw Error('Unresolved token');
   const destination=path.join(root,'public/art/human',kind,mode,s.slug+'.webp');
   await sharp(Buffer.from(svg)).webp({quality:88,effort:5}).toFile(destination);
   if(mode==='light')await fs.writeFile(path.join(proof,s.slug+'.svg'),svg);
  }
  compositions.push({slug:s.slug,kind,cast,right,sceneHash:hash(s.body),alt});
  if(kind==='articles')manifest[s.slug]={alt,concept:s.concept};
 }
}
if(!preview){
 if(Object.keys(manifest).length!==articles.length)throw Error('Incomplete article manifest');
 if(new Set(compositions.map(c=>c.sceneHash)).size!==compositions.length)throw Error('Repeated complete composition');
 await fs.writeFile(path.join(root,'content/editorial-artwork.json'),JSON.stringify(manifest,null,2)+'\n');
 await fs.writeFile(path.join(root,'content/editorial-human-artwork.json'),JSON.stringify({version:1,style:'Detailed editorial people and individually authored topic scenes',brandmark:'Approved vector geometry, integrated within each topic object',compositions},null,2)+'\n');
}
// Readable review sheets, without resizing or modifying the source characters.
for(const kind of ['articles','collections']){
 const items=compositions.filter(c=>c.kind===kind);
 for(let page=0;page<Math.ceil(items.length/9);page++){
  const batch=items.slice(page*9,page*9+9),parts=[];
  for(let i=0;i<batch.length;i++){
   const s=batch[i],x=i%3*480,y=Math.floor(i/3)*354;
   parts.push({input:await sharp(path.join(root,'public/art/human',kind,'light',s.slug+'.webp')).resize(470,313).png().toBuffer(),left:x,top:y});
   parts.push({input:Buffer.from(`<svg width="470" height="40"><rect width="470" height="40" fill="white"/><text x="8" y="18" font-family="Arial" font-size="11">${esc(s.slug)}</text><text x="8" y="33" font-family="Arial" font-size="10" fill="#555">${esc(s.cast)}</text></svg>`),left:x,top:y+313});
  }
  await sharp({create:{width:1440,height:Math.ceil(batch.length/3)*354,channels:3,background:'#ffffff'}}).composite(parts).png().toFile(path.join(proof,`${kind}-${page+1}.png`));
 }
}
console.log(JSON.stringify({preview,scenes:compositions.length,cast:available.length,review:proof}));
