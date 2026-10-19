import {C,group as g,path,rect,circle,ellipse,line,text,mark,check,arrow,storefront,document as originalDocument,laptop,coins,calculator,calendar,clock,shield,lock,magnifier,pin,map,book,box,chartBoard,bars,gear,cup,truck,key,megaphone,folder,ruler} from './editorial-artkit.mjs';

// Precise, object-led editorial illustrations. Geometry and labels belong to the scene;
// branding is placed once, on a relevant document or physical/digital business asset.
const clean=s=>s.replace(/<use\s+href="#brandmark"[^>]*\/>/g,'');
const txt=(x,y,s,size=24,col=C.ink,weight=600,anchor='start')=>text(x,y,s,size,col,weight,anchor);
const rules=(x,y,w,n=3,dy=26)=>Array.from({length:n},(_,i)=>line(x,y+i*dy,x+w-(i%2)*w*.16,y+i*dy,C.mid,3)).join('');
const shadow=(x,y,w,h,r=12)=>rect(x+8,y+12,w,h,C.pale,r,'none');
const card=(x,y,w,h,body='',r=12)=>g(x,y,1,shadow(0,0,w,h,r)+rect(0,0,w,h,C.white,r,C.ink,2)+body);
const base=(v=0)=>v%4===0?rect(80,110,1040,580,C.soft,30,'none')+circle(1020,135,95,C.pale,'none'):v%4===1?path('M75 650V285Q75 110 260 110H530V650Z',C.pale,'none')+rect(680,145,420,490,C.soft,24,'none'):v%4===2?ellipse(595,410,490,282,C.soft)+rect(100,583,1000,90,C.pale,0,'none'):rect(100,160,1000,470,C.soft,24,'none')+circle(955,235,120,C.pale,'none');
const heading=(s,w=360,branded=false)=> (branded?mark(26,22,38):'')+txt(branded?82:28,49,s,Math.min(25,(w-(branded?108:56))/(s.length*.64)),C.ink,700)+line(27,75,w-27,75,C.pale,2);
const sheet=(title,{w=360,h=440,brand=false,rows=4,checked=false}={})=>shadow(0,0,w,h)+rect(0,0,w,h,C.white,10,C.ink,2)+heading(title,w,brand)+Array.from({length:rows},(_,i)=>{let yy=115+i*58;return (checked?check(29,yy-13,.8):'')+line(checked?76:29,yy,w-33,yy,C.mid,3)+line(checked?76:29,yy+19,w-65,yy+19,C.pale,3)}).join('');
const footer=(w,y,s)=>line(27,y-28,w-27,y-28,C.pale,2)+txt(28,y,s,22,C.ink,500);
const tag=(x,y,w,s,fill=C.pale,col=C.purple)=>rect(x,y,w,43,fill,6,'none')+txt(x+w/2,y+29,s,21,col,650,'middle');
const number=(x,y,n)=>circle(x,y,23,C.purple,'none')+txt(x,y+8,n,22,C.white,700,'middle');
const miniStore=(label='',brand=false,kind='retail')=>clean(storefront({label:'',branded:false,kind}))+(brand?rect(label?17:120,58,36,32,C.white,2,'none')+mark(label?21:124,61,28):'')+(label?txt(brand?66:140,82,label,22,C.white,650,brand?'start':'middle'):'');
const envelope=(w=300,h=210)=>rect(0,0,w,h,C.pale,9,C.ink,2)+path(`M0 0L${w/2} ${h*.54}L${w} 0M0 ${h}L${w*.35} ${h*.36}M${w} ${h}L${w*.65} ${h*.36}`,'none',C.ink,2);
const screen=(w,h,title,brand=false)=>rect(0,0,w,h,C.white,11,C.ink,2)+rect(0,0,w,48,C.pale,11,'none')+line(0,48,w,48,C.ink,2)+[20,37,54].map(x=>circle(x,24,4,C.purple,'none')).join('')+txt(80,31,title,22)+(brand?mark(w-62,65,35):'');
const phonePanel=(w=190,h=330,title='',brand=false)=>rect(0,0,w,h,C.white,22,C.ink,3)+rect(13,31,w-26,h-60,C.soft,6,'none')+line(w/2-23,15,w/2+23,15,C.ink,4)+line(w/2-25,h-15,w/2+25,h-15,C.ink,3)+(brand?mark(w/2-24,66,48):'')+(title?txt(w/2,150,title,24,C.purple,650,'middle'):'');
const checklist=(x,y,labels,w=260,dy=62)=>labels.map((s,i)=>check(x,y+i*dy-17,.9)+txt(x+40,y+i*dy,s,23)).join('');
const visitPlan=()=>rect(0,0,480,360,C.white,8,C.ink,2)+path('M35 35H445V325H35Z M35 179H233V35 M233 179H445 M233 179V325','none',C.ink,3)+rect(65,65,133,82,C.pale,3,'none')+rect(274,222,131,65,C.pale,3,'none')+path('M35 255H89A54 54 0 0 1 35 309','none',C.purple,2)+line(233,75,233,124,C.white,6);
const archiveBox=label=>path('M0 35H260V240H0Z',C.white,C.ink,2)+rect(-9,20,278,38,C.pale,4,C.ink,2)+rect(72,95,116,43,C.soft,5,C.ink,2)+txt(130,124,label,21,C.ink,600,'middle');
const brace=(x,y,h)=>path(`M${x} ${y}H${x+22}V${y+h/2-14}Q${x+22} ${y+h/2} ${x+40} ${y+h/2}Q${x+22} ${y+h/2} ${x+22} ${y+h/2+14}V${y+h}H${x}`,'none',C.mid,3);
const scenes=[];
const add=(slug,alt,concept,body)=>scenes.push({slug,alt,concept,body});

