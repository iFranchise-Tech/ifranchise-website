import {cmsApiResponse} from '../lib/cms/api-response.mjs';
import handler from 'vinext/server/fetch-handler';
import {accessCredential, isAdminPagePath, isStaffPath} from '../lib/access-gate.mjs';
import {renderStaffSignIn} from '../lib/access-login.mjs';
import {localAdminLogoutResponse, localAdminSessionResponse, localAdminUserFromRequest} from '../lib/local-admin.mjs';
import {withIntakeContext} from '../lib/intake/context';
import {verifyAccessToken} from '../lib/access-token.mjs';
import {maintainEmailQueue} from '../lib/email/service';
import {isStaticAssetRequest} from '../lib/static-asset-request.mjs';
function noStore(response: Response) {
  const result = new Response(response.body, response);
  result.headers.set('Cache-Control', 'no-store');
  return result;
}
export default {
  async scheduled(_controller:ScheduledController, env:Cloudflare.Env, ctx:ExecutionContext) {
    ctx.waitUntil(maintainEmailQueue(env));
  },
  async fetch(request:Request, env:Cloudflare.Env, ctx:ExecutionContext) {
    return cmsApiResponse(request, async () => {
    const url = new URL(request.url);
    // Public pages and public APIs do not require a login.
    // Preview and production staff routes require a verified Access token.
    // A local development session is accepted only while this module is in dev
    // and the request hostname is localhost. That flag is false in a production build.
    const dev = import.meta.env.DEV === true;
    const localSession = await localAdminSessionResponse(request, env, dev);
    if (localSession) return localSession;
    const localLogout = await localAdminLogoutResponse(request, env, dev);
    if (localLogout) return localLogout;
    const siteLocked = !dev && env.SITE_ACCESS !== 'public';
    if (isStaffPath(url.pathname, request.method) || siteLocked) {
      let user = await verifyAccessToken(accessCredential(request), env);
      if (!user && dev) user = await localAdminUserFromRequest(request, env, true);
      if (!user) {
        const status = siteLocked ? 403 : 401;
        if (!siteLocked) {
          const page = renderStaffSignIn(request, env, {dev});
          if (page) return page;
          // RSC navigation must receive React's guarded login UI, never a
          // plain-text 401. The admin layout and every data route authorize
          // independently; this allows rendering the sign-in page only.
          if (isAdminPagePath(url.pathname) && ['GET', 'HEAD'].includes(request.method)) {
            return noStore(await withIntakeContext(ctx, () => handler.fetch(request, env, ctx)));
          }
        }
        const message = siteLocked
          ? 'Access is restricted. Configure your identity provider and sign in through the website domain.'
          : 'Sign in to continue.';
        return Response.json({error: message}, {status, headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
      }
    }
    // Serve files after authorization, without an extra asset lookup for pages/RSC.
    if (env.ASSETS && isStaticAssetRequest(request)) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }
    const response = await withIntakeContext(ctx, () => handler.fetch(request, env, ctx));
    if (isStaffPath(url.pathname, request.method) || url.pathname.startsWith('/cms/')) {
      const protectedResponse=noStore(response);
      protectedResponse.headers.set('Referrer-Policy','no-referrer');
      return protectedResponse;
    }
    return response;
    });
  }
};
