import vinext from 'vinext';
import {defineConfig} from 'vite';

// The previous Sites preview config is kept in vite.config.sites.ts.
// This file is the Cloudflare Workers development and build config.
export default defineConfig(async () => {
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= 'false';
  process.env.WRANGLER_SEND_METRICS ??= 'false';
  const {cloudflare} = await import('@cloudflare/vite-plugin');
  return {
    server: {host: 'localhost', port: 3019, strictPort: true, watch: {usePolling: true}},
    optimizeDeps: {exclude: ['lucide-react']},
    plugins: [vinext(), cloudflare({configPath: 'wrangler.jsonc', viteEnvironment: {name: 'rsc', childEnvironments: ['ssr']}, inspectorPort: false})],
  };
});