add('franchise-brand-ip-audit',
'A brand rights register brings together trademark, design and operating manual records with completed ownership checks.',
'Intellectual property is reviewed as a documented set of rights.',
base(0)+g(150,170,1,sheet('BRAND RIGHTS',{w:410,h:470,brand:true,rows:0})+checklist(30,135,['Trademark','Designs','Operating manuals'],340,82)+footer(410,431,'Ownership verified'))+card(655,185,360,185,txt(30,49,'Trademark',25)+rect(29,75,230,76,C.soft,7,'none')+txt(54,129,'Aa',48,C.purple,700)+txt(270,96,'™',36,C.purple))+card(655,415,360,202,txt(30,48,'Rights register',25)+rules(30,85,290,3,32)+check(300,160,1)));

add('franchise-confidential-knowhow',
'An operating manual is stored in a locked knowledge cabinet with three clearly defined access levels.',
'Protect operating knowledge with staged access and documented permissions.',
base(1)+card(150,155,390,490,heading('KNOWLEDGE LIBRARY',390,true)+[0,1,2].map(i=>rect(30,107+i*111,330,83,C.soft,5,'none')+txt(52,158+i*111,['Core manuals','Training records','Operating methods'][i],24)+circle(332,150+i*111,6,C.purple,'none')).join(''))+g(690,190,1,sheet('ACCESS RECORD',{w:340,h:420,rows:0})+checklist(28,137,['Review','Permission','Controlled access'],280,76)+footer(340,382,'Shared on agreed terms'))+g(488,416,.65,lock()));

add('franchise-offer-document',
'An open offer brochure shows the business format on one page and investment, support and responsibilities on the facing page.',
'An offer makes the important commercial and operating information readable together.',
base(2)+g(155,180,1,shadow(0,0,890,460)+path('M0 0H427Q445 0 445 19Q445 0 463 0H890V460H463Q445 460 445 478Q445 460 427 460H0Z',C.white,C.ink,2)+line(445,24,445,452,C.mid,2)+mark(31,29,40)+txt(91,57,'THE BUSINESS',26,C.ink,700)+g(81,95,.86,miniStore('',false))+txt(481,59,'THE OPPORTUNITY',26,C.ink,700)+['Investment','Training and support','Operating responsibilities'].map((s,i)=>txt(482,139+i*100,s,25)+rules(482,166+i*100,360,2,20)).join('')));

add('pricing-initial-franchise-fee',
'An itemised initial fee worksheet separates brand rights, training and opening support before the total.',
'Build an initial franchise fee from clearly defined deliverables.',
base(3)+g(230,135,1,sheet('INITIAL FRANCHISE FEE',{w:580,h:520,brand:true,rows:0})+['Brand rights','Training','Opening support'].map((s,i)=>txt(32,135+i*90,s,27)+line(395,128+i*90,535,128+i*90,C.mid,4)).join('')+line(30,380,550,380,C.ink,2)+rect(30,408,520,74,C.pale,5,'none')+txt(54,456,'Agreed fee',29,C.purple,700)+txt(518,456,'₹',40,C.purple,700,'end'))+g(850,418,1.05,clean(calculator()))+g(119,476,.65,clean(coins(5))));

add('designing-franchise-royalty-structure',
'A royalty statement records the sales basis and reporting period beside a monthly calendar and an operating outlet.',
'Royalty design ties recurring fees to a defined calculation and reporting cycle.',
base(0)+g(150,303,.98,miniStore('',true))+g(586,155,1,sheet('ROYALTY STATEMENT',{w:450,h:470,rows:0})+txt(30,145,'%',64,C.purple,700)+txt(120,127,'Agreed basis',27)+rules(120,155,290,2,22)+line(30,216,420,216,C.pale,2)+txt(30,265,'Sales reported',25)+txt(30,328,'Period confirmed',25)+check(371,241,1)+check(371,306,1)+footer(450,429,'Recurring reporting cycle'))+tag(182,170,221,'Monthly review'));

