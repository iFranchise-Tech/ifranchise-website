// Page and RSC navigation should go straight to rendering, without an asset miss.
export function isStaticAssetRequest(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  const {pathname} = new URL(request.url);
  if (pathname.startsWith('/api/')) return false;
  return /\.(?:js|mjs|css|svg|ico|png|jpe?g|webp|avif|gif|woff2?|ttf|otf|mp4|webm|vtt|txt|json|webmanifest|pdf|map)$/i.test(pathname);
}
