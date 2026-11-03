/** Configured Super Admin work emails. Other @ifranchise.in addresses stay ordinary members. */
export const DEFAULT_SUPER_ADMIN_EMAILS = Object.freeze([
  'abdul@ifranchise.in',
  'sumanth.reddy@ifranchise.in',
]);

const DISPLAY_NAMES = Object.freeze({
  'abdul@ifranchise.in': 'Abdul',
  'sumanth.reddy@ifranchise.in': 'Sumanth Reddy',
});

export function configuredSuperAdmins(env) {
  const raw = String(env?.CMS_SUPER_ADMIN_EMAIL || '').trim();
  const listed = raw
    ? raw.split(/[,\s]+/).map((value) => value.trim().toLowerCase()).filter(Boolean)
    : [...DEFAULT_SUPER_ADMIN_EMAILS];
  const emails = [];
  for (const email of listed) {
    if (!DEFAULT_SUPER_ADMIN_EMAILS.includes(email)) continue;
    if (!emails.includes(email)) emails.push(email);
  }
  return emails;
}

export function isConfiguredSuperAdmin(email, env) {
  return configuredSuperAdmins(env).includes(String(email || '').trim().toLowerCase());
}

export function displayNameForSuperAdmin(email, fallback = '') {
  const key = String(email || '').trim().toLowerCase();
  return DISPLAY_NAMES[key] || fallback || key.split('@')[0] || 'Super Admin';
}
