// Staff paths require a verified Cloudflare Access identity at the worker,
// before static assets or the application can respond. Public pages, public
// form APIs and published media are not in this list.
// /api/admin/brochures keeps its own check: a Super Admin, or the one-time
// import token. The worker must not discard that request before the route runs.
export function isStaffPath(pathname, method = 'GET') {
  if (typeof pathname !== 'string' || pathname.charAt(0) !== '/') return true;
  let path;
  try { path = decodeURIComponent(pathname); }
  catch { return true; }
  if (path.includes('\\') || path.includes('\0')) return true;
  path = path.replace(/\/{2,}/g, '/');
  if (path.length > 1) path = path.replace(/\/+$/, '');
  if (path === '/api/admin/brochures' && String(method).toUpperCase() === 'POST') return false;
  return path === '/admin' || path.startsWith('/admin/') || path === '/api/admin' || path.startsWith('/api/admin/');
}

export function accessCredential(request) {
  const header = request.headers.get('cf-access-jwt-assertion');
  if (header) return header;
  const raw = request.headers.get('cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq < 1 || trimmed.slice(0, eq) !== 'CF_Authorization') continue;
    try { return decodeURIComponent(trimmed.slice(eq + 1)); }
    catch { return null; }
  }
  return null;
}
