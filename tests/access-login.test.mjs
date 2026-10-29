import test from 'node:test';
import assert from 'node:assert/strict';
import {accessLoginUrl, describeStaffSignIn, renderStaffSignIn, shouldShowStaffSignIn} from '../lib/access-login.mjs';

const team = 'https://team-name.cloudflareaccess.com';
const audience = 'a'.repeat(32);

test('Access login is omitted until a real team and audience exist', () => {
  assert.equal(accessLoginUrl({teamDomain: '', audience: ''}), null);
  assert.equal(accessLoginUrl({teamDomain: 'http://team-name.cloudflareaccess.com', audience}), null);
  assert.equal(accessLoginUrl({teamDomain: 'https://example.com', audience}), null);
  assert.equal(accessLoginUrl({teamDomain: 'https://your-team.cloudflareaccess.com', audience}), null);
  assert.equal(accessLoginUrl({teamDomain: team, audience: 'YOUR-ACCESS-APPLICATION-AUDIENCE'}), null);
});

test('Access login points at the team login path and only returns to https hosts', () => {
  const login = new URL(accessLoginUrl({teamDomain: team + '/ignored', audience, redirectUrl: 'https://preview.example/admin'}));
  assert.equal(login.origin, team);
  assert.equal(login.pathname, '/cdn-cgi/access/login/' + audience);
  assert.equal(login.searchParams.get('redirect_url'), 'https://preview.example/admin');
  const local = new URL(accessLoginUrl({teamDomain: team, audience, redirectUrl: 'http://localhost:3019/admin'}));
  assert.equal(local.searchParams.get('redirect_url'), null);
});

test('localhost explains the Access limitation and does not offer a password', () => {
  const described = describeStaffSignIn({teamDomain: '', audience: '', requestUrl: 'http://localhost:3019/admin'});
  assert.equal(described.href, null);
  assert.match(described.explanation, /authorized iFranchise staff/);
  assert.match(described.explanation, /cannot finish sign-in on localhost/);
  assert.match(described.explanation, /not configured for this environment/);
  const response = renderStaffSignIn(new Request('http://localhost:3019/admin', {headers: {accept: 'text/html'}}), {});
  assert.equal(response.status, 401);
  assert.match(response.headers.get('content-type'), /text\/html/);
  return response.text().then((html) => {
    assert.match(html, /Staff portal/);
    assert.doesNotMatch(html, /type="password"|<form/i);
    assert.doesNotMatch(html, /Continue with Cloudflare Access/);
  });
});

test('a configured https host can continue to Cloudflare Access', () => {
  const request = new Request('https://preview.example/admin', {headers: {accept: 'text/html'}});
  const response = renderStaffSignIn(request, {ACCESS_TEAM_DOMAIN: team, ACCESS_AUD: audience});
  return response.text().then((html) => {
    assert.ok(html.includes(`href="${team}/cdn-cgi/access/login/${audience}?redirect_url=https%3A%2F%2Fpreview.example%2Fadmin"`));
    assert.match(html, /does not accept a password/);
  });
});

test('admin APIs and data requests do not receive the sign-in page', () => {
  assert.equal(shouldShowStaffSignIn(new Request('http://localhost:3019/api/admin', {headers: {accept: 'text/html'}})), false);
  assert.equal(shouldShowStaffSignIn(new Request('http://localhost:3019/api/admin/intake/resume/1', {headers: {accept: 'text/html'}})), false);
  assert.equal(shouldShowStaffSignIn(new Request('http://localhost:3019/admin', {method: 'POST', headers: {accept: 'text/html'}})), false);
  assert.equal(shouldShowStaffSignIn(new Request('http://localhost:3019/admin?_rsc=1', {headers: {accept: 'text/html'}})), false);
  assert.equal(shouldShowStaffSignIn(new Request('http://localhost:3019/', {headers: {accept: 'text/html'}})), false);
  assert.equal(renderStaffSignIn(new Request('http://localhost:3019/api/admin'), {}), null);
});
