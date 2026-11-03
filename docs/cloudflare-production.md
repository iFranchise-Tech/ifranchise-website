# Cloudflare production release

## Production target

- Worker: `ifranchise-website`
- Public URL: `https://ifranchise-website.damp-field-d970.workers.dev`
- CMS: the same origin at `/admin`; fail-closed until production Access is configured.
- D1: `ifranchise-db` / `f15d6252-c85c-46f8-812b-e03ccafafed8`
- R2: `ifranchise-files`
- Source configuration: `wrangler.jsonc`
- Built deployment configuration: `dist/server/wrangler.json`

The separate preview configuration, database, bucket and Access audience must not be used for production. Vercel and the current public domain remain unchanged until a separately approved DNS cutover. The Workers URL retains the current noindex setting before that cutover.

## Build and release

```sh
pnpm test
pnpm test:cms
pnpm db:verify-empty
pnpm typecheck
pnpm lint
pnpm build
pnpm exec wrangler deploy --config dist/server/wrangler.json --dry-run
pnpm exec wrangler deploy --config dist/server/wrangler.json --message "Release COMMIT_SHA"
```

Replace `COMMIT_SHA` with the reviewed, pushed Git commit. Review lint failures against the existing baseline; do not call a failing lint run a pass. Verify the deployed version metadata, public routes, static asset revision, form persistence and unauthorized CMS responses before reporting success.

The build does not deploy or migrate data. Always build with the production source configuration before using the generated configuration. Do not deploy `build/worker.ts` directly without the Vinext build output.

## Database initialization and preservation

Before the first initialization, verify the selected remote database has no application tables, record its Time Travel bookmark, and verify the disposable local database test. The production database was inspected as empty on 2026-11-03. The pre-initialization bookmark is `00000001-00000000-00005118-f160e14bf960c3c08acdf0ccdff5e95b`.

```sh
pnpm exec wrangler d1 execute DB --remote --config wrangler.jsonc --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
pnpm exec wrangler d1 migrations apply DB --remote --config wrangler.jsonc
pnpm exec wrangler d1 execute DB --remote --config wrangler.jsonc --file database/content.sql
```

The seed is a **one-time import into an empty database**. It contains five editorial overrides, no enquiries or employee credentials. Never rerun it after editors start working and never restore preview data over production. Verify migrations `0000`–`0004`, both designated Super Admin memberships, editorial records and submission counts. Later schema changes require their own review and backup.

Roll back code to a known-good Worker version if a release fails. Code rollback does not roll back D1 or R2. Do not reset, drop or restore production data as part of a code rollback; use a separately reviewed recovery plan. Before custom-domain cutover the existing Vercel website remains available.

## Environment configuration

| Setting | Initial production value | Type |
| --- | --- | --- |
| `SITE_ACCESS` | `public` | Variable |
| `CMS_SUPER_ADMIN_EMAIL` | `abdul@ifranchise.in,sumanth.reddy@ifranchise.in` | Variable |
| `EMAIL_MODE` | `disabled` | Variable |
| `EMAIL_ENVIRONMENT` | `production` | Variable |
| `EMAIL_PUBLIC_ORIGIN` | `https://ifranchise-website.damp-field-d970.workers.dev` | Variable |
| `WEBSITE_NOTIFICATION_TO` | `contact@ifranchise.in` | Variable |
| `CMS_NOTIFICATION_TO` | `it@ifranchise.in` (CMS messages only) | Variable |
| `ACCESS_TEAM_DOMAIN` | Empty until production Access is ready | Variable |
| `ACCESS_AUD` | Empty until the exact production application audience is verified | Variable |

Empty Access configuration denies administrative requests. Public forms remain available. Before enabling CMS access, protect `/admin`, `/admin/*`, `/admin.rsc`, `/api/admin` and `/api/admin/*` on every production hostname, verify the company identity provider, and configure the matching issuer/audience. Preserve signature verification and active invited database membership/roles. The authoritative Workspace administrator is `admin@ifranchise.in`. Do not use the preview application's audience or a development session to unlock production.

Future email activation requires owner approval and server-side **Secrets** `RESEND_API_KEY`, `EMAIL_OUTBOX_KEY` (32-byte base64 encryption key) and `RESEND_WEBHOOK_SECRET` for the separately authorized production webhook. Keep the existing onboarding webhook untouched. `EMAIL_ALLOWED_RECIPIENTS` is an optional restrictive Variable for an explicitly approved delivery test. Review/hold QA outbox entries before activation; frozen payloads must not be altered for retry.

The owner manages Resend using `marketing@ifranchise.in`. This address is not a sender, lead recipient or runtime credential. Website staff notifications are always From `iFranchise <contact@ifranchise.in>` To `contact@ifranchise.in`; customer acknowledgements are a distinct type. No real email is sent while `EMAIL_MODE=disabled`, including retries and scheduled processing. Leads and email intents remain persisted without API credentials. Production Sheets delivery separately requires **Secrets** `SHEETS_WEBHOOK_URL` and `INTAKE_SIGNING_KEY`; unset values leave sync pending without losing the lead.

## Domain handoff — no DNS changes during this release

The selected architecture is Cloudflare authoritative DNS with GoDaddy remaining the registrar. Cloudflare Workers custom domains require an active Cloudflare zone in this setup. Do **not** add a guessed GoDaddy A/CNAME pointing to `workers.dev`.

Cloudflare assigned these nameservers to the existing pending `ifranchise.in` zone:

- `pearl.ns.cloudflare.com`
- `yichun.ns.cloudflare.com`

These are registrar **nameserver settings**, not records to add to the existing GoDaddy DNS zone; record TTL and priority do not apply. Before an approved switch, import and verify the entire current DNS zone, including Google Workspace mail, Resend DKIM/SPF/MX, verification and all existing subdomains. The pending Cloudflare zone was empty during the release audit, so changing nameservers now would interrupt existing services.

After the zone is ready and the owner approves cutover, attach `www.ifranchise.in` and `cms.ifranchise.in` as custom domains to the intended production Worker. Cloudflare creates and manages their routing records and TLS; obtain and verify the actual resulting records in that dashboard. Configure and test CMS Access for the CMS hostname first. Decide the apex-domain redirect separately. No custom-domain target or verification TXT record has been invented in this runbook.

Until cutover, preserve the existing GoDaddy `www` CNAME `e232d189e7d05784.vercel-dns-017.com` (TTL 1800) and nameservers `ns49.domaincontrol.com` / `ns50.domaincontrol.com`. Use the verified Workers URL to review the new release.
