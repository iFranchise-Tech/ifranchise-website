import {brandReturns} from './cms/catalogue-fields.mjs';
export function returnDetails(brand){
 const t=brand.returnTerms;
 if(t){
  const amount=t.guaranteeType==='percentage'?`${t.guarantee}% of total investment`:`₹${Number(t.guarantee).toLocaleString('en-IN')}`;
  const payment=amount+(t.period==='annual'?' per year':' per month');
  return {guarantee:['minimum','higher'].includes(t.arrangement)?payment:null,share:['share','higher'].includes(t.arrangement)?`${t.margin}% margin on sales${t.arrangement==='higher'?' (whichever is higher)':''}`:null,fixed:t.arrangement==='fixed'?payment:null,note:t.note||'',legacy:null};
 }
 const text=brandReturns(brand);
 // Split only an unambiguous existing sentence; never infer a period or lose tiered conditions.
 const matched=text.match(/^Minimum Guarantee (₹[\d,.]+ (?:Lakhs |lakhs )?per month) or (\d+(?:\.\d+)?% revenue share \(whichever is higher\))$/i);
 return matched?{guarantee:matched[1],share:matched[2],fixed:null,note:'',legacy:null}:{guarantee:null,share:null,fixed:null,note:'',legacy:text};
}
export function outletLabel(brand){
 const raw=brand.outlets??brand.facts?.outlets??brand.facts?.totalOutlets;
 if(raw==null)return null;
 const value=String(raw).trim();
 if(!value||['--','-'].includes(value))return null;
 if(!/^\d/.test(value))return value.replace(/\s+outlets$/i,'');
 return /\b(outlets?|stores?)\b/i.test(value)?value:value+(value==='1'?' outlet':' outlets');
}
