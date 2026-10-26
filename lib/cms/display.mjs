// Shared non-destructive display settings. Original uploads are never rewritten.
export const defaultPresentation={fit:'cover',x:50,y:50,zoom:1,ratio:'original',width:100};
export function imageStyle(p={}){return {objectFit:p.fit||'cover',objectPosition:`${p.x??50}% ${p.y??50}%`,transform:`scale(${p.zoom??1})`};}
export function frameStyle(p={}){return {overflow:'hidden',...(p.ratio&&p.ratio!=='original'?{aspectRatio:p.ratio}:{}),...(p.width?{width:p.width+'%',maxWidth:'100%'}:{})};}
export function selectedItems(ids,items,key='slug'){return ids===undefined?null:ids.map(id=>items.find(item=>item[key]===id)).filter(Boolean);}
export function resourceKey(item){return `${item.resourceType==='blog'?'blogs':item.resourceType==='video'?'videos':'articles'}:${item.slug}`;}
export function applyCommercial(b){const f={...b.facts},s=b.spaceRequirement;if(s){f.sqFt=s.mode==='range'?`${s.min.toLocaleString('en-IN')}–${s.max.toLocaleString('en-IN')} sq. ft.`:`${s.min.toLocaleString('en-IN')} sq. ft.`;}if(b.locationFormats)f.locationType=b.locationFormats.join(' / ');if(b.agreementYears!=null)f.agreementTerm=`${b.agreementYears} years`;if(b.lockInYears!=null)f.lockInPeriod=`${b.lockInYears} years`;if(b.outlets!=null)f.outlets=String(b.outlets);if(b.returnTerms)f.returns=formatReturns(b.returnTerms);return {...b,facts:f};}
export function editingIssues(kind,p,previous={}){
 const issues=[];const changed=key=>JSON.stringify(p[key])!==JSON.stringify(previous?.[key]);
 function limitQuestions(key){if(!changed(key))return;const rows=p[key]||[];if(rows.length>5)issues.push('Keep up to 5 FAQs. Existing entries are preserved until you choose which to remove.');if(rows.some(q=>q.q.length>100||q.a.length>400))issues.push('FAQ questions can contain 100 characters and answers 400 characters.');const normalized=rows.map(q=>q.q.trim().toLowerCase()).filter(Boolean);if(new Set(normalized).size!==normalized.length)issues.push('Each FAQ question must be different.');}
 if(kind==='franchises'){limitQuestions('faqs');if(changed('gallery')&&(p.gallery||[]).length>10)issues.push('Keep up to 10 gallery images before saving gallery changes.');if(changed('overview')&&(p.overview||'').length>1000)issues.push('About the brand must be 1,000 characters or fewer.');if(changed('highlights')&&(p.highlights||[]).some(x=>x.length>100))issues.push('Each brand highlight must be 100 characters or fewer.');}
 if(kind==='faqs'&&['homepage','list-your-brand','opportunities','contact-us'].includes(p.slug))limitQuestions('questions');
 return issues;
}

export function formatReturns(t){if(['share','higher'].includes(t.arrangement)&&t.margin==null||t.arrangement!=='share'&&t.guarantee==null)return 'Enter the values above to preview the return terms.';const share=`${t.margin}% margin on sales`,period=t.period==='annual'?'annually':'monthly',mg=t.guaranteeType==='percentage'?`${t.guarantee}% of total investment ${period}`:`₹${Number(t.guarantee).toLocaleString('en-IN')} ${period}`;const value=t.arrangement==='share'?share:t.arrangement==='minimum'?`Minimum guarantee of ${mg}`:t.arrangement==='higher'?`${share} or a minimum guarantee of ${mg}, whichever is higher`:`Fixed return of ${mg}`;return value+(t.note?'. '+t.note:'');}

export function homepageReading(items){return [items.find(a=>a.slug==='what-is-a-franchise'),items.find(a=>a.audience==='investor'&&a.slug!=='what-is-a-franchise'),items.find(a=>a.audience==='brand')].filter(Boolean);}