add('franchisor-support-budget',
'A support budget divides planned expenditure among team capacity, field visits, systems and training.',
'Budget the delivery of support before expanding the franchise network.',
base(1)+card(155,160,890,460,heading('SUPPORT BUDGET',890,true)+['Team','Field visits','Systems','Training'].map((s,i)=>txt(35,143+i*78,s,26)+rect(237,115+i*78,[460,310,260,370][i],37,[C.purple,C.mid,C.pale,C.mid][i],4,'none')+line(237,157+i*78,815,157+i*78,C.soft,2)).join('')+txt(793,420,'₹',34,C.purple,700)));

add('responsible-franchise-financial-illustrations',
'A financial chart distinguishes recorded results from a shaded illustrative range and lists the assumptions underneath.',
'Financial illustrations retain a clear boundary between evidence and projections.',
base(0)+card(140,140,920,500,heading('FINANCIAL ILLUSTRATION',920,true)+line(65,363,855,363,C.mid,2)+line(65,111,65,363,C.mid,2)+path('M66 315L154 280L249 296L350 245L430 259','none',C.purple,5)+path('M430 259L552 205L680 176L850 120V307L680 285L552 279Z',C.pale,'none')+path('M430 259L552 242L680 229L850 219','none',C.purple,4,'stroke-dasharray="8 9"')+line(430,110,430,366,C.mid,2,'stroke-dasharray="6 7"')+txt(153,405,'Recorded results',25)+txt(572,405,'Illustrative range',25)+footer(920,466,'Sources, assumptions and limits stay visible')));

add('ideal-franchisee-profile',
'A franchise operator profile scores practical skills, available time, financial readiness and operating responsibility.',
'Define candidate suitability against the work that the business needs.',
base(3)+card(185,150,830,500,heading('OPERATOR PROFILE',830,true)+['Practical skills','Time to operate','Financial readiness','Responsibility'].map((s,i)=>txt(35,143+i*85,s,27)+[0,1,2,3,4].map(j=>rect(385+j*72,116+i*85,50,35,j<[4,5,3,4][i]?C.purple:C.pale,4,'none')).join('')).join('')+footer(830,467,'Evidence of fit, rather than a generic profile')));

add('franchise-recruitment-channel-plan',
'Website, events and referrals feed a source comparison table that separates total enquiries from qualified candidates.',
'Evaluate recruitment channels by useful candidate quality.',
base(1)+card(145,165,910,470,heading('CHANNEL REVIEW',910,true)+txt(461,126,'Enquiries',24)+txt(682,126,'Qualified',24)+['Website','Events','Referrals'].map((s,i)=>txt(31,204+i*99,s,27)+rect(449,177+i*99,[160,110,90][i],37,C.pale,4,'none')+rect(681,177+i*99,[90,83,75][i],37,C.purple,4,'none')+line(30,243+i*99,880,243+i*99,C.soft,2)).join('')));

add('franchise-qualification-calls',
'A telephone enquiry and a structured call record identify the business fit, unanswered questions and an agreed next step.',
'Useful first calls have clear questions and a documented next action.',
base(2)+g(185,205,1.1,phonePanel(195,350,'First call',false)+circle(97.5,244,40,C.pale,'none')+path('M80 223Q65 244 85 263Q105 282 120 265L109 252L100 258Q85 250 85 240L92 234Z',C.purple,'none'))+g(535,155,1,sheet('CALL RECORD',{w:460,h:480,brand:true,rows:0})+checklist(32,147,['Business fit','Open questions','Next action'],390,87)+footer(460,438,'A useful two-way conversation')));

add('franchise-discovery-day-agenda',
'A discovery visit floor plan identifies the outlet counter, operations area and review space beside a three-step visit agenda.',
'Discovery visits connect practical observation with informed questions.',
base(0)+g(145,230,1,visitPlan()+number(124,106,'1')+number(335,107,'2')+number(334,259,'3'))+g(710,150,1,sheet('VISIT AGENDA',{w:345,h:490,brand:true,rows:0})+['See the outlet','Review operations','Ask your questions'].map((s,i)=>txt(30,145+i*103,'0'+(i+1),23,C.purple,700)+txt(30,182+i*103,s,24))+footer(345,451,'Observe the working business')));

