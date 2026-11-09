// Retain existing bookmarks and campaign parameters while canonicalizing brand URLs.
export function legacyBrandDestination(slug,query={},confirmation=false){
 const search=new URLSearchParams();
 for(const [key,value] of Object.entries(query)){
  for(const item of Array.isArray(value)?value:[value])if(typeof item==='string')search.append(key,item);
 }
 const path='/franchise-opportunities/'+encodeURIComponent(slug)+(confirmation?'/thank-you':'');
 return path+(search.size?'?'+search.toString():'');
}
