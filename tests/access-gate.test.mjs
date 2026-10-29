import test from 'node:test';
import assert from 'node:assert/strict';
import {accessCredential, isStaffPath} from '../lib/access-gate.mjs';

test('public website paths do not require Cloudflare Access', () => {
  for (const path of ['/', '/franchise-opportunities', '/franchise/odette', '/about-us', '/contact-us', '/careers', '/resources', '/resources/blogs/example', '/blogs', '/privacy-policy', '/api/intake/session', '/api/intake/enquiries', '/api/intake/applications', '/api/locations', '/api/brochures/odette', '/media/11111111-1111-4111-8111-111111111111.png', '/fonts/sora-800.woff2', '/assets/ifranchise-wordmark.svg']) {
    assert.equal(isStaffPath(path), false, path);
  }
});

test('admin pages and admin APIs require Cloudflare Access', () => {
  for (const path of ['/admin', '/admin/', '/admin/preview', '/admin/submissions/11111111-1111-4111-8111-111111111111', '/api/admin', '/api/admin/', '/api/admin/upload', '/api/admin/intake', '/api/admin/intake/resume/11111111-1111-4111-8111-111111111111', '/api/admin/brochures/extra']) {
    assert.equal(isStaffPath(path), true, path);
  }
});

test('the one-time brochure import reaches its own authenticator', () => {
  assert.equal(isStaffPath('/api/admin/brochures', 'POST'), false);
  assert.equal(isStaffPath('/api/admin/brochures/', 'POST'), false);
  assert.equal(isStaffPath('/api/admin/brochures', 'GET'), true);
});

test('ambiguous or malformed paths fail closed', () => {
  assert.equal(isStaffPath('/admin/%'), true);
  assert.equal(isStaffPath('/admin/%E0%A4%A'), true);
  assert.equal(isStaffPath('admin'), true);
  assert.equal(isStaffPath('/admin\\private'), true);
});

test('Access credential comes from the header, then the session cookie', () => {
  assert.equal(accessCredential(new Request('https://ifranchise.in/admin', {headers:{'cf-access-jwt-assertion':'header-token', cookie:'CF_Authorization=cookie-token'}})), 'header-token');
  assert.equal(accessCredential(new Request('https://ifranchise.in/admin', {headers:{cookie:'theme=light; CF_Authorization=cookie%2Etoken'}})), 'cookie.token');
  assert.equal(accessCredential(new Request('https://ifranchise.in/')), null);
  assert.equal(accessCredential(new Request('https://ifranchise.in/admin', {headers:{cookie:'CF_Authorization=%'}})), null);
});