add('franchise-candidate-reference-checks',
'Two reference records are compared against one permission-based candidate review with matching questions.',
'Consistent, relevant questions make reference checks fair and useful.',
base(3)+g(150,165,1,sheet('REFERENCE A',{w:320,h:360,rows:3}))+g(240,310,1,sheet('REFERENCE B',{w:320,h:360,rows:3}))+g(680,155,1,sheet('CANDIDATE REVIEW',{w:370,h:485,brand:true,rows:0})+checklist(30,143,['Permission recorded','Relevant experience','Consistent questions'],310,90)+footer(370,445,'Evidence considered together')));

add('franchise-crm-pipeline-stages',
'A recruitment board organises candidate cards into enquiry, review, meeting and agreement stages.',
'Clear CRM stages represent decisions and next actions.',
base(0)+card(115,165,970,460,heading('FRANCHISE RECRUITMENT',970,true)+['Enquiry','Review','Meeting','Agreed'].map((s,j)=>g(25+j*237,105,1,rect(0,0,210,316,C.soft,7,'none')+txt(105,35,s,25,C.ink,650,'middle')+[0,1].slice(0,j===3?1:2).map((n)=>rect(17,65+n*111,176,87,C.white,6,C.mid,1.7)+line(34,90+n*111,164,90+n*111,C.mid,3)+line(34,114+n*111,145,114+n*111,C.pale,3)+circle(163,132+n*111,5,C.purple,'none')).join('')+(j===3?check(90,216,1.5):''))).join('')));

add('franchise-enquiry-response-playbook',
'An incoming enquiry is paired with a response guide that sets ownership, a useful answer and a follow-up time.',
'Respond with relevant information and a clear owner.',
base(1)+g(153,356,1,envelope(340,233))+g(188,206,1,sheet('ENQUIRY',{w:268,h:260,rows:2}))+g(607,150,1,sheet('RESPONSE GUIDE',{w:440,h:490,brand:true,rows:0})+checklist(30,147,['Assign an owner','Answer the question','Agree a follow-up'],380,92)+footer(440,449,'Clear, respectful communication')));

add('franchise-proposal-version-control',
'Two earlier proposals are kept behind the approved current proposal, with a visible version record.',
'Use one approved source of commercial information.',
base(2)+g(150,245,1,sheet('VERSION 1',{w:315,h:350,rows:3}))+g(390,198,1,sheet('VERSION 2',{w:315,h:400,rows:3}))+g(670,147,1,sheet('CURRENT PROPOSAL',{w:390,h:490,brand:true,rows:4,checked:true})+tag(27,410,335,'Approved information',C.purple,C.white)));

add('franchise-broker-relationship-management',
'A referral agreement records brand, intermediary and candidate responsibilities alongside approved claims and fee terms.',
'Intermediary relationships need explicit responsibilities and boundaries.',
base(3)+card(160,145,880,490,heading('REFERRAL AGREEMENT',880,true)+['Brand','Intermediary','Candidate'].map((s,i)=>tag(30+i*280,108,250,s)).join('')+line(30,196,850,196,C.pale,2)+['Introductions','Approved claims','Fees and responsibility'].map((s,i)=>check(35,238+i*80,1)+txt(82,255+i*80,s,27)+line(500,250+i*80,820,250+i*80,C.mid,3)).join('')+footer(880,454,'The agreed scope travels with every introduction')));

add('franchise-onboarding-handover',
'A handover folder holds the signed commitments, opening schedule and unresolved items for the operations team.',
'Commercial commitments must reach the people delivering the opening.',
base(1)+g(220,244,1.65,clean(folder('Handover')))+g(299,142,1,sheet('AGREED COMMITMENTS',{w:410,h:370,brand:true,rows:3,checked:true}))+card(798,235,255,355,heading('OPEN ITEMS',255)+[0,1,2].map(i=>circle(34,112+i*75,9,C.white,C.purple,2)+line(62,111+i*75,220,111+i*75,C.mid,3)+line(62,133+i*75,195,133+i*75,C.pale,3)).join('')));

add('franchise-first-90-days',
'A 90-day opening programme is organised into routines, operating reviews and issue resolution, alongside the new outlet.',
'Opening support continues through the first operating period.',
base(0)+card(148,160,520,470,heading('FIRST 90 DAYS',520,true)+['30','60','90'].map((n,i)=>number(61,142+i*118,n)+txt(113,149+i*118,['Establish routines','Review performance','Resolve issues'][i],28)).join('')+line(61,169,61,235,C.mid,2)+line(61,287,61,353,C.mid,2))+g(752,279,.98,miniStore('OPEN',false)));

add('franchise-support-team-capacity',
'A weekly support capacity board allocates time for field work, training and systems support across five days.',
'Support commitments are planned against real available capacity.',
base(2)+card(140,160,920,480,heading('SUPPORT CAPACITY',920,true)+['Mon','Tue','Wed','Thu','Fri'].map((s,j)=>txt(340+j*114,124,s,24,C.ink,600,'middle')).join('')+['Field visits','Training','Systems'].map((s,i)=>txt(30,204+i*90,s,26)+[0,1,2,3,4].map(j=>rect(293+j*114,170+i*90,94,51,(i+j)%3===0?C.purple:(i+j)%3===1?C.mid:C.pale,5,'none')).join('')).join('')+footer(920,446,'Plan time before adding commitments')));

