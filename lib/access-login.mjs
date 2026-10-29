export const STAFF_SIGN_IN_TITLE = 'Sign in';
export const STAFF_PORTAL_INTRO = 'This portal is for authorized iFranchise staff. Signing in uses Cloudflare Access and your @ifranchise.in work account. This page does not accept a password.';
export const STAFF_PORTAL_LOCAL = 'Cloudflare Access cannot finish sign-in on localhost. It only creates a session for the preview website.';
export const STAFF_PORTAL_UNCONFIGURED = 'Access is not configured for this environment yet, so this portal stays closed.';

export function isLocalHostname(hostname) {
  const host = String(hostname || '').replace(/^\[|\]$/g, '').toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.localhost');
}

export function accessIssuer(teamDomain) {
  try {
    const issuer = new URL(String(teamDomain || ''));
    if (issuer.protocol !== 'https:' || !issuer.hostname.endsWith('.cloudflareaccess.com')) return null;
    if (issuer.username || issuer.password || issuer.hostname.startsWith('your-team')) return null;
    return issuer.origin;
  } catch {
    return null;
  }
}

export function accessAudience(audience) {
  const value = String(audience || '').trim();
  if (!/^[a-f0-9]{32,64}$/i.test(value)) return null;
  return value;
}

export function accessLoginUrl({teamDomain, audience, redirectUrl} = {}) {
  const issuer = accessIssuer(teamDomain);
  const aud = accessAudience(audience);
  if (!issuer || !aud) return null;
  const login = new URL(`/cdn-cgi/access/login/${encodeURIComponent(aud)}`, issuer);
  if (redirectUrl) {
    try {
      const target = new URL(redirectUrl);
      if (target.protocol === 'https:' && !isLocalHostname(target.hostname)) login.searchParams.set('redirect_url', target.toString());
    } catch { /* a missing return URL still leaves a valid Access login */ }
  }
  return login.toString();
}

export function describeStaffSignIn({teamDomain, audience, requestUrl} = {}) {
  let local = true;
  let redirectUrl = '';
  try {
    const target = new URL(requestUrl);
    local = isLocalHostname(target.hostname);
    redirectUrl = target.toString();
  } catch { local = true; }
  const configured = Boolean(accessIssuer(teamDomain) && accessAudience(audience));
  const href = configured && !local ? accessLoginUrl({teamDomain, audience, redirectUrl}) : null;
  const paragraphs = [STAFF_PORTAL_INTRO, local ? STAFF_PORTAL_LOCAL : '', configured ? '' : STAFF_PORTAL_UNCONFIGURED].filter(Boolean);
  return {title: STAFF_SIGN_IN_TITLE, configured, local, href, paragraphs, explanation: paragraphs.join(' ')};
}

export function shouldShowStaffSignIn(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  const url = new URL(request.url);
  let path;
  try { path = decodeURIComponent(url.pathname); }
  catch { return false; }
  if (path.includes('\\') || path.includes('\0')) return false;
  path = path.replace(/\/{2,}/g, '/');
  if (path.length > 1) path = path.replace(/\/+$/, '');
  if (path !== '/admin' && !path.startsWith('/admin/')) return false;
  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/x-component') || request.headers.get('rsc') === '1' || url.searchParams.has('_rsc')) return false;
  if (accept.includes('application/json') && !accept.includes('text/html')) return false;
  return accept === '' || accept.includes('text/html') || accept.includes('*/*');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
}

export function renderStaffSignIn(request, env) {
  if (!shouldShowStaffSignIn(request)) return null;
  const described = describeStaffSignIn({
    teamDomain: env?.ACCESS_TEAM_DOMAIN,
    audience: env?.ACCESS_AUD,
    requestUrl: request.url,
  });
  const action = described.href
    ? `<a class="button" href="${escapeHtml(described.href)}">Continue with Cloudflare Access</a>`
    : '';
  const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Sign in — iFranchise</title>
<link rel="icon" href="/favicon.ico">
<style>
@font-face{font-family:Manrope;src:url('/fonts/manrope-400.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:Manrope;src:url('/fonts/manrope-600.woff2') format('woff2');font-weight:600;font-display:swap}
@font-face{font-family:Sora;src:url('/fonts/sora-600.woff2') format('woff2');font-weight:600;font-display:swap}
:root{color-scheme:light;--bg:#f5f5fa;--surface:#fff;--line:#e4e2ee;--text:#201a38;--muted:#706a80;--brand:#32159b}
@media (prefers-color-scheme:dark){:root{color-scheme:dark;--bg:#100c1b;--surface:#191326;--line:#342a46;--text:#f1edf9;--muted:#b8aecb;--brand:#ccb6ff}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:28px 20px;background:var(--bg);color:var(--text);font:16px/1.6 Manrope,Arial,sans-serif}
main{width:min(480px,100%)}
.brand{width:210px;height:auto;margin:0 0 22px}
section{padding:32px;background:var(--surface);border:1px solid var(--line);border-radius:14px}
p.kicker{margin:0 0 10px;color:var(--muted);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
h1{margin:0;font:700 32px/1.25 Sora,Arial,sans-serif;letter-spacing:-.04em}
p{margin:14px 0 0;color:var(--muted)}
.button{display:flex;align-items:center;justify-content:center;min-height:44px;margin-top:24px;padding:10px 16px;border-radius:8px;background:#32159b;color:#fff;font-weight:700;text-decoration:none}
.button:focus-visible,.home:focus-visible{outline:3px solid #9882db;outline-offset:3px}
.home{display:inline-block;margin-top:18px;color:var(--text);font-weight:700;text-decoration:none}
</style>
</head>
<body>
<main>
<section>
<img class="brand" src="/assets/ifranchise-lockup.svg" width="210" alt="iFranchise — Connect. Expand. Grow.">
<p class="kicker">Staff portal</p>
<h1>${escapeHtml(described.title)}</h1>
${described.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
${action}
<a class="home" href="/">Return to the website</a>
</section>
</main>
</body>
</html>`;
  return new Response(request.method === 'HEAD' ? null : body, {
    status: 401,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex',
    },
  });
}
