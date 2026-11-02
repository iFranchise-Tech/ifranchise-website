import {localD1} from './local-d1.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {isStaffPath} from '../lib/access-gate.mjs';
import {renderStaffSignIn} from '../lib/access-login.mjs';
import {verifyAccessToken} from '../lib/access-token.mjs';
import {
  LOCAL_ADMIN_COOKIE,
  LOCAL_ADMIN_LOGOUT,
  LOCAL_ADMIN_PATH,
  allowedLocalAdminEmails,
  issueLocalAdminToken,
  isTrustedLocalSignInPost,
  localAdminLogoutResponse,
  localAdminSessionResponse,
  localAdminUserFromRequest,
} from '../lib/local-admin.mjs';

const env = {
  DB: localD1().DB,
  LOCAL_ADMIN_EMAIL: 'sumanth.reddy@ifranchise.in',
  LOCAL_ADMIN_SECRET: 'local-development-secret-value-32',
  CMS_SUPER_ADMIN_EMAIL: 'abdul@ifranchise.in,sumanth.reddy@ifranchise.in',
};
const preview = 'https://ifranchise-website-preview.damp-field-d970.workers.dev/admin';

test('local development sign-in is rejected outside localhost dev', async () => {
  const token = await issueLocalAdminToken(env, env.LOCAL_ADMIN_EMAIL);
  assert.ok(token);
  const local = new Request('http://localhost:3019/admin', {headers: {cookie: `${LOCAL_ADMIN_COOKIE}=${encodeURIComponent(token)}`}});
  assert.equal(await localAdminUserFromRequest(local, env, false), null);
  assert.equal(await localAdminUserFromRequest(new Request(preview, {headers: {cookie: `${LOCAL_ADMIN_COOKIE}=${token}`}}), env, true), null);
  assert.equal(await localAdminSessionResponse(new Request('http://localhost:3019' + LOCAL_ADMIN_PATH, {method: 'POST'}), env, false), null);
  assert.equal(await localAdminSessionResponse(new Request(preview.replace('/admin', LOCAL_ADMIN_PATH), {method: 'POST'}), env, true), null);
});

test('local development sign-in requires a work email and a long secret', async () => {
  assert.equal(await issueLocalAdminToken({LOCAL_ADMIN_SECRET: env.LOCAL_ADMIN_SECRET}, 'person@example.com'), null);
  assert.equal(await issueLocalAdminToken({...env, LOCAL_ADMIN_SECRET: 'short'}, env.LOCAL_ADMIN_EMAIL), null);
  assert.equal(await localAdminUserFromRequest(new Request('http://localhost:3019/admin'), env, true), null);
  assert.equal(isStaffPath('/admin'), true);
  assert.equal(isStaffPath('/api/intake/enquiries'), false);
  assert.deepEqual(allowedLocalAdminEmails(env), ['abdul@ifranchise.in', 'sumanth.reddy@ifranchise.in']);
});