add('franchise-field-visit-planning',
'A field visit checklist is paired with an outlet plan and three mapped observation points.',
'Prepare evidence, coaching and follow-through for every field visit.',
base(1)+g(148,260,.92,miniStore('',false))+g(565,140,1,sheet('FIELD VISIT',{w:475,h:500,brand:true,rows:0})+checklist(31,144,['Review the operation','Record observations','Agree useful actions'],400,94)+footer(475,457,'Check progress at the next visit'))+tag(170,175,263,'Outlet review'));

add('franchise-train-the-trainer',
'A training master workbook is replicated into a local practice workbook and an assessment record.',
'Training capability spreads through consistent practice and assessment.',
base(3)+g(125,180,1,sheet('MASTER WORKBOOK',{w:305,h:410,brand:true,rows:3}))+g(451,230,1,sheet('LOCAL PRACTICE',{w:305,h:410,rows:3,checked:true}))+g(778,180,1,sheet('ASSESSMENT',{w:305,h:410,rows:3,checked:true}))+tag(167,127,220,'Demonstrate')+tag(493,661,220,'Practise')+tag(820,127,220,'Confirm ability'));

add('franchise-sop-usability-testing',
'A work instruction is tested against a three-step task, with an unclear step marked for revision.',
'Operating instructions should be tested by doing the work.',
base(0)+g(150,145,1,sheet('WORK INSTRUCTION',{w:480,h:500,brand:true,rows:0})+['Prepare','Perform','Confirm'].map((s,i)=>number(55,139+i*112,String(i+1))+txt(102,147+i*112,s,29)+rules(102,173+i*112,315,1)).join(''))+card(729,224,315,340,heading('USABILITY TEST',315)+checklist(28,132,['Clear','Repeatable'],260,67)+tag(25,251,265,'Revise unclear steps',C.pale,C.purple)));

add('franchise-quality-audit-design',
'A quality audit risk matrix highlights critical requirements beside an evidence checklist.',
'Prioritise audit attention using risk and observable evidence.',
base(3)+card(145,168,520,470,heading('AUDIT PRIORITIES',520,true)+[0,1,2].map(i=>[0,1,2].map(j=>rect(57+j*135,112+i*88,122,76,i===0&&j===2?C.purple:i+j===2?C.mid:C.pale,4,'none')).join('')).join('')+txt(386,164,'!',38,C.white,700,'middle')+txt(260,431,'Increasing likelihood',24,C.ink,500,'middle'))+g(742,213,1,sheet('EVIDENCE',{w:315,h:389,rows:3,checked:true})));

add('franchise-corrective-action-process',
'An action record tracks a problem through its cause, corrective work and verified closure with an evidence field.',
'A corrective action is complete only after the result is verified.',
base(1)+card(145,165,910,470,heading('CORRECTIVE ACTION RECORD',910,true)+['Find the cause','Make the fix','Verify the result'].map((s,i)=>g(30+i*290,115,1,rect(0,0,268,218,C.soft,8,'none')+number(37,42,String(i+1))+txt(22,100,s,24)+rules(23,133,214,3,27))).join('')+line(35,377,875,377,C.pale,2)+txt(35,422,'Evidence retained',26)+check(830,399,1.1)));

add('franchise-supplier-approval-process',
'A supplier review pairs an identified sample with documented product specification, capacity and delivery checks.',
'Approve suppliers against evidence before network purchasing.',
base(2)+g(160,395,1,archiveBox('SAMPLE'))+g(177,279,.68,clean(box()))+g(585,147,1,sheet('SUPPLIER APPROVAL',{w:460,h:490,brand:true,rows:0})+checklist(30,143,['Product specification','Capacity','Delivery reliability'],390,95)+tag(29,409,402,'Approval recorded',C.pale,C.purple)));

add('franchise-procurement-price-transparency',
'An itemised delivered-cost invoice separates the product price, freight and other charges beside the shipment.',
'The construction of purchasing costs should be visible to partners.',
base(3)+g(150,387,1.03,archiveBox('DELIVERY'))+g(585,145,1,sheet('DELIVERED COST',{w:460,h:500,brand:true,rows:0})+['Product price','Freight','Other charges'].map((s,i)=>txt(30,141+i*87,s,27)+line(304,134+i*87,424,134+i*87,C.mid,3)).join('')+line(29,360,431,360,C.ink,2)+rect(28,390,404,75,C.pale,4,'none')+txt(49,439,'Total',30,C.purple,700)+txt(403,439,'₹',36,C.purple,700,'end')));

