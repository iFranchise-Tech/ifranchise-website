export const dynamic='force-dynamic';
function unavailable(){return Response.json({error:'Brochure downloads are no longer available. Please send an enquiry.'},{status:410,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export const GET=unavailable;
export const POST=unavailable;
