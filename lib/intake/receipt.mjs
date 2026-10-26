export async function readReceipt(response){
 const fallback='Your submission could not be confirmed. Please try again.';
 let data;try{data=await response.json();}catch{throw Error(fallback);}
 if(!response.ok||data?.received!==true||typeof data.reference!=='string'||!data.reference.trim())throw Error(typeof data?.error==='string'?data.error:fallback);
 return data;
}