add('franchise-inventory-replenishment',
'A stock-level chart crosses a reorder threshold beside neatly arranged stock shelves and an incoming delivery.',
'Replenishment uses demand, lead time and reorder levels.',
base(0)+card(150,190,360,440,heading('STOCK ON HAND',360,true)+[0,1,2].map(i=>line(25,191+i*99,335,191+i*99,C.ink,2)+[0,1,2].slice(0,3-i).map(j=>rect(43+j*95,121+i*99,68,70,C.pale,3,C.ink,1.8)+line(77+j*95,121+i*99,77+j*95,143+i*99,C.purple,3)).join('')).join(''))+card(616,155,430,300,heading('REORDER LEVEL',430)+line(40,237,390,237,C.mid,2)+path('M45 113L118 145L192 158L269 205L382 222','none',C.purple,4)+line(40,180,390,180,C.mid,3,'stroke-dasharray="7 7"')+txt(40,274,'Reorder before stock runs low',21))+g(701,513,.92,clean(truck())));

add('franchise-menu-assortment-localisation',
'A consistent core offer is shown next to a separately defined local test with feedback and approval checks.',
'Test local adaptations without losing the core offer.',
base(2)+card(145,170,460,470,heading('CORE OFFER',460,true)+[0,1,2,3].map(i=>g(35+(i%2)*210,110+Math.floor(i/2)*149,1,rect(0,0,180,124,C.soft,6,'none')+circle(90,51,28,i===2?C.mid:C.pale,C.purple,2)+line(39,99,141,99,C.mid,3))).join(''))+card(710,220,335,370,heading('LOCAL TEST',335)+circle(168,148,57,C.pale,C.purple,2)+check(153,129,1.2)+txt(168,244,'Customer feedback',24,C.ink,600,'middle')+tag(28,285,279,'Review before rollout')));

add('franchise-territory-allocation-policy',
'A planning map defines three separate territories and links each boundary to clear location and channel rules.',
'Territory rights need precise boundaries and a documented policy.',
base(1)+card(145,205,465,390,txt(28,49,'TERRITORY PLAN',25,C.ink,700)+path('M30 100L165 84L215 213L144 335L30 340Z',C.pale,C.ink,2)+path('M165 84L308 100L326 257L215 213Z',C.mid,C.ink,2)+path('M308 100L434 80V338L326 257Z',C.soft,C.ink,2)+txt(98,212,'A',34,C.purple,700)+txt(248,185,'B',34,C.purple,700)+txt(367,211,'C',34,C.purple,700))+g(700,153,1,sheet('TERRITORY RULES',{w:350,h:490,brand:true,rows:0})+checklist(28,144,['Locations','Sales channels','Development rights'],290,95)+footer(350,448,'Agreed boundaries')));

add('franchise-site-approval-scorecard',
'A measured premises plan is reviewed against access, services, demand and lease constraints.',
'Site approval records both commercial fit and critical constraints.',
base(0)+g(140,238,1,visitPlan()+mark(342,64,42))+g(705,150,1,sheet('SITE SCORECARD',{w:350,h:490,rows:0})+checklist(28,140,['Access','Utilities','Demand','Lease terms'],300,76)+footer(350,449,'Critical constraints checked')));

add('franchise-rollout-capex-control',
'A fit-out drawing, comparable quotations and an approved budget are arranged as a coordinated opening-cost review.',
'Control opening costs through scope, quote comparison and change approval.',
base(2)+g(150,220,1,visitPlan()+mark(342,65,40))+g(688,152,1,sheet('QUOTE A',{w:315,h:330,rows:3}))+g(790,333,1,sheet('QUOTE B',{w:290,h:323,rows:3}))+tag(174,633,420,'Measured scope · Approved changes')+g(183,155,.88,clean(ruler())));

add('franchise-local-marketing-toolkit',
'A coordinated local marketing kit combines a branded opening poster, mobile content template and editable promotional sheet.',
'Give outlets approved assets that can be adapted for local use.',
base(3)+card(165,153,440,490,mark(31,31,45)+txt(33,145,'YOUR LOCAL',35,C.ink,700)+txt(33,190,'BUSINESS',43,C.purple,700)+rect(32,230,376,165,C.pale,7,'none')+g(130,228,.47,miniStore('',false))+rules(34,438,320,2,21))+g(676,265,1,phonePanel(185,338,'Now open',false)+rect(29,191,128,73,C.mid,4,'none'))+card(904,178,180,255,txt(23,51,'Local offer',24)+rect(23,75,134,93,C.pale,4,'none')+rules(23,199,134,2,22)));

