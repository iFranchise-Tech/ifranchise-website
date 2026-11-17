import vinext from 'vinext';
import {defineConfig,type Plugin} from 'vite';
import {seoDecision} from './lib/seo-http.mjs';

// The previous Sites preview config is kept in vite.config.sites.ts.
// This file is the Cloudflare Workers development and build config.
function seoHttpPlugin():Plugin {
  return {
    name: 'ifranchise-seo-http',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const host = String(req.headers.host || '').replace(/:\d+$/, '');
        const url = new URL(req.url || '/', 'http://127.0.0.1');
        const decision = seoDecision({
          method: req.method,
          hostname: host,
          protocol: 'http',
          pathname: url.pathname,
          search: url.search,
          headers: req.headers,
        });
        if (decision?.status === 410) {
          res.statusCode = 410;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.end(req.method === 'HEAD' ? undefined : 'Gone');
          return;
        }
        if (decision?.status === 301 && decision.location) {
          res.statusCode = 301;
          res.setHeader('Location', decision.location);
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.end();
          return;
        }
        const writeHead = res.writeHead.bind(res);
        res.writeHead = ((status: number, ...args: unknown[]) => {
          const code = status === 308 && (!req.method || req.method === 'GET' || req.method === 'HEAD') ? 301 : status;
          return Reflect.apply(writeHead, res, [code, ...args]);
        }) as typeof res.writeHead;
        const end = res.end.bind(res);
        res.end = ((...args: unknown[]) => {
          if (res.statusCode === 308 && (!req.method || req.method === 'GET' || req.method === 'HEAD')) res.statusCode = 301;
          return Reflect.apply(end, res, args);
        }) as typeof res.end;
        next();
      });
    },
  };
}
export default defineConfig(async ({command}) => {
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= 'false';
  process.env.WRANGLER_SEND_METRICS ??= 'false';
  const {cloudflare} = await import('@cloudflare/vite-plugin');
  return {
    // Bind IPv4 loopback explicitly: `localhost` can resolve to ::1 alone,
    // making 127.0.0.1 fail. Browsers can reach this binding by either name.
    server: {host: '127.0.0.1', port: 3019, strictPort: false, watch: {usePolling: true}},
    // Bundle the icon library in development instead of loading thousands of
    // individual modules through the local Workers server for each session.
    optimizeDeps: {include: ['lucide-react']},
    plugins: [seoHttpPlugin(), vinext(), cloudflare({
      configPath: 'wrangler.jsonc',
      // Let Vite serve its virtual browser modules in development. Sending
      // these through the Worker first returns an HTML page instead of JS.
      ...(command === 'serve' ? {config: config => ({assets: {...config.assets, run_worker_first: false}})} : {}),
      viteEnvironment: {name: 'rsc', childEnvironments: ['ssr']},
      inspectorPort: false,
    })],
  };
});
