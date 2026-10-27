// Only reusable site artwork, fonts and compiled assets. Never pages, uploads,
// API responses, intake sessions, employee data or account-dependent content.
export function isCacheableAsset(pathname){
 return /^\/_next\/static\/(?:chunks|css)\/[^/]+\.(?:js|css)$/.test(pathname)
  || /^\/optimized\/[a-zA-Z0-9-]+-[a-f0-9]{12}-\d+\.webp$/.test(pathname)
  || /^\/fonts\/(?:manrope|sora)-\d+\.woff2$/.test(pathname)
  || /^\/assets\/stock-heroes\/(?:mobile\/)?[a-z0-9-]+\.webp$/.test(pathname)
  || pathname==='/assets/home-hero/plan-to-presence.webp'
  || pathname==='/assets/ifranchise-wordmark.svg';
}

export function isCacheableResponse(response){
 return response.status===200 && !response.redirected && !response.headers.has('set-cookie')
  && /^(?:image\/|font\/|text\/(?:css|javascript)|application\/(?:javascript|octet-stream))/.test(response.headers.get('content-type')||'');
}
