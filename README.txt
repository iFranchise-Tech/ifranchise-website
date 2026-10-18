iFranchise website — private design preview

Run with Node 22.13+ and pnpm 11.25:
  pnpm install
  pnpm dev

Build:
  node /absolute/path/to/sites-plugin/scripts/build-site.mjs
The source includes the supported Vinext/Sites worker build integration.

Checks:
  node --test tests/enquiry.test.mjs
  pnpm exec tsc --noEmit
  node tests/smoke.mjs   (local preview running on port 3018; TEST_ORIGIN can override)

Important configuration:
  lib/site.ts — canonical origin and private-preview index control
  lib/site.ts — selected catalogue and editorial draft content
  lib/enquiry.mjs — disabled gateway adapter and reviewed form mapping
  lib/measurement.mjs — disabled GTM configuration and consent handling
  integration/crm-contract.txt — actual CRM contract, gaps and activation sequence
  integration/measurement-plan.json — event/consent mapping for Meta, Google and LinkedIn

This is a private review version, not a replacement of www.ifranchise.in.
Public domain launch, live CRM delivery, advertising account setup, funded campaigns,
full catalogue migration, approved privacy terms and production performance validation remain.
Keep the existing CRM intake/conversion switches Off until the owner explicitly enables them.
