import {safeAdminReturnPath} from './cms/routes.mjs';
import {isAdminPagePath} from './access-gate.mjs';
import {LOCAL_DEV_HELP_LABEL, LOCAL_DEV_ACCESS_HELP, LOCAL_DEV_ERROR, STAFF_PASSWORD_HELP, describeLocalSignIn} from './local-admin.mjs';

export const STAFF_SIGN_IN_TITLE = 'CMS Portal';
export const STAFF_SIGN_IN_ACTION = 'Continue with your work account';
export const STAFF_SIGN_IN_PENDING = 'Opening sign-in…';
export const STAFF_PORTAL_KICKER = 'CMS Portal';
export const STAFF_PORTAL_INTRO = 'Sign in with your iFranchise work account.';
export const STAFF_PORTAL_LOCAL = 'Cloudflare Access cannot finish sign-in on localhost. It only creates a session for the preview website.';
export const STAFF_PORTAL_UNCONFIGURED = 'Staff sign-in is temporarily unavailable until Cloudflare Access is configured for this environment.';
export const STAFF_ACCESS_HELP_LABEL = 'Need help with staff access?';
export const STAFF_ACCESS_HELP_HREF = '/cms/access-help';

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
  const notices = [local ? STAFF_PORTAL_LOCAL : '', configured ? '' : STAFF_PORTAL_UNCONFIGURED].filter(Boolean);
  const paragraphs = [STAFF_PORTAL_INTRO, ...notices];
  return {title: STAFF_SIGN_IN_TITLE, configured, local, href, notices, paragraphs, explanation: paragraphs.join(' ')};
}

export function shouldShowStaffSignIn(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  const url = new URL(request.url);
  if (!isAdminPagePath(url.pathname)) return false;
  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/x-component') || request.headers.get('rsc') === '1' || url.pathname.endsWith('.rsc')) return false;
  if (accept.includes('application/json') && !accept.includes('text/html')) return false;
  return accept === '' || accept.includes('text/html') || accept.includes('*/*');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
}

