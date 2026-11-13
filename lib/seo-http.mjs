import redirects from '../content/redirects.json' with {type: 'json'};
import gonePaths from '../content/gone.json' with {type: 'json'};

export const PREFERRED_ORIGIN = 'https://www.ifranchise.in';
export const PREFERRED_HOST = 'www.ifranchise.in';

const gone = new Set(gonePaths);

function header(headers, name) {
  if (!headers) return '';
  if (typeof headers.get === 'function') return headers.get(name) || '';
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

export function isLocalHost(hostname) {
  const host = String(hostname || '').replace(/^\[|\]$/g, '').split(':')[0];
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

export function publicScheme(headers, protocol) {
  const visitor = header(headers, 'cf-visitor');
  if (visitor) {
    try {
      const scheme = JSON.parse(visitor).scheme;
      if (scheme === 'http' || scheme === 'https') return scheme;
    } catch { /* ignore malformed edge metadata */ }
  }
  const forwarded = header(headers, 'x-forwarded-proto').split(',')[0].trim();
  if (forwarded === 'http' || forwarded === 'https') return forwarded;
  return String(protocol || 'https').replace(':', '');
}

function withSearch(destination, search) {
  if (!search || destination.includes('?')) return destination;
  const hashAt = destination.indexOf('#');
  if (hashAt < 0) return destination + search;
  return destination.slice(0, hashAt) + search + destination.slice(hashAt);
}

function preferredLocation(destination, search) {
  if (!destination.startsWith('/')) return destination;
  return withSearch(PREFERRED_ORIGIN + destination, search);
}

/** Decide a crawler-facing response before the page renders. Localhost keeps relative locations. */
export function seoDecision(request) {
  const method = String(request.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') return null;
  const local = isLocalHost(request.hostname);
  const scheme = publicScheme(request.headers, request.protocol);
  const offHost = !local && (scheme !== 'https' || request.hostname !== PREFERRED_HOST);
  if (gone.has(request.pathname)) {
    if (offHost) return {status: 301, location: PREFERRED_ORIGIN + request.pathname + (request.search || '')};
    return {status: 410, body: method === 'HEAD' ? '' : 'Gone'};
  }
  const destination = redirects[request.pathname];
  if (destination) {
    const location = local ? withSearch(destination, request.search || '') : preferredLocation(destination, request.search || '');
    return {status: 301, location};
  }
  if (offHost) return {status: 301, location: PREFERRED_ORIGIN + request.pathname + (request.search || '')};
  return null;
}

export function seoResponse(request) {
  const url = new URL(request.url);
  const decision = seoDecision({
    method: request.method,
    hostname: url.hostname,
    protocol: url.protocol.replace(':', ''),
    pathname: url.pathname,
    search: url.search,
    headers: request.headers,
  });
  if (!decision) return null;
  if (decision.status === 410) {
    return new Response(decision.body, {
      status: 410,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }
  return new Response(null, {
    status: 301,
    headers: {Location: decision.location, 'Cache-Control': 'public, max-age=3600'},
  });
}

/** Next.js permanent redirects are 308. Crawlers should see 301 for GET and HEAD. */
export function preferPermanentRedirect(request, response) {
  if (response.status !== 308 || !['GET', 'HEAD'].includes(request.method)) return response;
  return new Response(response.body, {status: 301, statusText: 'Moved Permanently', headers: response.headers});
}
