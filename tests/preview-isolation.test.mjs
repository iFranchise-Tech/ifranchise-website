import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const preview = readFileSync(new URL('../wrangler.preview.jsonc', import.meta.url), 'utf8');
const production = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
const gitignore = readFileSync(new URL('../.gitignore', import.meta.url), 'utf8');

test('preview Worker bindings stay off production storage', () => {
  assert.match(preview, /"name": "ifranchise-website-preview"/);
  assert.match(preview, /"database_name": "ifranchise-db-preview"/);
  assert.match(preview, /"database_id": "724549ad-1e0a-431b-b15d-192b55e407de"/);
  assert.match(preview, /"bucket_name": "ifranchise-files-preview"/);
  assert.doesNotMatch(preview, /"database_name": "ifranchise-db"/);
  assert.doesNotMatch(preview, /"bucket_name": "ifranchise-files"/);
  assert.doesNotMatch(preview, /"routes"/);
  assert.match(preview, /"SITE_ACCESS": "public"/);
  assert.doesNotMatch(preview, /"ACCESS_TEAM_DOMAIN"/);
  assert.doesNotMatch(preview, /"ACCESS_AUD"/);
});

test('production uses separate storage, public routes and lead email to contact@ifranchise.in; unconfigured CMS fails closed', () => {
  assert.match(production, /"name": "ifranchise-website"/);
  assert.match(production, /"database_id": "f15d6252-c85c-46f8-812b-e03ccafafed8"/);
  assert.match(production, /"database_name": "ifranchise-db"/);
  assert.match(production, /"bucket_name": "ifranchise-files"/);
  assert.doesNotMatch(production, /724549ad-1e0a-431b-b15d-192b55e407de/);
  assert.doesNotMatch(production, /ifranchise-files-preview/);
  assert.match(production, /"ACCESS_TEAM_DOMAIN": ""/);
  assert.match(production, /"ACCESS_AUD": ""/);
  assert.match(production, /"SITE_ACCESS": "public"/);
  assert.match(production, /"workers_dev": true/);
  assert.match(production, /"EMAIL_MODE": "resend"/);
  assert.match(production, /"EMAIL_ENVIRONMENT": "production"/);
  assert.match(production, /"WEBSITE_NOTIFICATION_TO": "contact@ifranchise.in"/);
  assert.doesNotMatch(production, /"routes"|"RESEND_API_KEY"|"EMAIL_OUTBOX_KEY"|"LOCAL_ADMIN_SECRET"/);
});

test('local secrets stay gitignored', () => {
  assert.match(gitignore, /\.env\*/);
  assert.match(gitignore, /!\.env\.example/);
  assert.match(gitignore, /\.dev\.vars\*/);
});
