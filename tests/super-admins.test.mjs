import test from 'node:test';
import assert from 'node:assert/strict';
import {configuredSuperAdmins, displayNameForSuperAdmin, isConfiguredSuperAdmin} from '../lib/cms/super-admins.mjs';

test('both configured Super Admins are recognized and ordinary staff are not', () => {
  const env = {CMS_SUPER_ADMIN_EMAIL: 'abdul@ifranchise.in, sumanth.reddy@ifranchise.in'};
  assert.deepEqual(configuredSuperAdmins(env), ['abdul@ifranchise.in', 'sumanth.reddy@ifranchise.in']);
  assert.equal(isConfiguredSuperAdmin('Abdul@ifranchise.in', env), true);
  assert.equal(isConfiguredSuperAdmin('sumanth.reddy@ifranchise.in', env), true);
  assert.equal(isConfiguredSuperAdmin('colleague@ifranchise.in', env), false);
  assert.equal(isConfiguredSuperAdmin('person@example.com', env), false);
  assert.equal(displayNameForSuperAdmin('abdul@ifranchise.in'), 'Abdul');
  assert.equal(displayNameForSuperAdmin('sumanth.reddy@ifranchise.in'), 'Sumanth Reddy');
});

test('non-work domains in the env list are ignored', () => {
  assert.deepEqual(
    configuredSuperAdmins({CMS_SUPER_ADMIN_EMAIL: 'abdul@ifranchise.in,outsider@example.com,other@ifranchise.in,sumanth.reddy@ifranchise.in'}),
    ['abdul@ifranchise.in', 'sumanth.reddy@ifranchise.in'],
  );
});

test('defaults cover both Super Admins when the env value is empty', () => {
  assert.deepEqual(configuredSuperAdmins({}), ['abdul@ifranchise.in', 'sumanth.reddy@ifranchise.in']);
});
