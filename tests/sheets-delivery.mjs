import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {generateKeyPairSync, verify} from 'node:crypto';
import {localD1} from './local-d1.mjs';
import {readFileSync,readdirSync} from 'node:fs';
import {env} from 'cloudflare:workers';
import {NOTICE_VERSION} from '../lib/intake/constants.mjs';

function createD1() {
 const {database,DB}=localD1();
 for(const file of readdirSync('drizzle').filter(file=>file.endsWith('.sql')).sort())database.exec(readFileSync('drizzle/'+file,'utf8'));
 return DB;
}

async function sha256(value) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  return Array.from(bytes).map((part) => part.toString(16).padStart(2, '0')).join('');
}

function listen() {
  const requests = [];
  let mode = 'fail';
  const server = createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const outer = JSON.parse(Buffer.concat(chunks).toString());
    const signed = JSON.parse(outer.body);
    const valid = verify('RSA-SHA256', Buffer.from(outer.body), publicKey, Buffer.from(outer.signature, 'base64url'));
    requests.push({reference: signed.row[0], tab: signed.tab, valid, length: signed.row.length, message: signed.row[7], notes: signed.row.at(-1)});
    if (!valid || mode === 'fail') {
      res.writeHead(503);
      res.end('unavailable');
      return;
    }
    if (mode === 'mismatch') {
      res.writeHead(200, {'content-type': 'application/json'});
      res.end(JSON.stringify({ok: true, reference: 'IF-other'}));
      return;
    }
    res.writeHead(200, {'content-type': 'application/json'});
    res.end(JSON.stringify({ok: true, reference: signed.row[0]}));
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({
      server,
      requests,
      setMode(next) { mode = next; },
      url: `http://127.0.0.1:${server.address().port}/`,
    }));
  });
}

const {privateKey, publicKey} = generateKeyPairSync('rsa', {modulusLength: 2048});
const d1 = createD1();
env.DB = d1;
env.SHEETS_WEBHOOK_URL = '';
env.INTAKE_SIGNING_KEY = '';
env.BUCKET = undefined;

const {acceptSubmission, deliver, retryPending} = await import('../lib/intake/server.ts');

function general(id) {
  return {
    id,
    kind: 'general',
    name: 'Preview Test',
    phone: '+14155552671',
    phoneCountry: 'US',
    email: 'preview-test@gmail.com',
    city: 'Bengaluru',
    state: 'Karnataka',
    consent: true,
    adult: true,
    noticeVersion: NOTICE_VERSION,
    sourcePage: '/contact-us',
    source: {},
    trap: '',
    message: 'Local preview retry check only.',
  };
}

async function sessionFor(token, ip) {
  const now = Date.now();
  await d1.prepare('INSERT INTO intake_sessions (id, ip_hash, created_at, expires_at) VALUES (?,?,?,?)')
    .bind(token, await sha256(ip + new Date().toISOString().slice(0, 10)), now - 10000, now + 7200000)
    .run();
}

function request(ip) {
  return new Request('http://127.0.0.1:3019/api/intake/enquiries', {
    method: 'POST',
    headers: {origin: 'http://127.0.0.1:3019', 'cf-connecting-ip': ip, 'content-type': 'application/json'},
  });
}

