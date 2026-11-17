/**
 * Approved blogs become public at midnight India time on their publication date.
 * Evaluate this on each request, after CMS overrides have been applied.
 * @param {{date?: string}} blog
 * @param {number} now
 */
export function isBlogPublished(blog, now = Date.now()) {
  const date = blog.date;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const day = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(day) || new Date(day).toISOString().slice(0, 10) !== date) return false;
  return now >= Date.parse(`${date}T00:00:00+05:30`);
}
