import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const preview = readFileSync(new URL('../wrangler.preview.jsonc', import.meta.url), 'utf8');
const local = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
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

test('local wrangler config does not point at the preview database id', () => {
  assert.match(local, /"name": "ifranchise-website"/);
  assert.match(local, /"database_id": "00000000-0000-4000-8000-000000000000"/);
  assert.doesNotMatch(local, /724549ad-1e0a-431b-b15d-192b55e407de/);
  assert.doesNotMatch(local, /ifranchise-files-preview/);
  assert.match(local, /"ACCESS_TEAM_DOMAIN": ""/);
  assert.match(local, /"ACCESS_AUD": ""/);
});

test('local secrets stay gitignored', () => {
  assert.match(gitignore, /\.env\*/);
  assert.match(gitignore, /!\.env\.example/);
  assert.match(gitignore, /\.dev\.vars\*/);
});
