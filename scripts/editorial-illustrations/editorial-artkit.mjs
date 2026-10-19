// Editorial vector vocabulary. Each article owns its own scene and explanatory metaphor.
export const C={ink:'__INK__',purple:'__PURPLE__',mid:'__MID__',pale:'__PALE__',paper:'__PAPER__',white:'__WHITE__',grey:'__GREY__',soft:'__SOFT__'};
export const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export const group=(x,y,s,body,rotate=0)=>`<g transform="translate(${x} ${y}) scale(${s}) rotate(${rotate})">${body}</g>`;
export const path=(d,fill='none',stroke=C.ink,sw=1.8,extra='')=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
export const rect=(x,y,w,h,fill=C.white,rx=8,stroke=C.ink,sw=1.8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
export const circle=(x,y,r,fill=C.white,stroke=C.ink,sw=1.8)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
export const ellipse=(x,y,rx,ry,fill=C.pale,stroke='none')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}"/>`;
export const line=(x1,y1,x2,y2,color=C.ink,sw=1.8,extra='')=>path(`M${x1} ${y1}L${x2} ${y2}`,'none',color,sw,extra);
export const text=(x,y,t,size=22,color=C.ink,weight=600,anchor='start')=>`<text x="${x}" y="${y}" fill="${color}" font-family="Arial,sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(t)}</text>`;
export const mark=(x,y,w=27)=>`<use href="#brandmark" x="${x}" y="${y}" width="${w}" height="${w*.898}"/>`;
export const check=(x,y,s=1,color=C.purple)=>group(x,y,s,path('M0 10L8 18L24 0','none',color,4));
export const arrow=(x1,y1,x2,y2,color=C.purple,dash=false)=>{const a=Math.atan2(y2-y1,x2-x1),l=11;return line(x1,y1,x2,y2,color,3,dash?'stroke-dasharray="7 8"':'')+path(`M${x2-l*Math.cos(a-.5)} ${y2-l*Math.sin(a-.5)}L${x2} ${y2}L${x2-l*Math.cos(a+.5)} ${y2-l*Math.sin(a+.5)}`,'none',color,3)};
export const curve=(d,color=C.purple,dash=false)=>path(d,'none',color,3,dash?'stroke-dasharray="7 8"':'');
export function backdrop(kind='circle'){
 if(kind==='arch')return path('M110 674V310A220 220 0 0 1 550 310V674Z',C.soft,'none')+rect(665,113,420,563,C.pale,4,'none')+line(84,681,1118,681,C.mid,1.2);
 if(kind==='split')return rect(85,122,494,555,C.soft,4,'none')+rect(625,178,490,499,C.pale,4,'none')+line(85,681,1115,681,C.mid,1.2);
 if(kind==='landscape')return path('M0 625L1200 472V800H0Z',C.soft,'none')+path('M0 682L1200 529','none',C.pale,1)+circle(1008,165,63,C.pale,'none');
 if(kind==='frame')return rect(85,95,1030,600,C.soft,3,'none')+line(85,695,1115,695,C.mid,1.2);
 return circle(610,402,292,C.soft,'none')+rect(87,628,1026,52,C.pale,0,'none')+line(87,681,1113,681,C.mid,1.2);
}
export function person({pose='point',female=false,tone=C.pale,coat=C.purple,flip=false}={}){
 let body=ellipse(92,269,85,14,C.soft);
 body+=path('M64 184L54 258H81L101 193L119 258H147L137 179Z',C.ink)+path('M53 255L47 269H81V257M119 256V269H157L145 256',C.ink);
 body+=path('M56 89C35 94 24 126 24 168L62 182H137L160 158L145 101L117 86Z',coat);
 body+=path('M80 71L77 96L97 117L115 92L108 70',tone)+path('M73 93L96 117L85 151M118 93L97 117L112 153',C.white);
 body+=path('M69 31C70 4 123 3 128 38L123 69C111 90 86 87 74 67Z',tone);
 body+=female?path('M68 56C45 45 59 3 87 5C128 -12 146 25 126 59L120 31L102 24C93 49 77 38 68 56Z',C.ink)+circle(61,16,15,C.ink):path('M69 48C48 15 83 -6 110 7C143 6 141 31 122 34L113 23L89 28L81 49Z',C.ink);
 body+=circle(112,46,1.8,C.ink,'none')+path('M115 49L119 57L112 59M103 69Q110 73 116 68','none',C.ink,1.8);
 if(pose==='point')body+=path('M44 109L28 160Q25 179 47 176L134 131L164 103L173 105L158 123L177 118L183 127L145 149L58 203Q13 201 6 176L21 121',coat)+path('M134 131L164 103L173 105L158 123L177 118L183 127L145 149Z',tone);
 else if(pose==='carry')body+=rect(115,125,83,73,C.pale,2)+line(156,126,156,150)+path('M38 119L30 174L125 184L142 173L137 163L119 166L70 151L78 119',coat)+path('M119 166L137 163L142 173L125 184L115 181Z',tone);
 else if(pose==='phone')body+=path('M140 103L160 131L175 71L160 51L148 63L151 83L124 117',coat)+rect(151,34,24,44,C.ink,4)+path('M148 64L151 47L158 48L162 62L169 75L158 82Z',tone);
 else if(pose==='write')body+=path('M39 115L29 165L101 174L139 147L132 135L96 151L69 135L71 116',coat)+rect(103,120,77,58,C.white,3)+mark(146,133,16)+path('M118 159L135 140L143 141L148 149L132 167Z',tone)+line(142,142,156,114,C.purple,4);
 else body+=path('M39 115L32 173L107 198L126 188L121 178L97 178L69 151L71 116',coat)+path('M107 198L126 188L121 178L97 178Z',tone);
 body+=line(105,119,104,176,C.ink,1.8);
 return flip?`<g transform="translate(210 0) scale(-1 1)">${body}</g>`:body;
}
export function storefront({label='',kind='retail',branded=true,width=280}={}){
 const w=width, left=18, windowW=w*.52, doorX=w*.66, doorW=w*.26;
 let b=rect(12,79,w,237,C.pale,2,'none')+rect(0,78,w,233,C.white,1)+rect(7,86,w-14,217,C.soft,0,'none');
 b+=rect(left,156,windowW,140,C.white,0)+rect(left+5,161,windowW-10,130,C.soft,0,'none')+rect(doorX,156,doorW,155,C.white,0)+rect(doorX+5,161,doorW-10,127,C.soft,0,'none');
 b+=line(doorX+doorW-12,228,doorX+doorW-12,248,C.purple,3)+line(left,281,left+windowW,281,C.mid,1.3)+path(`M${left+12} 171L${left+46} 171L${left+12} 208Z`,C.white,'none');
 b+=rect(-6,50,w+12,49,C.purple,1)+rect(-6,50,w+12,5,C.mid,0,'none');
 if(branded){b+=rect(10,60,29,29,C.white,1,'none')+mark(14,63,21);}
 if(label)b+=text(branded?51:w/2,81,label,Math.min(17,(w-(branded?65:28))/(label.length*.58)),C.white,650,branded?'start':'middle');
 const n=8, topL=-6,topW=w+12,bottomL=-15,bottomW=w+30;
 for(let i=0;i<n;i++){
  const a=topL+i*topW/n,b1=topL+(i+1)*topW/n,c1=bottomL+(i+1)*bottomW/n,d=bottomL+i*bottomW/n;
  const fill=i%2?C.white:C.pale;
  b+=path(`M${a} 101H${b1}L${c1} 132H${d}Z`,fill,C.ink,1.1)+path(`M${d} 132H${c1}V139Q${(c1+d)/2} 150 ${d} 139Z`,fill,C.ink,1.1);
 }
 if(kind==='food')b+=group(left+28,201,.59,cup())+line(left+14,269,left+windowW-14,269,C.purple,3);
 if(kind==='fashion')b+=line(left+23,180,left+windowW-23,180,C.grey,2)+path(`M${left+windowW/2} 184v7l-23 14h46l-23 -14`, 'none',C.ink,1.3)+path(`M${left+windowW/2-16} 201l-13 9-10 19 12 7 8-12v38h39v-38l7 12 12-7-10-19-14-9-10 7Z`,C.pale,C.ink,1.3);
 if(kind==='service')b+=group(left+39,197,.52,gear());
 if(kind==='education')b+=group(left+12,211,(windowW-24)/300,book())+line(left+13,265,left+windowW-13,265,C.purple,3);
 if(kind==='health')b+=rect(left+windowW/2-7,196,14,55,C.purple,1,'none')+rect(left+windowW/2-27,216,54,14,C.purple,1,'none');
 return b+rect(-9,311,w+18,12,C.pale,1)+line(-18,325,w+36,325,C.mid,1.4);
}
export function document({title='',rows=4,checked=false,fold=true,brand=true}={}){
 let b=path(fold?'M0 0H155L192 37V250H0Z':'M0 0H192V250H0Z',C.white);
 b+=line(5,245,187,245,C.pale,2);
 if(fold)b+=path('M155 0V37H192',C.soft);
 if(brand)b+=mark(20,19,22);
 if(title){const size=Math.min(18,152/(title.length*.54));b+=text(20,77,title,size,C.ink,600);}
 b+=line(20,91,172,91,C.mid,1);
 for(let i=0;i<Math.min(rows,5);i++){const y=116+i*26;b+=line(checked?49:22,y,163-(i%2)*18,y,C.grey,2.4);if(checked)b+=check(23,y-7,.5)}
 return b;
}
export function laptop({chart=false,brand=true}={}){let b=rect(0,0,240,154,C.white,9)+rect(13,14,214,123,C.soft,4);if(chart)b+=bars([42,72,54,94],35,125,35,25);else{b+=line(32,42,180,42,C.grey,5)+line(32,65,140,65,C.grey,5);if(brand)b+=mark(162,86,40)}return b+path('M-24 154H264L282 172H-42Z',C.pale)+line(85,154,155,154,C.ink,5)};
export function tablet({title='',chart=false}={}){return rect(0,0,186,250,C.white,14)+rect(13,22,160,204,C.soft,3)+circle(93,238,4,C.grey,'none')+(title?text(28,56,title,18):'')+(chart?bars([48,91,70],30,192,45,30):line(30,95,151,95,C.grey,4)+line(30,128,129,128,C.grey,4)+line(30,160,150,160,C.grey,4)+mark(123,184,29))};
export function coins(n=3){let b='';for(let i=n-1;i>=0;i--)b+=rect(0,i*14,85,20,C.pale,8)+ellipse(42.5,i*14,42.5,12,C.mid,C.ink);return b+text(43,7,'₹',20,C.ink,650,'middle')};
export function calculator(){let b=rect(0,0,125,180,C.purple,13)+rect(14,15,97,39,C.white,5);for(let y=0;y<4;y++)for(let x=0;x<3;x++)b+=rect(15+x*34,68+y*25,25,17,x===2?C.mid:C.white,3,C.ink,1.5);return b};
export function calendar(label='90',cells=5){let b=rect(0,0,225,210,C.white,10)+rect(0,0,225,47,C.purple,8)+line(40,-12,40,19,C.ink,7)+line(182,-12,182,19,C.ink,7)+text(112,132,label,54,C.purple,700,'middle');for(let i=0;i<cells;i++)b+=rect(24+i*37,165,24,21,i===cells-1?C.mid:C.pale,2,'none');return b};
export function clock(){return circle(0,0,75,C.white)+circle(0,0,63,C.pale,'none')+line(0,0,0,-39,C.purple,5)+line(0,0,35,17,C.purple,5)+circle(0,0,6,C.purple,'none')};
export function shield(symbol='check'){return path('M0 0L75 -27L150 0V72C147 119 104 150 75 166C46 150 3 119 0 72Z',C.pale)+ (symbol==='check'?check(48,50,2):symbol==='lock'?group(42,38,.8,lock()):text(75,83,symbol,50,C.purple,700,'middle'))};
export function lock(){return path('M17 41V18C17 -19 75 -19 75 18V41','none',C.ink,8)+rect(0,35,94,83,C.purple,12)+circle(47,68,9,C.white,'none')+rect(43,72,8,22,C.white,2,'none')};
export function magnifier(){return circle(65,65,61,C.white)+circle(65,65,48,C.pale)+path('M108 108L174 174L192 156L126 90Z',C.purple)+line(25,57,58,24,C.white,6)};
export function pin(){return path('M0 0C-49 -69 -55 -88 -55 -111A55 55 0 0 1 55 -111C55 -88 49 -69 0 0Z',C.purple)+circle(0,-111,19,C.white,'none')};
export function map(){return path('M0 35L110 0L220 35L330 0V215L220 250L110 215L0 250Z',C.white)+path('M110 0V215M220 35V250','none',C.grey,2)+path('M0 185L80 160L175 192L260 100L330 120','none',C.mid,20)+path('M45 20L70 105L180 80L230 190L320 200','none',C.pale,26)+path('M0 185L80 160L175 192L260 100L330 120','none',C.purple,3)};
export function book(label=''){
 let b=path('M-4 8Q66 -12 150 12Q235 -12 304 8V199Q235 181 150 210Q65 181 -4 199Z',C.pale,C.ink,1.8);
 b+=path('M0 0Q73 -18 146 10V202Q73 179 0 192Z',C.white)+path('M154 10Q227 -18 300 0V192Q227 179 154 202Z',C.white)+line(150,12,150,205,C.mid,2);
 for(const y of [34,60,86,112,138,164])b+=path(`M19 ${y}Q74 ${y-8} 127 ${y+5}M173 ${y+5}Q226 ${y-8} 281 ${y}`,'none',y===34?C.purple:C.grey,y===34?3:1.6);
 return b+(label?text(0,-32,label,22):'');
}
export function box(label=''){
 return path('M0 35L90 0L180 35V161L90 200L0 161Z',C.pale)+path('M0 35L90 72V200L0 161Z',C.white)+path('M90 72L180 35V161L90 200Z',C.mid)+path('M44 18L135 54L157 45L67 9Z',C.purple,'none')+path('M135 54V84L157 75V45Z',C.purple,'none')+`<g transform="matrix(1 .411 0 1 0 0)">${label?text(16,111,label,Math.min(15,68/(label.length*.54))):rect(14,83,48,43,C.white,1,C.mid,1)+mark(23,91,27)}</g>`+line(101,166,169,139,C.ink,1);
}
export function chartBoard({type='bars',label='',values=[60,110,85,150]}={}){let b=rect(0,0,310,230,C.white,10)+line(28,193,280,193,C.grey,2)+line(28,42,28,193,C.grey,2);if(type==='bars')b+=bars(values,50,191,53,32);else if(type==='line')b+=path('M40 162L95 126L148 143L203 72L272 44','none',C.purple,5)+[40,95,148,203,272].map((x,i)=>circle(x,[162,126,143,72,44][i],5,C.purple,'none')).join('');else b+=circle(155,113,68,C.pale)+path('M155 113V45A68 68 0 0 1 220 135Z',C.purple);if(label)b+=text(20,-20,label,23);return b};
export function bars(values,x=0,y=180,gap=50,width=31){return values.map((v,i)=>rect(x+i*gap,y-v,width,v,i===values.length-1?C.purple:i%2?C.mid:C.pale,3,C.ink,1.7)).join('')};
export function speech(label='...',tail='left'){return rect(0,0,170,95,C.white,8)+path(tail==='left'?'M35 94L25 115L57 94':'M113 94L145 115L135 94',C.white)+text(85,56,label,Math.min(25,142/(label.length*.55)),C.purple,600,'middle')};
export function gear(){
 let points=[];for(let i=0;i<48;i++){const a=i*Math.PI/24,rad=i%6<3?61:49;points.push(`${51+Math.cos(a)*rad},${64+Math.sin(a)*rad}`)}
 return `<polygon points="${points.join(' ')}" fill="${C.mid}" stroke="${C.ink}" stroke-width="1.8" stroke-linejoin="round"/>`+circle(51,64,28,C.white,C.ink,1.8)+circle(51,64,19,C.soft,'none');
}
export function cup(){return ellipse(40,100,57,9,C.pale,'none')+path('M73 26H91C110 27 110 62 88 67H69','none',C.ink,3)+path('M1 12H79L69 80Q62 96 40 96Q17 96 11 80Z',C.white)+ellipse(40,12,39,9,C.pale,C.ink)+ellipse(40,12,29,4,C.mid,'none')+path('M28 -7C16 -22 39 -30 28 -43M51 -7C39 -22 62 -30 51 -43','none',C.grey,1.6)};
export function truck(){return rect(0,0,200,115,C.white,5)+path('M200 36H268L304 78V115H200Z',C.pale)+path('M217 47H260L281 77H217Z',C.white)+circle(52,119,28,C.ink)+circle(52,119,12,C.white)+circle(250,119,28,C.ink)+circle(250,119,12,C.white)+mark(37,25,45)};
export function key(){return circle(38,38,37,C.pale)+circle(38,38,13,C.white)+path('M70 25H184V49H164V68H144V49H70Z',C.purple)};
export function plant(){return path('M32 113V12M32 73C-20 64 -12 15 32 41M32 55C82 37 79 3 32 15','none',C.ink,3)+path('M32 73C-20 64 -12 15 32 41Z',C.pale)+path('M32 55C82 37 79 3 32 15Z',C.mid)+path('M0 105H65L56 159H10Z',C.white)};
export function balance(){return line(140,0,140,215,C.ink,7)+line(35,40,250,40,C.purple,7)+path('M35 40L0 127H70Z','none')+path('M250 40L215 127H285Z','none')+path('M0 127H70C65 169 6 169 0 127Z',C.pale)+path('M215 127H285C279 169 220 169 215 127Z',C.mid)+path('M105 215H175L198 234H83Z',C.ink)};
export function phone(){return rect(0,0,120,215,C.white,18)+rect(11,22,98,166,C.pale,4)+line(45,11,75,11,C.ink,4)+circle(60,201,5,C.grey,'none')+mark(38,72,44)};
export function star(){return path('M0 -40L12 -13L42 -9L20 12L26 42L0 27L-26 42L-20 12L-42 -9L-12 -13Z',C.purple)};
export function megaphone(){return path('M0 52L110 0V157L0 103Z',C.pale)+rect(-34,52,36,51,C.purple,8)+path('M11 106L34 161H61L47 90Z',C.white)+line(138,23,169,5,C.purple,4)+line(144,76,185,76,C.purple,4)+line(138,127,169,147,C.purple,4)};
export function folder(label=''){return path('M0 20V0H89L111 25H238V185H0Z',C.mid)+rect(9,34,218,130,C.white,1,C.ink,1)+path('M-12 57H260L238 185H0Z',C.pale)+rect(21,91,181,49,C.white,2,'none')+mark(31,103,25)+(label?text(74,123,label,Math.min(20,117/(label.length*.54))):'')};
export function target(){return circle(0,0,92,C.white)+circle(0,0,66,C.pale)+circle(0,0,38,C.mid)+circle(0,0,13,C.purple)};
export function timeline(labels=['01','02','03']){let b=line(30,40,330,40,C.purple,4);labels.forEach((v,i)=>{const x=30+i*300/(labels.length-1);b+=circle(x,40,20,i===labels.length-1?C.purple:C.white)+text(x,93,v,18,C.ink,650,'middle')});return b};
export function ruler(){let b=rect(0,0,270,50,C.pale,3);for(let i=1;i<18;i++)b+=line(i*15,0,i*15,i%3?15:28,C.ink,2);return b};
export function dashboard(){return rect(0,0,320,235,C.white,12)+rect(0,0,320,38,C.purple,9)+circle(20,20,4,C.white,'none')+circle(35,20,4,C.white,'none')+rect(19,56,108,73,C.pale,5,'none')+group(151,56,.46,chartBoard({type:'line'}))+group(30,187,.65,timeline(['A','B','C']))+text(73,105,'₹',33,C.purple,650,'middle')};
export const room=()=>line(75,645,1125,645,C.ink,2)+line(95,645,95,215,C.grey,2)+line(95,215,310,130,C.grey,2);
