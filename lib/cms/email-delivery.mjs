import {cmsRequest} from './client.mjs';

// Processing and reading history are separate operations. A failed read must
// never turn an accepted processing request into a reported processing failure.
export async function processEmailQueue(id) {
  const result = await cmsRequest('/api/admin/email', {
    method:'POST',
    ...(id ? {headers:{'Content-Type':'application/json'}, body:JSON.stringify({id})} : {}),
  });
  const notice = result.configured
    ? 'Queue checked. Delivery statuses are up to date.'
    : 'Email delivery is not configured for this environment.';
  try {
    const history = await cmsRequest('/api/admin/email');
    return {emails:history.emails, notice, error:''};
  } catch {
    const outcome = result.configured
      ? 'Queue processing completed, but delivery history could not be refreshed.'
      : 'Email delivery is not configured for this environment, and delivery history could not be refreshed.';
    return {emails:null, notice:'', error:outcome+' Use Refresh to load the latest statuses.'};
  }
}