add('franchise-marketing-fund-governance',
'A pooled marketing fund ledger shows outlet contributions, allocated activity and a transparent reporting record.',
'Shared marketing funds require visible contribution and spending rules.',
base(0)+card(150,165,900,470,heading('MARKETING FUND',900,true)+txt(31,132,'Contributions',26)+[0,1,2].map(i=>txt(32,192+i*68,['Outlet A','Outlet B','Outlet C'][i],24)+line(161,186+i*68,280,186+i*68,C.mid,4)).join('')+line(322,109,322,357,C.pale,2)+txt(362,132,'Allocation',26)+g(461,249,1,circle(0,0,84,C.pale,'none')+path('M0 0V-84A84 84 0 0 1 78 32Z',C.purple,'none')+path('M0 0L78 32A84 84 0 0 1-37 76Z',C.mid,'none'))+line(594,109,594,357,C.pale,2)+txt(629,132,'Reporting',26)+rules(630,189,230,4,42)+footer(900,433,'Contribution, use and oversight recorded together')));

add('franchise-digital-asset-ownership',
'Website, local profile and advertising accounts sit in an ownership register with assigned access and handover checks.',
'Clarify ownership of every business account before access is shared.',
base(1)+card(135,162,930,475,heading('DIGITAL OWNERSHIP REGISTER',930,true)+['Website','Local profile','Advertising'].map((s,i)=>g(31+i*298,119,1,screen(272,231,s,false)+txt(25,103,'Owner assigned',22)+check(225,84,.9)+txt(25,160,'Access recorded',22)+check(225,140,.9)+line(25,192,245,192,C.pale,2))).join('')+footer(930,437,'Documented ownership · Controlled access · Handover')));

add('franchise-local-seo-network',
'A local search page displays useful business details beside a map of distinct outlet locations.',
'Local discoverability depends on accurate, helpful location information.',
base(3)+g(140,155,1,screen(490,480,'Local search',true)+rect(28,76,359,49,C.soft,25,'none')+txt(49,109,'Find a business nearby',23)+['Location page','Opening hours','Contact details'].map((s,i)=>rect(29,159+i*95,54,54,C.pale,6,'none')+txt(106,182+i*95,s,25)+line(106,207+i*95,447,207+i*95,C.mid,3)).join(''))+card(713,224,340,340,path('M22 230L100 180L189 224L315 89','none',C.mid,18)+path('M67 33L120 110L93 297M195 33L209 106L285 289','none',C.pale,21)+[ [91,178],[189,223],[285,121] ].map(([x,y])=>circle(x,y,17,C.purple,'none')+circle(x,y,5,C.white,'none')).join('')+txt(170,314,'Distinct outlet locations',22,C.ink,600,'middle')));

add('franchise-crm-data-retention',
'A secured enquiry archive has a review date and a documented retention decision, including deletion when no longer needed.',
'Enquiry records need controlled access and a defined retention lifecycle.',
base(0)+card(145,180,350,440,heading('ENQUIRY ARCHIVE',350,true)+[0,1,2].map(i=>rect(27,109+i*91,296,70,C.soft,5,'none')+line(49,132+i*91,263,132+i*91,C.mid,3)+line(49,155+i*91,230,155+i*91,C.pale,3)+circle(295,144+i*91,5,C.purple,'none')).join(''))+g(620,157,1,sheet('RETENTION REVIEW',{w:430,h:480,rows:0})+checklist(30,142,['Access checked','Purpose reviewed','Retention decided'],365,91)+tag(29,402,372,'Delete when no longer needed'))+g(435,468,.61,clean(lock())));

add('choosing-franchise-consultant-for-your-brand',
'A consultant comparison worksheet reviews scope, deliverables, responsibilities and fees across three proposals.',
'Choose consulting support through clear deliverables and retained responsibilities.',
base(2)+card(143,145,914,500,heading('CONSULTANT COMPARISON',914,true)+['A','B','C'].map((s,j)=>txt(485+j*153,124,s,26,C.purple,700,'middle')).join('')+['Scope','Deliverables','Responsibilities','Fees'].map((s,i)=>txt(33,204+i*73,s,27)+[0,1,2].map(j=>check(470+j*153,183+i*73,.95)).join('')+line(31,228+i*73,883,228+i*73,C.soft,2)).join('')));

add('franchise-conflict-escalation',
'A shared issue record sits between two sets of observations and follows a documented route to resolution.',
'Keep facts, responsibilities and next steps visible during escalation.',
base(1)+g(133,256,1,sheet('OBSERVATIONS',{w:270,h:350,rows:3}))+g(797,256,1,sheet('RESPONSE',{w:270,h:350,rows:3}))+g(395,151,1,sheet('SHARED CASE RECORD',{w:410,h:490,brand:true,rows:0})+checklist(29,140,['Agree the facts','Assign responsibility','Record the next step'],350,98)+tag(28,409,354,'Resolution documented')));

