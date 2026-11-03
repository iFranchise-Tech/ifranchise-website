/** Errors retain HTTP status so callers can clear protected data on access loss. */
export class CmsRequestError extends Error {
  constructor(message, status = 0) { super(message); this.name = 'CmsRequestError'; this.status = status; }
}
const expired = 'Your session has expired. Sign in again to continue.';
const unexpected = 'The service returned an unexpected response. Please try again.';
const failed = 'The request could not be completed. Please try again.';
function safeMessage(value) {
  return typeof value === 'string' && value.length <= 500 && !/[<>]|unexpected token|not valid json|syntaxerror|\bat \S+\s*\(/i.test(value) ? value : null;
}
/** Never follow API redirects into an HTML sign-in page or expose gateway output. */
export async function cmsRequest(url, options = {}) {
  let response;
  try {
    const headers = new Headers(options.headers); headers.set('Accept', 'application/json');
    response = await fetch(url, {...options, headers, cache:'no-store', credentials:'same-origin', redirect:'manual'});
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new CmsRequestError('Unable to connect. Check your connection and try again.');
  }
  if (response.status === 401 || response.type === 'opaqueredirect' || response.redirected || response.status >= 300 && response.status < 400) throw new CmsRequestError(expired, 401);
  // Server and proxy diagnostics must not become user-facing validation errors.
  if (response.status >= 500) throw new CmsRequestError(failed, response.status);
  const json = /^(application\/json|application\/[\w.+-]+\+json)(?:\s*;|$)/i.test(response.headers.get('content-type') || '');
  if (!json) throw new CmsRequestError(response.status === 403 ? 'You do not have access to this section.' : response.status === 413 ? 'The upload exceeds the server limit.' : response.ok ? unexpected : failed, response.status);
  let data;
  try { data = await response.json(); } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new CmsRequestError(unexpected, response.status);
  }
  if (!response.ok) throw new CmsRequestError(safeMessage(data?.error) || failed, response.status);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new CmsRequestError(unexpected, response.status);
  return data;
}
