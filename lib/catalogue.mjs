import {brandModels} from './cms/catalogue-fields.mjs';
export const investmentBands=[['25','Up to ₹25 lakh'],['50','Up to ₹50 lakh'],['100','Up to ₹1 crore'],['250','Up to ₹2.5 crore'],['500','Up to ₹5 crore'],['1000','Up to ₹10 crore']];
// Only the established numeric starting investment (in lakh) is comparable.
// Missing and free-text values must never become zero.
export function startingInvestment(b){return typeof b.investment==='number'&&Number.isFinite(b.investment)&&b.investment>=0?b.investment:null;}
export function catalogueOptions(brands){
 const sectors=[...new Set(brands.map(b=>b.category).filter(Boolean))].sort();
 const labels=[...new Set(brands.flatMap(brandModels))].sort();
 return {sectors,models:labels.map(v=>[v.toUpperCase(),v]),budgets:investmentBands.filter(([n])=>brands.some(b=>startingInvestment(b)!==null&&startingInvestment(b)<=Number(n))),suggestions:[...new Set([...brands.map(b=>b.name),...sectors].filter(Boolean))].sort()};
}
export function filterBrands(brands,{query='',sector='all',budget='all',model='all',sort='featured'}={}){
 const result=brands.filter(b=>String((b.name||'')+' '+(b.category||'')).toLowerCase().includes(query.trim().toLowerCase())&&(sector==='all'||b.category===sector)&&(budget==='all'||startingInvestment(b)!==null&&startingInvestment(b)<=Number(budget))&&(model==='all'||brandModels(b).map(x=>x.toUpperCase()).includes(model.toUpperCase())));
 if(sort==='investment')result.sort((a,b)=>(startingInvestment(a)??Infinity)-(startingInvestment(b)??Infinity));
 if(sort==='name')result.sort((a,b)=>(a.name||'').localeCompare(b.name||''));
 return result;
}