add('franchise-outlet-financial-reporting',
'Comparable outlet records feed a network report that distinguishes sales, profit and cash in the same reporting period.',
'Common definitions make financial reporting comparable across outlets.',
base(3)+g(145,150,1,sheet('OUTLET A',{w:295,h:300,rows:2}))+g(200,332,1,sheet('OUTLET B',{w:295,h:300,rows:2}))+card(580,150,480,490,heading('NETWORK REPORT',480,true)+['Sales','Profit','Cash'].map((v,i)=>txt(29,143+i*96,v,26)+rect(135,116+i*96,[290,162,211][i],39,[C.pale,C.mid,C.purple][i],4,'none')).join('')+footer(480,449,'Same period. Same definitions.')));

add('franchise-underperformance-support',
'A performance review identifies a falling trend and pairs the evidence with a targeted support plan and review checkpoints.',
'Diagnose the cause before agreeing practical recovery actions.',
base(0)+card(145,175,430,445,heading('PERFORMANCE REVIEW',430,true)+line(34,294,394,294,C.mid,2)+path('M38 137L127 172L211 158L297 238L390 265','none',C.purple,5)+txt(30,348,'Review the causes',25)+rules(30,380,360,2,21))+g(673,145,1,sheet('SUPPORT PLAN',{w:380,h:495,rows:0})+checklist(29,140,['Diagnose','Agree actions','Review progress'],320,100)+footer(380,453,'Evidence before assumptions')));

add('multi-unit-operator-assessment',
'An existing outlet and two additional locations are connected to an assessment of people, cash and operating controls.',
'Multi-unit growth requires management depth and reliable systems.',
base(2)+g(145,328,.87,miniStore('EXISTING',true))+g(545,332,.86,miniStore('NEXT OUTLET',false))+g(899,354,.62,miniStore('',false))+card(260,133,679,135,txt(30,47,'MULTI-UNIT READINESS',25,C.ink,700)+['People','Cash','Controls'].map((s,i)=>check(31+i*215,82,.85)+txt(71+i*215,99,s,25)).join('')));

add('franchise-renewal-review-process',
'A franchise agreement is checked against operating history, future investment and the next renewal deadline.',
'Start a structured renewal review before the agreement expires.',
base(1)+g(150,155,1,sheet('AGREEMENT REVIEW',{w:460,h:480,brand:true,rows:0})+checklist(29,143,['Operating history','Future investment','Renewal conditions'],390,96)+footer(460,438,'Review before the deadline'))+card(730,230,315,340,rect(0,0,315,70,C.purple,10,'none')+txt(157.5,46,'RENEWAL',27,C.white,700,'middle')+line(65,-15,65,23,C.ink,6)+line(250,-15,250,23,C.ink,6)+txt(157.5,179,'Review date',30,C.purple,700,'middle')+rules(42,232,231,2,31)+check(138,285,1.3)));

add('franchise-exit-debranding-handover',
'A storefront has a plain replacement sign while the removed branded sign and a handover record are placed beside it.',
'An orderly exit covers debranding, records, keys and digital access.',
base(3)+g(150,265,1.02,miniStore('',false))+card(172,184,244,65,mark(20,12,42)+line(86,33,217,33,C.mid,4),4)+g(612,145,1,sheet('EXIT HANDOVER',{w:440,h:495,rows:0})+checklist(30,139,['Signage and branding','Business records','Keys and access','Digital accounts'],370,75)+footer(440,452,'Agreed handover completed')));

add('scaling-service-franchise-operations',
'A service dispatch board assigns appointment times and routes to a branded service vehicle and distinct customer stops.',
'Service operations scale through scheduling, repeatable work and dispatch discipline.',
base(0)+card(145,145,910,300,heading('SERVICE DISPATCH',910,true)+['09:00','11:30','14:00'].map((s,i)=>txt(32,134+i*62,s,27)+rect(170,108+i*62,508,37,[C.pale,C.mid,C.pale][i],4,'none')+check(789,111+i*62,.9)).join(''))+g(187,523,.98,clean(truck()))+line(566,599,1003,599,C.mid,3)+[658,821,985].map((x,i)=>circle(x,599,19,C.purple,'none')+txt(x,606,String(i+1),20,C.white,700,'middle')).join(''));

if(scenes.length!==44)throw Error('Expected 44 C-group illustrations');
for(const scene of scenes){
 const marks=scene.body.match(/<use\s+href="#brandmark"[^>]*\/>/g)||[];
 if(marks.length!==1)throw Error(`${scene.slug} has ${marks.length} brandmarks; expected one`);
 if(/undefined|NaN/.test(scene.body))throw Error(`Invalid geometry: ${scene.slug}`);
}
export {scenes};