test('submissions stay in D1 and retry only against the configured test webhook', async () => {
  const stored = {id: crypto.randomUUID(), reference: 'IF-unset', kind: 'general', payload: '{}', created_at: '2026-10-29T00:00:00.000Z', sheet_status: 'pending', attempts: 0};
  await d1.prepare('INSERT INTO website_submissions (id,reference,session_id,kind,payload,created_at,sheet_status,attempts) VALUES (?,?,?,?,?,?,?,0)')
    .bind(stored.id, stored.reference, crypto.randomUUID(), stored.kind, stored.payload, stored.created_at, 'pending').run();
  assert.equal(await deliver(stored, 'http://127.0.0.1:3019'), false);
  assert.equal((await d1.prepare('SELECT attempts, sheet_status FROM website_submissions WHERE id=?').bind(stored.id).first()).attempts, 0);
  await d1.prepare('DELETE FROM website_submissions WHERE id=?').bind(stored.id).run();

  const webhook = await listen();
  try {
    env.SHEETS_WEBHOOK_URL = webhook.url;
    env.INTAKE_SIGNING_KEY = JSON.stringify(privateKey.export({format: 'jwk'}));
    const ip = '203.0.113.50';
    const id = crypto.randomUUID();
    const token = crypto.randomUUID();
    await sessionFor(token, ip);
    const saved = await acceptSubmission(request(ip), {...general(id), token});
    const row = await d1.prepare('SELECT * FROM website_submissions WHERE id=?').bind(id).first();
    assert.equal(saved.reference, 'IF-' + id);
    assert.equal(row.sheet_status, 'pending');
    assert.equal((await d1.prepare('SELECT COUNT(*) AS n FROM email_outbox WHERE source_ref=? AND kind=?').bind(id,'website').first()).n,1);
    assert.equal(row.attempts,1);
    assert.equal(webhook.requests.length,1,'the new lead must not be delivered twice by the pending sweep');
    assert.ok(webhook.requests.some((item) => item.reference === row.reference && item.tab === 'General Enquiries' && item.valid && item.length === 16 && item.message === 'Local preview retry check only.' && item.notes === ''));

    webhook.setMode('mismatch');
    assert.equal(await deliver(row, 'http://127.0.0.1:3019'), false);
    assert.equal((await d1.prepare('SELECT sheet_status FROM website_submissions WHERE id=?').bind(id).first()).sheet_status, 'pending');

    webhook.setMode('ok');
    assert.equal(await retryPending('http://127.0.0.1:3019', 2) >= 1, true);
    const synced = await d1.prepare('SELECT sheet_status, synced_at, attempts FROM website_submissions WHERE id=?').bind(id).first();
    assert.equal(synced.sheet_status, 'synced');
    assert.ok(synced.synced_at);
    assert.ok(synced.attempts > row.attempts);

    const beforePrivacy = webhook.requests.length;
    const privacyId = crypto.randomUUID();
    const privacyToken = crypto.randomUUID();
    await sessionFor(privacyToken, ip);
    await acceptSubmission(request(ip), {id: privacyId, token: privacyToken, kind: 'privacy', email: 'preview-test@gmail.com', requestType: 'Access my information', noticeVersion: NOTICE_VERSION});
    const privacy = await d1.prepare('SELECT sheet_status, attempts FROM website_submissions WHERE id=?').bind(privacyId).first();
    assert.equal(privacy.sheet_status, 'not_applicable');
    assert.equal(privacy.attempts, 0);
    assert.equal((await d1.prepare('SELECT COUNT(*) AS n FROM email_outbox WHERE source_ref=?').bind(privacyId).first()).n,0);
    assert.equal(webhook.requests.length, beforePrivacy);
    assert.equal(await deliver(await d1.prepare('SELECT * FROM website_submissions WHERE id=?').bind(privacyId).first(), 'http://127.0.0.1:3019'), false);
    assert.equal(webhook.requests.length, beforePrivacy);

    const older = ['2026-10-29T00:00:01.000Z', '2026-10-29T00:00:02.000Z', '2026-10-29T00:00:03.000Z'];
    const pendingIds = [];
    for (const created of older) {
      const pendingId = crypto.randomUUID();
      pendingIds.push(pendingId);
      await d1.prepare('INSERT INTO website_submissions (id,reference,session_id,kind,payload,created_at,sheet_status,attempts) VALUES (?,?,?,?,?,?,?,0)')
        .bind(pendingId, 'IF-' + pendingId, crypto.randomUUID(), 'general', row.payload, created, 'pending').run();
    }
    assert.equal(await retryPending('http://127.0.0.1:3019', 2), 2);
    const left = await d1.prepare("SELECT id FROM website_submissions WHERE sheet_status='pending' ORDER BY created_at").bind().all();
    assert.deepEqual(left.results.map((item) => item.id), [pendingIds[2]]);

    const otherIp = '203.0.113.51';
    const otherToken = crypto.randomUUID();
    await sessionFor(otherToken, otherIp);
    const foreign = new Request('http://127.0.0.1:3019/api/intake/enquiries', {method: 'POST', headers: {origin: 'https://other.invalid', 'cf-connecting-ip': otherIp, 'content-type': 'application/json'}});
    await assert.rejects(() => acceptSubmission(foreign, {...general(crypto.randomUUID()), token: otherToken}), (error) => error.status === 403);
    await assert.rejects(() => acceptSubmission(request(otherIp), {...general(crypto.randomUUID()), token: otherToken, message: 'too short'}), (error) => error.status === 422);
    const duplicateId = crypto.randomUUID();
    const duplicateBody = {...general(duplicateId), token: otherToken, message: 'Local preview general enquiry duplicate check.'};
    const first = await acceptSubmission(request(otherIp), duplicateBody);
    const second = await acceptSubmission(request(otherIp), duplicateBody);
    assert.equal(second.reference, first.reference);
    assert.equal((await d1.prepare('SELECT COUNT(*) AS n FROM email_outbox WHERE source_ref=?').bind(duplicateId).first()).n,2);
    assert.equal((await d1.prepare('SELECT COUNT(*) AS count FROM website_submissions WHERE reference=?').bind(first.reference).first()).count, 1);
    await assert.rejects(() => acceptSubmission(request(otherIp), {...general(crypto.randomUUID()), token: otherToken, message: 'A second general enquiry from the same session.'}), (error) => error.status === 409);
  } finally {
    await new Promise((resolve) => webhook.server.close(resolve));
  }
});
