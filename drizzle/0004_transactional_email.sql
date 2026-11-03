-- Additive only: existing content, memberships and submissions are preserved.
ALTER TABLE cms_members ADD COLUMN invitation_required INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
CREATE TABLE cms_invitation_tokens (
  token_hash TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL REFERENCES cms_members(email),
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX cms_invitation_email ON cms_invitation_tokens(email);
--> statement-breakpoint
CREATE TABLE email_outbox (
  id TEXT PRIMARY KEY NOT NULL,
  dedupe_key TEXT NOT NULL,
  kind TEXT NOT NULL,
  source_ref TEXT NOT NULL,
  payload TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  provider_id TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  first_attempt_at INTEGER,
  next_attempt_at INTEGER NOT NULL DEFAULT 0,
  lease_until INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  event_at INTEGER NOT NULL DEFAULT 0,
  event_rank INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX email_outbox_pending ON email_outbox(status,next_attempt_at);
CREATE UNIQUE INDEX email_outbox_dedupe_key_unique ON email_outbox(dedupe_key);
CREATE UNIQUE INDEX email_outbox_provider_id_unique ON email_outbox(provider_id);
--> statement-breakpoint
CREATE TABLE email_delivery_events (
  id TEXT PRIMARY KEY NOT NULL,
  provider_id TEXT NOT NULL,
  type TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  received_at INTEGER NOT NULL
);
CREATE INDEX email_delivery_provider ON email_delivery_events(provider_id,occurred_at);
--> statement-breakpoint
CREATE TABLE email_limits (id TEXT PRIMARY KEY NOT NULL, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
