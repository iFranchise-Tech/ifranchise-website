export class IntakeRequestError extends Error {}
export function submissionError(error){
 if(error instanceof IntakeRequestError)return error.message;
 if(error?.name==='TimeoutError'||error?.name==='AbortError')return 'The request took too long. Your details are still here—please try again.';
 return 'We could not confirm your submission. Your details are still here—check your connection and try again.';
}
export async function readIntakeResponse(response){
 const fallback='Your submission could not be confirmed. Please try again.';
 if(response.redirected||!response.headers.get('content-type')?.toLowerCase().includes('application/json'))throw new IntakeRequestError(fallback);
 let data;try{data=await response.json()}catch{throw new IntakeRequestError(fallback)}
 if(!response.ok){
  const known={application_unconfirmed:'We could not confirm that your application and résumé were saved securely. Keep this form open and try again with the same résumé. If this continues, contact contact@ifranchise.in.',sheets_unconfirmed:'We could not confirm your enquiry was saved. Your details are still here—please try again.',privacy_unavailable:'Online privacy requests are currently unavailable. Please email contact@ifranchise.in.',applications_unavailable:'Online applications are temporarily unavailable while secure résumé uploads are configured. Please contact contact@ifranchise.in.'};
  if(response.status===503&&Object.hasOwn(known,data?.code))throw new IntakeRequestError(known[data.code]);
  const message=data?.error;
  // Display validation/retry guidance only, never HTML, a server stack or raw exception.
  const safe=response.status<500&&typeof message==='string'&&message.length<=240&&!/[<>]|SyntaxError|TypeError|Unexpected token|\bat .+\(.+:\d+/i.test(message);
  throw new IntakeRequestError(safe?message:fallback);
 }
 return data;
}
export async function readReceipt(response){
 const data=await readIntakeResponse(response);
 if(data?.received!==true||typeof data.reference!=='string'||!data.reference.trim())throw new IntakeRequestError('Your submission could not be confirmed. Please try again.');
 return data;
}
