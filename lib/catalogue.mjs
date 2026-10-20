export function filterBrands(brands,{query='',sector='all',budget='all',model='all',sort='featured'}={}){
 const result=brands.filter(b=>(b.name+' '+b.category).toLowerCase().includes(query.trim().toLowerCase())&&(sector==='all'||b.category===sector)&&(budget==='all'||b.investment!==null&&b.investment<=Number(budget))&&(model==='all'||(b.models||b.model.replace(/\s+MODEL/ig,'').split(/,\s*/)).map(x=>x.toUpperCase()).includes(model)));
 if(sort==='investment')result.sort((a,b)=>(a.investment??Infinity)-(b.investment??Infinity));
 if(sort==='name')result.sort((a,b)=>a.name.localeCompare(b.name));
 return result;
}