export function renderStaffSignIn(request, env, options = {}) {
  if (!shouldShowStaffSignIn(request)) return null;
  const dev = options.dev === true;
  const described = describeStaffSignIn({
    teamDomain: env?.ACCESS_TEAM_DOMAIN,
    audience: env?.ACCESS_AUD,
    requestUrl: request.url,
  });
  const local = describeLocalSignIn({dev, requestUrl: request.url, env});
  const credentialError = local.ready && new URL(request.url).searchParams.get('error') === 'credentials';
  const action = !local.ready && described.href
    ? `<a class="button" data-access-login href="${escapeHtml(described.href)}">${escapeHtml(STAFF_SIGN_IN_ACTION)}</a>`
    : '';
  const notices = local.enabled ? [] : described.notices;
  if (local.enabled && new URL(request.url).searchParams.get('error') === 'unavailable') {
    notices.push('Sign-in is temporarily unavailable. Check the local content service and try again.');
  }
  const noticeHtml = notices.length || local.missing
    ? `<div class="notice" role="status">${notices.map((notice) => `<p>${escapeHtml(notice)}</p>`).join('')}${local.missing ? `<p>${escapeHtml(local.missing)}</p>` : ''}</div>`
    : '';
  const localHtml = local.enabled
    ? `${credentialError ? `<p class="error" role="alert">${escapeHtml(LOCAL_DEV_ERROR)}</p>` : ''}<form method="post" action="${escapeHtml(local.actionPath)}"><input type="hidden" name="returnPath" value="${escapeHtml(safeAdminReturnPath(new URL(request.url).pathname+new URL(request.url).search))}"><div class="accounts" role="group" aria-label="Choose your account">${local.accounts.map(account => `<button class="account" type="submit" name="email" value="${escapeHtml(account.email)}"${local.ready ? '' : ' disabled'}><span class="avatar" aria-hidden="true">${escapeHtml(account.name.split(' ').map(word => word[0]).join(''))}</span><span class="account-name"><strong>${escapeHtml(account.name)}</strong><small>${escapeHtml(account.email)}</small></span><span class="account-arrow" aria-hidden="true">→</span></button>`).join('')}</div><div class="forgot"><button type="button" class="forgot-link" data-toggle-forgot aria-expanded="false" aria-controls="local-password-help">${escapeHtml(LOCAL_DEV_HELP_LABEL)}</button><p id="local-password-help" class="forgot-help" hidden role="note">${escapeHtml(LOCAL_DEV_ACCESS_HELP)}</p></div></form>`
    : '';
  const pending = described.href
    ? `<script>document.querySelector("[data-access-login]")?.addEventListener("click",function(){this.setAttribute("aria-busy","true");this.textContent=${JSON.stringify(STAFF_SIGN_IN_PENDING)}})</script>`
    : '';
  const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="light">
<title>CMS sign in — iFranchise</title>
<link rel="icon" href="/favicon.ico">
<style>
@font-face{font-family:Manrope;src:url('/fonts/manrope-400.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:Manrope;src:url('/fonts/manrope-600.woff2') format('woff2');font-weight:600;font-display:swap}
@font-face{font-family:Sora;src:url('/fonts/sora-600.woff2') format('woff2');font-weight:600;font-display:swap}
:root{color-scheme:light only;--bg:#eef0f5;--surface:#fff;--line:#e2e5ee;--text:#201a38;--muted:#6d7385;--brand:#32159b}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 20px;background:radial-gradient(circle at 50% 18%,#ffffff 0%,var(--bg) 58%,#e8ebf2 100%);color:var(--text);font:16px/1.6 Manrope,Arial,sans-serif}
main{width:min(420px,100%);margin:0 auto}
section{padding:40px 36px;background:var(--surface);border:1px solid var(--line);border-radius:18px;box-shadow:0 22px 60px rgba(28,34,52,.08);text-align:center}
.brand{width:196px;height:auto;display:block;margin:0 auto 28px}
p.kicker{margin:0 0 8px;color:var(--muted);font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
h1{margin:0;font:600 28px/1.25 Sora,Arial,sans-serif;letter-spacing:-.04em}
.lede{margin:12px 0 0;color:var(--muted);font-size:14px;text-align:center}
.notice{margin-top:20px;padding:12px 14px;border:1px solid #e7e2d6;border-radius:10px;background:#faf8f4;color:#5e584c;text-align:left}
.notice p{margin:0}
.notice p+p{margin-top:8px}
.button{display:flex;align-items:center;justify-content:center;width:100%;min-height:48px;margin-top:24px;padding:12px 16px;border:0;border-radius:8px;background:var(--brand);color:#fff;font:700 16px/1.2 Manrope,Arial,sans-serif;text-decoration:none;cursor:pointer}
.button[aria-busy="true"],.button:disabled{opacity:.6;cursor:default}
.button:hover{background:#4322b7}
.button:focus-visible,.help:focus-visible,.home:focus-visible,.reveal:focus-visible,.forgot-link:focus-visible,input:focus-visible{outline:3px solid #9882db;outline-offset:3px}
form{margin:0;text-align:left}
.accounts{display:grid;gap:12px;margin-top:28px}
.account{display:flex;align-items:center;gap:12px;width:100%;min-height:80px;padding:14px;border:1px solid var(--line);border-radius:12px;background:#fff;color:var(--text);font-family:inherit;text-align:left;cursor:pointer}
.account:hover{border-color:var(--brand);background:#f8f6ff}
.account:focus-visible{outline:3px solid #9882db;outline-offset:3px}
.account:disabled{opacity:.55;cursor:default}
.avatar{display:grid;place-items:center;flex-shrink:0;width:38px;height:38px;border-radius:50%;background:#eee9fc;color:var(--brand);font-size:13px;font-weight:700}
.account-name{flex:1;min-width:0}
.account-name strong{display:block;font-size:14px;line-height:1.5}
.account-name small{display:block;margin-top:3px;color:var(--muted);font-size:11px;line-height:1.5;overflow-wrap:anywhere}
.account-arrow{color:var(--brand);font-size:20px}

.field{margin-top:18px}
.field label{display:block;margin:0 0 8px;font-size:13px;font-weight:700}
.field input{width:100%;height:48px;padding:0 14px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--text);font:16px/1.4 Manrope,Arial,sans-serif}
.secret{position:relative}
.secret input{padding-right:48px}
.reveal{position:absolute;top:0;right:0;width:48px;height:48px;display:flex;align-items:center;justify-content:center;border:0;border-radius:8px;background:transparent;color:var(--muted);cursor:pointer}
.reveal:hover{color:var(--text)}
.reveal .eye-off{display:none}
.reveal[aria-pressed="true"] .eye{display:none}
.reveal[aria-pressed="true"] .eye-off{display:block}
.forgot{margin-top:10px;text-align:left}
.forgot-link{display:inline;padding:0;border:0;background:none;color:var(--brand);font:700 13px/1.4 Manrope,Arial,sans-serif;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
.forgot-help{margin:10px 0 0;padding:12px 14px;border:1px solid #e7e2d6;border-radius:10px;background:#faf8f4;color:#5e584c;font-size:13px;line-height:1.55;text-align:left}
.error{margin-top:18px;padding:12px 14px;border:1px solid #edc4c0;border-radius:10px;background:#fff0ef;color:#9e2929;text-align:left}
form .field:first-of-type{margin-top:28px}
form .button{margin-top:24px}
.help,.home{display:inline-block;margin-top:22px;color:var(--brand);font-weight:700;text-decoration:none}
.home{display:block;width:fit-content;margin:22px auto 0;padding-top:4px;color:var(--muted);font-size:14px;font-weight:600}
.home:hover{color:var(--brand)}
@media (max-width:640px){body{padding:20px 16px}section{padding:28px 22px}h1{font-size:24px}.brand{width:168px;margin-bottom:22px}}
</style>
</head>
<body>
<main>
<section aria-labelledby="staff-sign-in-title">
<img class="brand" src="/assets/ifranchise-lockup.svg" width="196" alt="iFranchise — Connect. Expand. Grow.">
<h1 id="staff-sign-in-title">${escapeHtml(described.title)}</h1>
<p class="lede">${escapeHtml(local.enabled ? 'Choose your account to continue.' : STAFF_PORTAL_INTRO)}</p>
${noticeHtml}
${action}
${localHtml}
${local.enabled ? '' : `<div class="forgot"><button type="button" class="forgot-link" data-toggle-forgot aria-expanded="false" aria-controls="local-password-help">Forgot password?</button><p id="local-password-help" class="forgot-help" hidden role="note">${escapeHtml(STAFF_PASSWORD_HELP)}</p></div><a class="help" href="${escapeHtml(STAFF_ACCESS_HELP_HREF)}">${escapeHtml(STAFF_ACCESS_HELP_LABEL)}</a>`}
<a class="home" href="/">Return to the website</a>
</section>
</main>
${pending}
<script>document.querySelector("[data-toggle-forgot]")?.addEventListener("click",function(){var help=document.getElementById("local-password-help");var open=help.hidden;help.hidden=!open;this.setAttribute("aria-expanded",String(open))})</script>
</body>
</html>`;
  return new Response(request.method === 'HEAD' ? null : body, {
    status: 401,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      // same-origin keeps Referer on localhost form POSTs and preserves a real
      // Origin header. no-referrer forces Origin: null on navigational POSTs,
      // which the vinext dev guard rejects as 403 before the session handler runs.
      'Referrer-Policy': 'same-origin',
      'X-Robots-Tag': 'noindex',
    },
  });
}
