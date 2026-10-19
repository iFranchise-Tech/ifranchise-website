import {C,group as g,path as p,rect as r,circle as c,line as l,text as t,mark,arrow,curve,storefront,document as doc,laptop,coins,calculator,pin,map,book,box,plant,gear,cup,check,key} from './editorial-artkit.mjs';
const sheet=(x,y,w,h)=>r(x+12,y+14,w,h,C.pale,3,'none')+r(x,y,w,h,C.white,3,C.ink,1.8);
const ticks=(x,y,w)=>Array.from({length:13},(_,i)=>l(x+i*w/12,y,x+i*w/12,y+(i%3?7:14),C.mid,1)).join('');
export const scenes=[
 {slug:'for-investors',alt:'A carefully arranged franchise investment plan with a budget, calculator and location review.',concept:'Compare the business, the numbers and the proposed location.',body:
  r(60,90,1080,620,C.soft,4,'none')+r(60,651,1080,59,C.pale,0,'none')+
  sheet(345,130,405,525)+mark(375,160,35)+t(433,187,'INVESTMENT PLAN',26,C.ink,600)+l(375,215,720,215,C.mid,1.5)+
  t(375,260,'Business assessment',24)+[0,1,2].map((n)=>check(377,292+n*51,.75)+l(417,305+n*51,694-n*17,305+n*51,C.grey,3)).join('')+
  r(375,470,345,154,C.soft,2,'none')+t(397,506,'Opening budget',23)+l(397,523,698,523,C.mid,1)+[0,1,2].map(i=>l(397,548+i*24,562,548+i*24,C.grey,2)+l(626,548+i*24,698,548+i*24,C.purple,3)).join('')+
  g(117,373,1.34,calculator())+g(128,125,.6,storefront({branded:false,kind:'retail'}))+
  sheet(794,239,310,302)+t(817,282,'Location review',24)+g(818,311,.78,map())+g(956,401,.35,pin())+g(856,599,1.13,key())+ticks(85,677,216)},
 {slug:'for-brands',alt:'A franchise expansion plan connects a proven central outlet with new locations and an operating handbook.',concept:'An operating system gives a growing network a consistent foundation.',body:
  r(73,99,1054,605,C.soft,4,'none')+r(73,639,1054,65,C.pale,0,'none')+
  sheet(127,137,945,413)+l(155,174,1043,174,C.mid,1)+t(155,166,'EXPANSION PLAN',21,C.ink,600)+
  p('M294 399H592V280H918M592 399V474H918','none',C.mid,4)+
  g(195,219,.72,storefront({label:'BUSINESS',kind:'retail',branded:true}))+g(791,184,.51,storefront({label:'OUTLET 02',kind:'retail',branded:false}))+g(791,367,.51,storefront({label:'OUTLET 03',kind:'retail',branded:false}))+
  c(593,398,10,C.purple,'none')+c(593,281,7,C.purple,'none')+c(593,474,7,C.purple,'none')+
  sheet(145,557,377,128)+t(169,594,'Operating system',24)+['Model','Training','Support'].map((v,i)=>r(168+i*108,616,98,40,i===2?C.purple:C.white,2,C.mid,1)+t(217+i*108,642,v,17,i===2?C.white:C.ink,600,'middle')).join('')+
  g(644,535,.66,doc({title:'STANDARDS',rows:3,checked:true,brand:false}))+g(849,556,.77,laptop({chart:true,brand:false}))},
 {slug:'franchise-basics',alt:'An open franchise handbook with an outlet elevation, agreement, key and ownership diagram.',concept:'Understand how the business system, contract and outlet fit together.',body:
  r(70,106,1060,594,C.soft,4,'none')+r(70,642,1060,58,C.pale,0,'none')+
  g(185,188,.91,storefront({kind:'retail',branded:false}))+g(838,153,1.12,doc({title:'AGREEMENT',rows:4,checked:true,brand:false}))+
  p('M267 526Q424 470 600 523Q792 469 970 526V693Q788 655 600 707Q415 655 267 693Z',C.pale,C.ink,1.8)+
  p('M275 513Q433 469 595 518V695Q432 652 275 681Z',C.white)+p('M605 518Q790 469 962 513V681Q790 652 605 695Z',C.white)+
  mark(305,541,30)+t(350,566,'FRANCHISE GUIDE',24)+[0,1,2,3].map(i=>l(306,598+i*20,556,598+i*20,C.grey,2)).join('')+
  t(644,557,'Own',23)+t(824,557,'Operate',23)+l(672,581,871,581,C.mid,2)+c(671,581,8,C.purple,'none')+c(871,581,8,C.purple,'none')+
  [0,1,2].map(i=>l(644,612+i*22,920-i*11,612+i*22,C.grey,2)).join('')+g(520,253,1.16,key())+ticks(543,413,205)},
 {slug:'industries',alt:'Four precise storefront elevations show café, retail, education and healthcare franchise formats.',concept:'Different industries share the franchise structure but need different operating spaces.',body:
  r(55,100,1090,590,C.soft,4,'none')+r(55,578,1090,112,C.pale,0,'none')+
  [95,355,615,875].map((x,i)=>r(x,177+[54,0,32,14][i],226,325-[54,0,32,14][i],i%2?C.pale:C.white,0,C.mid,1)+[0,1,2].map(j=>r(x+20+j*66,200+[54,0,32,14][i],49,71,C.soft,0,C.mid,1)+l(x+44+j*66,201+[54,0,32,14][i],x+44+j*66,269+[54,0,32,14][i],C.mid,1)).join('')).join('')+
  g(91,320,.83,storefront({width:280,kind:'food',label:'CAFÉ',branded:true}))+
  g(351,320,.83,storefront({width:280,kind:'fashion',label:'RETAIL',branded:false}))+
  g(611,320,.83,storefront({width:280,kind:'education',label:'EDUCATION',branded:false}))+
  g(871,320,.83,storefront({width:280,kind:'health',label:'HEALTHCARE',branded:false}))+
  l(74,591,1126,591,C.ink,1.5)+l(74,639,1126,639,C.mid,1)+[223,483,743,1003].map(x=>l(x,591,x-26,679,C.mid,1)).join('')+
  g(70,505,.5,plant())+g(1080,505,.5,plant())+l(95,139,390,139,C.mid,1)+l(810,139,1106,139,C.mid,1)}
];
