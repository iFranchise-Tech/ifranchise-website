import vinext from 'vinext';
import {defineConfig} from 'vite';

// The previous Sites preview config is kept in vite.config.sites.ts.
// This file is the Cloudflare Workers development and build config.
export default defineConfig(async () => {
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
    plugins: [vinext(), cloudflare({configPath: 'wrangler.jsonc', viteEnvironment: {name: 'rsc', childEnvironments: ['ssr']}, inspectorPort: false})],
  };
});
