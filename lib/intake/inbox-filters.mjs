// These predicates only narrow the caller's existing permission-scoped query.
export function inboxFilters(search) {
  const type = search.get('type') || '';
  const received = search.get('received') || '';
  const sync = search.get('sync') || '';
  if (type && !['investor', 'brand', 'general', 'job', 'privacy'].includes(type)) throw new Error('Choose a valid submission type.');
  if (sync && !['pending', 'synced', 'private'].includes(sync)) throw new Error('Choose a valid sync status.');
  const clauses = [], values = [];
  if (type) { clauses.push('kind = ?'); values.push(type); }
  if (received) {
    const midnight = Date.parse(received + 'T00:00:00.000Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(received) || !Number.isFinite(midnight) || new Date(midnight).toISOString().slice(0, 10) !== received) throw new Error('Choose a valid received date.');
    // Submissions are stored as UTC ISO timestamps; displayed dates use IST.
    const start = midnight - 330 * 60_000;
    clauses.push('created_at >= ? AND created_at < ?');
    values.push(new Date(start).toISOString(), new Date(start + 86_400_000).toISOString());
  }
  if (sync === 'private') clauses.push("kind = 'privacy'");
  else if (sync) { clauses.push("kind != 'privacy' AND sheet_status = ?"); values.push(sync); }
  return {clause: clauses.length ? ' AND ' + clauses.map(c => '(' + c + ')').join(' AND ') : '', values};
}
