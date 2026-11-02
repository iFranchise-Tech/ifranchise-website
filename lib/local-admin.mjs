import {normalizeWorkEmail} from './contact-validation.mjs';
import {configuredSuperAdmins, displayNameForSuperAdmin} from './cms/super-admins.mjs';

export const LOCAL_ADMIN_COOKIE = 'ifranchise_local_dev';
export const LOCAL_ADMIN_PATH = '/api/admin/local-dev-session';
export const LOCAL_ADMIN_LOGOUT = '/api/admin/local-dev-logout';
export const LOCAL_DEV_ACTION = 'Sign in';
export const LOCAL_DEV_ERROR = 'Choose one of the available accounts to continue.';
export const LOCAL_DEV_MISSING = 'Sign-in is unavailable. Use “Access help” for setup guidance.';
export const LOCAL_DEV_HELP_LABEL = 'Access help';
export const LOCAL_DEV_ACCESS_HELP = 'Choose your account to open the local CMS. No password is needed. LOCAL_ADMIN_SECRET stays in the local environment file and signs sessions on the server. If access is unavailable, configure a secret of at least 32 characters and restart the development server.';
export const STAFF_PASSWORD_HELP = 'Account access is managed through Cloudflare Access and the company identity provider. Contact your work-account administrator to recover access.';
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
  const pad = (4 - (value.length % 4)) % 4;
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat(pad);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function sameText(left, right) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index];
  return diff === 0;
}

async function sign(secret, payload) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

function isLoopback(hostname) {
  const host = String(hostname || '').replace(/^\[|\]$/g, '').toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.localhost');
}

function originOf(value) {
  try { return new URL(value).origin; }
  catch { return ''; }
}

export function localAdminEnabled({dev, hostname} = {}) {
  return dev === true && isLoopback(hostname);
}

export function localAdminSecret(env) {
  const secret = String(env?.LOCAL_ADMIN_SECRET || '');
  return secret.length >= 32 ? secret : null;
}

/** Only the two configured Super Admins may use the development account picker. */
export function allowedLocalAdminEmails(env) {
  if (!localAdminSecret(env)) return [];
  return configuredSuperAdmins(env);
}

export function isAllowedLocalAdminEmail(email, env) {
  return allowedLocalAdminEmails(env).includes(String(email || '').trim().toLowerCase());
}

/** @deprecated Prefer allowedLocalAdminEmails + localAdminSecret. Kept for older call sites. */
export function localAdminIdentity(env) {
  const secret = localAdminSecret(env);
  const emails = allowedLocalAdminEmails(env);
  if (!secret || !emails.length) return null;
  return {email: emails[0], secret, emails};
}

export function describeLocalSignIn({dev, requestUrl, env} = {}) {
  let hostname = '';
  try { hostname = new URL(requestUrl).hostname; }
  catch { hostname = ''; }
  const enabled = localAdminEnabled({dev, hostname});
  const ready = enabled && Boolean(localAdminSecret(env) && allowedLocalAdminEmails(env).length);
  const accounts = enabled ? configuredSuperAdmins(env).map(email => ({email, name: displayNameForSuperAdmin(email)})) : [];
  return {enabled, ready, accounts, action: LOCAL_DEV_ACTION, actionPath: LOCAL_ADMIN_PATH, missing: enabled && !ready ? LOCAL_DEV_MISSING : ''};
}

/**
 * Same-origin CSRF for the local sign-in POST.
 * Matching Origin is preferred. Navigational form posts under a strict
 * Referrer-Policy may send Origin: null; those still require Sec-Fetch-Site
 * same-origin and a user navigation/fetch from this host.
 */
export function isTrustedLocalSignInPost(request, url) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  if (origin && origin !== 'null') return originOf(origin) === url.origin;

  const site = request.headers.get('sec-fetch-site');
  const mode = request.headers.get('sec-fetch-mode');
  if (site !== 'same-origin') return false;
  if (mode !== 'navigate' && mode !== 'cors' && mode !== 'same-origin') return false;

  const referer = request.headers.get('referer');
  if (referer) return originOf(referer) === url.origin;
  return mode === 'navigate' || mode === 'cors' || mode === 'same-origin';
}

export async function issueLocalAdminToken(env, email, now = Date.now()) {
  const secret = localAdminSecret(env);
  let normalized = '';
  try { normalized = normalizeWorkEmail(email); }
  catch { return null; }
  if (!secret || !env?.DB || !isAllowedLocalAdminEmail(normalized, env)) return null;
  const sid = crypto.randomUUID();
  const exp = now + MAX_AGE_MS;
  // Called only by the loopback development endpoint. This table exists in
  // local D1 only; it is deliberately not a preview/production migration.
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS local_admin_sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, expires_at INTEGER NOT NULL)').run();
  await env.DB.prepare('DELETE FROM local_admin_sessions WHERE expires_at <= ?').bind(now).run();
  await env.DB.prepare('INSERT INTO local_admin_sessions (id, email, expires_at) VALUES (?, ?, ?)').bind(sid, normalized, exp).run();
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({sid, email: normalized, exp})));
  return `${payload}.${await sign(secret, payload)}`;
}

