import {normalizedStaffPath} from '../access-gate.mjs';
export function isCmsApiPath(pathname) {
  const path=normalizedStaffPath(pathname);
  return path==='/api/admin'||Boolean(path?.startsWith('/api/admin/'))||path==='/api/cms/access-help';
}
const jsonType=type=>/^(application\/json|application\/[\w.+-]+\+json)(?:\s*;|$)/i.test(type||'');
function errorResponse(status) {
  const error=status===401?'Your session has expired. Sign in again to continue.':status===403?'You do not have access to this section.':status===404?'This service could not be found. Please reload the portal and try again.':status===405?'This request method is not supported.':'The request could not be completed. Please try again.';
  return Response.json({error},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
/** Keep API route misses/framework failures out of the website HTML fallback. */
export async function cmsApiResponse(request, next) {
  const path=normalizedStaffPath(new URL(request.url).pathname);
  // These are navigational form actions, not JSON APIs.
  if(!isCmsApiPath(path)||['/api/admin/local-dev-session','/api/admin/local-dev-logout'].includes(path))return next();
  try {
    const response=await next(),type=response.headers.get('content-type');
    if(jsonType(type))return response;
    // Preserve authenticated resume downloads as a stream.
    if(['GET','HEAD'].includes(request.method)&&/^\/api\/admin\/intake\/resume\/[^/]+$/.test(path)&&response.ok&&type?.split(';')[0]==='application/pdf')return response;
    const status=response.status>=300&&response.status<400?401:response.ok?502:response.status;
    // No query strings, response bodies, credentials or submission data in logs.
    console.error('CMS API non-JSON response',{method:request.method,path,status});
    const failure=errorResponse(status);
    if(response.headers.has('allow'))failure.headers.set('Allow',response.headers.get('allow'));
    await response.body?.cancel();
    return failure;
  }catch{
    console.error('CMS API handler failed',{method:request.method,path});
    return errorResponse(500);
  }
}