test('both configured Super Admins can select a local account without submitting a secret', async () => {
  const now = Date.now();
  for (const base of ['http://localhost:3019','http://localhost:3021','http://127.0.0.1:4317']) for (const email of ['abdul@ifranchise.in', 'sumanth.reddy@ifranchise.in']) {
    const issued = await localAdminSessionResponse(new Request(base + LOCAL_ADMIN_PATH, {
      method: 'POST',
      headers: {origin: base, 'content-type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({email}),
    }), env, true, now);
    assert.equal(issued.status, 303);
    assert.equal(issued.headers.get('location'), '/admin');
    const cookie = issued.headers.get('set-cookie');
    assert.match(cookie, new RegExp(`^${LOCAL_ADMIN_COOKIE}=`));
    const token = decodeURIComponent(cookie.slice(LOCAL_ADMIN_COOKIE.length + 1).split(';')[0]);
    const user = await localAdminUserFromRequest(new Request('http://127.0.0.1:3019/admin', {headers: {cookie: `${LOCAL_ADMIN_COOKIE}=${encodeURIComponent(token)}`}}), env, true, now);
    assert.equal(user.email, email);
  }
});

test('a valid local session is accepted only for allowed developers', async () => {
  const now = Date.now();
  const body = new URLSearchParams({email: env.LOCAL_ADMIN_EMAIL});
  const issued = await localAdminSessionResponse(new Request('http://localhost:3019' + LOCAL_ADMIN_PATH, {method: 'POST', headers: {origin: 'http://localhost:3019', 'content-type': 'application/x-www-form-urlencoded'}, body}), env, true, now);
  assert.equal(issued.status, 303);
  assert.equal(issued.headers.get('location'), '/admin');
  const cookie = issued.headers.get('set-cookie');
  assert.match(cookie, new RegExp(`^${LOCAL_ADMIN_COOKIE}=`));
  assert.match(cookie, /HttpOnly/);
  const token = decodeURIComponent(cookie.slice(LOCAL_ADMIN_COOKIE.length + 1).split(';')[0]);
  const user = await localAdminUserFromRequest(new Request('http://127.0.0.1:3019/admin', {headers: {cookie: `${LOCAL_ADMIN_COOKIE}=${encodeURIComponent(token)}`}}), env, true, now);
  assert.equal(user.email, 'sumanth.reddy@ifranchise.in');
  const wrong = await localAdminSessionResponse(new Request('http://localhost:3019' + LOCAL_ADMIN_PATH, {method: 'POST', headers: {origin: 'http://localhost:3019', 'content-type': 'application/x-www-form-urlencoded'}, body: new URLSearchParams({email: 'not-an-admin@ifranchise.in'})}), env, true, now);
  assert.equal(wrong.status, 303);
  assert.equal(wrong.headers.get('location'), '/admin?error=credentials');
  assert.match(wrong.headers.get('set-cookie'), /Max-Age=0/);
  const otherStaff = await localAdminSessionResponse(new Request('http://localhost:3019' + LOCAL_ADMIN_PATH, {method: 'POST', headers: {origin: 'http://localhost:3019', 'content-type': 'application/x-www-form-urlencoded'}, body: new URLSearchParams({email: 'someone@ifranchise.in', secret: env.LOCAL_ADMIN_SECRET})}), env, true, now);
  assert.equal(otherStaff.headers.get('location'), '/admin?error=credentials');
  const tampered = token.slice(0, -2) + (token.endsWith('a') ? 'b' : 'a');
  assert.equal(await localAdminUserFromRequest(new Request('http://localhost:3019/admin', {headers: {cookie: `${LOCAL_ADMIN_COOKIE}=${encodeURIComponent(tampered)}`}}), env, true, now), null);
  assert.equal(await localAdminUserFromRequest(new Request('http://localhost:3019/admin', {headers: {cookie: `${LOCAL_ADMIN_COOKIE}=${encodeURIComponent(token)}`}}), env, true, now + 13 * 60 * 60 * 1000), null);
  const foreign = await localAdminSessionResponse(new Request('http://localhost:3019' + LOCAL_ADMIN_PATH, {method: 'POST', headers: {origin: 'https://evil.example', 'sec-fetch-site': 'cross-site'}}), env, true);
  assert.equal(foreign.status, 403);
  const signedOut = await localAdminLogoutResponse(new Request('http://localhost:3019' + LOCAL_ADMIN_LOGOUT, {method:'POST',headers:{origin:'http://localhost:3019',cookie:`${LOCAL_ADMIN_COOKIE}=${encodeURIComponent(token)}`}}), env, true);
  assert.equal(signedOut.status, 303);
  assert.match(signedOut.headers.get('set-cookie'), /Max-Age=0/);
  assert.equal(await localAdminUserFromRequest(new Request('http://localhost:3019/admin', {headers:{cookie:`${LOCAL_ADMIN_COOKIE}=${encodeURIComponent(token)}`}}),env,true),null,'signed-out tokens cannot be replayed');
  assert.equal(await localAdminLogoutResponse(new Request('https://ifranchise-website-preview.damp-field-d970.workers.dev' + LOCAL_ADMIN_LOGOUT), env, true), null);
  assert.equal(await localAdminLogoutResponse(new Request('http://localhost:3019' + LOCAL_ADMIN_LOGOUT), env, false), null);
});

test('same-origin navigational form posts are trusted without leaking cross-site access', () => {
  const url = new URL('http://localhost:3019' + LOCAL_ADMIN_PATH);
  assert.equal(isTrustedLocalSignInPost(new Request(url, {headers: {origin: 'http://localhost:3019'}}), url), true);
  assert.equal(isTrustedLocalSignInPost(new Request(url, {headers: {
    origin: 'null',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-dest': 'document',
    referer: 'http://localhost:3019/admin',
  }}), url), true);
  assert.equal(isTrustedLocalSignInPost(new Request(url, {headers: {
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-dest': 'document',
  }}), url), true);
  assert.equal(isTrustedLocalSignInPost(new Request(url, {headers: {origin: 'https://evil.example'}}), url), false);
  assert.equal(isTrustedLocalSignInPost(new Request(url, {headers: {origin: 'null', 'sec-fetch-site': 'cross-site', 'sec-fetch-mode': 'navigate'}}), url), false);
  assert.equal(isTrustedLocalSignInPost(new Request(url, {headers: {'sec-fetch-site': 'none', 'sec-fetch-mode': 'navigate'}}), url), false);
});

test('the local sign-in control is absent from preview and production pages', async () => {
  const closed = await renderStaffSignIn(new Request(preview, {headers: {accept: 'text/html'}}), env, {dev: true}).text();
  assert.doesNotMatch(closed, /Local development only/);
  assert.doesNotMatch(closed, /type="password"/);
  assert.match(closed, /company identity provider/);
  const productionLocal = await renderStaffSignIn(new Request('http://localhost:3019/admin', {headers: {accept: 'text/html'}}), env, {dev: false}).text();
  assert.doesNotMatch(productionLocal, /Local development only/);
  const open = await renderStaffSignIn(new Request('http://localhost:3019/admin', {headers: {accept: 'text/html'}}), env, {dev: true}).text();
  assert.match(open, /CMS Portal/);
  assert.match(open, new RegExp(`action="${LOCAL_ADMIN_PATH}"`));
  assert.match(open, /Choose your account/);
  assert.match(open, /value="abdul@ifranchise.in"/);
  assert.match(open, /value="sumanth.reddy@ifranchise.in"/);
  assert.doesNotMatch(open, /type="password"|name="secret"|Show password|Forgot password\?/);
  assert.match(open, /Access help/);
  assert.match(open, /LOCAL_ADMIN_SECRET stays in the local environment file/);
  assert.doesNotMatch(open, /Cloudflare Access/);
  assert.doesNotMatch(open, /reset token|new password|confirm password|email you a reset/i);
  assert.doesNotMatch(open, new RegExp(env.LOCAL_ADMIN_SECRET));
  assert.match(open, /CMS Portal/);
  assert.equal((open.match(/class="account" type="submit"/g) || []).length, 2);
  assert.match(open, /Return to the website/);
  assert.doesNotMatch(open, /Local development only|Need help with staff access|mailto:contact@ifranchise.in|not configured|temporarily unavailable/i);
  assert.equal(await verifyAccessToken('not-a-jwt', {ACCESS_TEAM_DOMAIN: 'https://team.cloudflareaccess.com', ACCESS_AUD: 'a'.repeat(32)}), null);
});


test('account picker cannot authorize configured staff or widen the fixed Super Admin set', async () => {
  const extended = {...env, LOCAL_ADMIN_EMAIL: 'editor@ifranchise.in', CMS_SUPER_ADMIN_EMAIL: env.CMS_SUPER_ADMIN_EMAIL + ',editor@ifranchise.in'};
  assert.deepEqual(allowedLocalAdminEmails(extended), ['abdul@ifranchise.in', 'sumanth.reddy@ifranchise.in']);
  assert.equal(await issueLocalAdminToken(extended, 'editor@ifranchise.in'), null);
  for (const body of [new URLSearchParams({email:'editor@ifranchise.in'}), new URLSearchParams([['email','abdul@ifranchise.in'],['email','editor@ifranchise.in']])]) {
    const response = await localAdminSessionResponse(new Request('http://localhost:3021' + LOCAL_ADMIN_PATH, {method:'POST',headers:{origin:'http://localhost:3021','content-type':'application/x-www-form-urlencoded'},body}),extended,true);
    assert.equal(response.headers.get('location'),'/admin?error=credentials');
    assert.match(response.headers.get('set-cookie'),/Max-Age=0/);
  }
});
