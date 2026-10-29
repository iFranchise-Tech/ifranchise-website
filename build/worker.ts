import handler from 'vinext/server/fetch-handler';
import {accessCredential, isStaffPath} from '../lib/access-gate.mjs';
import {withIntakeContext} from '../lib/intake/context';
import {verifyAccessToken} from '../lib/access-token.mjs';
export default {
  async fetch(request:Request, env:Cloudflare.Env, ctx:ExecutionContext) {
    const url = new URL(request.url);
    // Public pages and public APIs do not require a login.
    // Staff routes always require a verified Access token, including direct
    // origin requests. SITE_ACCESS=restricted is an optional whole-site lock.
    const siteLocked = !import.meta.env.DEV && env.SITE_ACCESS !== 'public';
    if (isStaffPath(url.pathname, request.method) || siteLocked) {
      const user = await verifyAccessToken(accessCredential(request), env);
      if (!user) {
        const status = siteLocked ? 403 : 401;
        const message = siteLocked
          ? 'Access is restricted. Configure your identity provider and sign in through the website domain.'
          : 'Sign in to continue.';
        return new Response(message, {status, headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
      }
    }
    // Static files are served only after the decision above. Route misses
    // continue to the application; never expose private uploads through ASSETS.
    if ((request.method === 'GET' || request.method === 'HEAD') && env.ASSETS) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }
    return withIntakeContext(ctx, () => handler.fetch(request, env, ctx));
  }
};