export async function verifyLocalAdminToken(token, env, now = Date.now()) {
  const secret = localAdminSecret(env);
  if (!secret || !env?.DB || typeof token !== 'string') return null;
  const split = token.split('.');
  if (split.length !== 2) return null;
  const [payload, signature] = split;
  if (!payload || !signature || !sameText(signature, await sign(secret, payload))) return null;
  let body;
  try { body = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))); }
  catch { return null; }
  if (!body || typeof body.sid !== 'string' || typeof body.email !== 'string' || !Number.isInteger(body.exp)) return null;
  if (!isAllowedLocalAdminEmail(body.email, env)) return null;
  if (body.exp <= now || body.exp > now + MAX_AGE_MS + 60_000) return null;
  try {
    const session = await env.DB.prepare('SELECT id FROM local_admin_sessions WHERE id = ? AND email = ? AND expires_at = ? AND expires_at > ?').bind(body.sid, body.email, body.exp, now).first();
    if (!session) return null;
  } catch { return null; }
  return {userId: `local-dev:${body.email}`, email: body.email, fullName: null, sessionId: body.sid};
}

function cookieValue(request, name) {
  const raw = request.headers.get('cookie');
  if (!raw) return '';
  for (const part of raw.split(';')) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq < 1 || trimmed.slice(0, eq) !== name) continue;
    try { return decodeURIComponent(trimmed.slice(eq + 1)); }
    catch { return ''; }
  }
  return '';
}

export async function localAdminUserFromRequest(request, env, dev, now = Date.now()) {
  let hostname = '';
  try { hostname = new URL(request.url).hostname; }
  catch { return null; }
  if (!localAdminEnabled({dev, hostname})) return null;
  return verifyLocalAdminToken(cookieValue(request, LOCAL_ADMIN_COOKIE), env, now);
}

export async function localAdminSessionResponse(request, env, dev, now = Date.now()) {
  let url;
  try { url = new URL(request.url); }
  catch { return null; }
  if (url.pathname !== LOCAL_ADMIN_PATH || request.method !== 'POST') return null;
  if (!localAdminEnabled({dev, hostname: url.hostname})) return null;
  if (!localAdminSecret(env) || !allowedLocalAdminEmails(env).length) return redirect(url, '/admin?error=unavailable');
  if (!isTrustedLocalSignInPost(request, url)) {
    return text('This request is not permitted.', 403);
  }
  const fields = await submittedAccount(request);
  let email = '';
  try { email = normalizeWorkEmail(fields.email); }
  catch { email = ''; }
  if (!isAllowedLocalAdminEmail(email, env)) {
    return redirect(url, '/admin?error=credentials');
  }
  try {
    const token = await issueLocalAdminToken(env, email, now);
    if (token) return redirect(url, '/admin', token);
  } catch { /* Keep an unavailable local store on the sign-in page. */ }
  return redirect(url, '/admin?error=unavailable');
}

export async function localAdminLogoutResponse(request, env, dev) {
  let url;
  try { url = new URL(request.url); }
  catch { return null; }
  if (url.pathname !== LOCAL_ADMIN_LOGOUT) return null;
  if (!localAdminEnabled({dev, hostname: url.hostname})) return null;
  if (request.method !== 'POST') return text('Method not allowed.', 405);
  if (!isTrustedLocalSignInPost(request, url)) return text('This request is not permitted.', 403);
  const user = await localAdminUserFromRequest(request, env, dev);
  if (user) await env.DB.prepare('DELETE FROM local_admin_sessions WHERE id = ?').bind(user.sessionId).run();
  return redirect(url, '/admin', '');
}

async function submittedAccount(request) {
  const type = request.headers.get('content-type') || '';
  if (!type.includes('application/x-www-form-urlencoded')) return {email: ''};
  const raw = await request.text();
  if (raw.length > 2048) return {email: ''};
  const params = new URLSearchParams(raw);
  return {email: params.getAll('email').length === 1 ? params.get('email') || '' : ''};
}

function redirect(url, location, token) {
  const secure = url.protocol === 'https:' ? '; Secure' : '';
  const cookie = token
    ? `${LOCAL_ADMIN_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${MAX_AGE_MS / 1000}; SameSite=Lax${secure}`
    : `${LOCAL_ADMIN_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  return new Response(null, {status: 303, headers: {Location: location, 'Cache-Control': 'no-store', 'Set-Cookie': cookie}});
}

function text(message, status) {
  return new Response(message, {status, headers: {'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}});
}
