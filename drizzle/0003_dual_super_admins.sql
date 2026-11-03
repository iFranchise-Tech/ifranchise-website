-- Ensure both configured Super Admin memberships exist.
-- Does not delete members, records, submissions, or media.
-- Does not store passwords or authentication secrets.
INSERT INTO cms_members (
  email,
  user_id,
  name,
  role,
  scopes,
  manager,
  status,
  expires_at,
  version,
  created_at,
  updated_at
)
VALUES
  (
    'abdul@ifranchise.in',
    NULL,
    'Abdul',
    'super_admin',
    '[]',
    NULL,
    'invited',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+400 days'),
    1,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'sumanth.reddy@ifranchise.in',
    NULL,
    'Sumanth Reddy',
    'super_admin',
    '[]',
    NULL,
    'invited',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+400 days'),
    1,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  )
ON CONFLICT(email) DO UPDATE SET
  name = CASE
    WHEN cms_members.name IS NULL OR trim(cms_members.name) = '' THEN excluded.name
    ELSE cms_members.name
  END,
  role = 'super_admin',
  scopes = '[]',
  manager = NULL,
  status = CASE
    WHEN cms_members.user_id IS NOT NULL THEN 'active'
    WHEN cms_members.status = 'suspended' THEN 'invited'
    ELSE COALESCE(cms_members.status, 'invited')
  END,
  expires_at = CASE
    WHEN cms_members.user_id IS NOT NULL THEN NULL
    ELSE COALESCE(cms_members.expires_at, excluded.expires_at)
  END,
  updated_at = excluded.updated_at,
  version = cms_members.version + 1;
