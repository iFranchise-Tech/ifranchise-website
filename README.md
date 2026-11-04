# iFranchise website

Source for the iFranchise website and its team administration portal.

- Cloudflare production URL: https://ifranchise-website.damp-field-d970.workers.dev
- Admin portal: https://ifranchise-website.damp-field-d970.workers.dev/admin (locked until production Access is configured)
- Production setup and domain cutover: [docs/cloudflare-production.md](docs/cloudflare-production.md)
- GitHub destination: `iFranchise-Tech/ifranchise-website` (public as verified on 2026-11-02; repository visibility has not been changed)

## Local development

Requires Node.js 22.13 or newer and pnpm 11.25.0. Run commands from this repository root.

```sh
pnpm install --frozen-lockfile
pnpm db:local
pnpm exec wrangler d1 execute DB --local --file=database/content.sql
pnpm dev
```

`pnpm db:local` applies `drizzle/` to the local D1 database under `.wrangler/state`. Import `database/content.sql` once on a new database. Do not import it again after editors have published changes.

`pnpm dev` starts Vinext. It defaults to **http://localhost:3019/** (also available at **http://127.0.0.1:3019/**). If that port is busy, use the available port printed by the server. To choose another port, run `pnpm dev --port 3021`. Authentication uses the request origin, not a fixed port. No `.env` or `.dev.vars` file is required for the public website.

`pnpm db:verify-empty` repeats the migration and seed on a throwaway local database. It does not use `.wrangler/state` or a remote database. The preview Worker, Access application, and test spreadsheet steps are in [docs/cloudflare-preview.md](docs/cloudflare-preview.md).

### Configuration

Wrangler reads one local secret file. When `.dev.vars` exists, that file wins and `.env` is ignored. When `.dev.vars` is absent, Wrangler reads `.env`. Do not create both. Copy `.dev.vars.example` to `.dev.vars` only after a real value exists, and leave unused lines commented. `.env.example` repeats those placeholders for reference.

Non-secret settings stay in `wrangler.jsonc` for local development and production, and `wrangler.preview.jsonc` for the separate preview Worker. A value in `.dev.vars` overrides the same key from `wrangler.jsonc` during local development. Production secrets are set with `pnpm exec wrangler secret put --config wrangler.jsonc`. Preview secrets are set with `pnpm exec wrangler secret put --config wrangler.preview.jsonc`, not in either JSON file.

| Variable | Required for | Where it belongs |
|---|---|---|
| `SITE_ACCESS` | Public site. Already `public`. | `wrangler.jsonc` |
| `CMS_SUPER_ADMIN_EMAIL` | Configured Super Admins. Comma-separated work emails. Defaults to `abdul@ifranchise.in` and `sumanth.reddy@ifranchise.in`. Other `@ifranchise.in` addresses still need a CMS membership. | `wrangler.jsonc` |
| `DB` | CMS content, memberships, anti-abuse sessions and historical submissions. Local name `ifranchise-db`. | `wrangler.jsonc` binding |
| `BUCKET` | CMS uploads, not new lead files. Local name `ifranchise-files`. | `wrangler.jsonc` binding |
| `ACCESS_TEAM_DOMAIN` | Staff sign-in, after an Access application exists. | `.dev.vars` locally; target Worker secret |
| `ACCESS_AUD` | Staff sign-in on a deployed hostname, after an Access application exists. | `.dev.vars` locally; target Worker secret |
| `LOCAL_ADMIN_EMAIL` | Legacy local setting; it does not add accounts to the picker. | `.env.local` |
| `LOCAL_ADMIN_SECRET` | Local admin sign-in only. Random signing secret, at least 32 characters. Not a staff password. | `.env.local` |
| `SHEETS_WEBHOOK_URL` | Required for accepting website enquiries. | `.dev.vars` locally; target Worker secret |
| `INTAKE_SIGNING_KEY` | Required for accepting website enquiries. Existing matching RSA private JWK. | `.dev.vars` locally; target Worker secret |
| `CMS_BROCHURE_IMPORT_TOKEN` | Optional one-time brochure import. | `.dev.vars` locally; target Worker secret |

`pnpm db:local` applies `drizzle/` to the local D1 database under `.wrangler/state`. `pnpm exec wrangler d1 migrations apply DB --remote --config wrangler.preview.jsonc` applies the same files to `ifranchise-db-preview` only. That preview database id is already set in `wrangler.preview.jsonc`. Production database initialization must follow the empty-database checks in [the production runbook](docs/cloudflare-production.md); never copy preview submissions into production. Local R2 is simulated in `.wrangler/`. The preview bucket is `ifranchise-files-preview`.

Opening `/admin` in a browser returns the staff sign-in screen with status 401 until a local development session or a Cloudflare Access session exists. Preview and production keep Access mandatory. Localhost cannot complete Cloudflare Access. There is no email/password account system and no emailed password-reset flow. Local development uses an account picker with **Access help** for setup guidance; it has no password field. Preview and production recover access through Cloudflare Access and the company identity provider. Hosted recovery guidance is shown only after clicking **Forgot password?**.

### Local admin sign-in

Local development can open the admin portal without Cloudflare Access. The account picker is available only in a development build on a loopback host. A production or preview build cannot issue or accept a local session even if local variables are present.

Create `.env.local` in the repository root. `LOCAL_ADMIN_SECRET` is required. Only the two configured Super Admins are eligible for the picker. `LOCAL_ADMIN_EMAIL` does not grant other accounts access. `.env.local` is gitignored.

```sh
openssl rand -base64 32
```

```sh
LOCAL_ADMIN_EMAIL="sumanth.reddy@ifranchise.in"
LOCAL_ADMIN_SECRET="paste-the-random-value"
```

`LOCAL_ADMIN_SECRET` signs revocable local sessions on the server; users never type it into the login page. It is read from the local environment file and is never embedded in a page, bundle, or response. Choose either configured Super Admin account to sign in without a password. Staff invitations and role-based access continue to use verified Cloudflare Access identities on hosted environments.

Wrangler reads `.dev.vars` first. When that file exists, it ignores `.env.local`. Put the signing secret in `.dev.vars` in that case. Do not create both files unless the local admin lines are in the file Wrangler actually loads.

Restart the dev server, then open the local portal:

```sh
pnpm dev
```

Open http://localhost:3019/admin. Select one of the two account buttons; there is no password or secret field. Either `abdul@ifranchise.in` or `sumanth.reddy@ifranchise.in` opens the dashboard with Super Admin access. Only these two configured addresses can hold that role; invitations for other staff keep scoped access. Migration `drizzle/0003_dual_super_admins.sql` ensures `abdul@ifranchise.in` and `sumanth.reddy@ifranchise.in` exist as Super Admin memberships. The first successful Access or matching local sign-in for either configured address activates that membership. Other addresses cannot use the local picker; on hosted environments they need a verified Access identity and an active or unexpired invited CMS membership. **Sign out** posts a same-origin request, deletes the session from local D1, and clears the cookie; replaying the old cookie is rejected. The development-only `local_admin_sessions` table is created on first login, without a production migration. This does not change the production database.

### Database

Migrations live in `drizzle/` and apply only to the database selected by the Wrangler command. `pnpm db:local` never writes to production. `pnpm db:remote` is reserved for an approved production change. Local state in `.wrangler/` is gitignored.

No scheduled D1 or R2 backup is configured in this repository. Before an approved production change, export the database with `pnpm exec wrangler d1 export ifranchise-db --remote --output backup.sql` and copy required R2 objects with `pnpm exec wrangler r2 object get`. Store backups outside Git, under the ignored `.secrets/` directory.

### Google Sheets

New website enquiries are persisted only in the approved **IFRANCHISE WEBSITE** workbook (`1CtjZy19aXx-o39u3QqZMKxCPaRhyRBPM9Ebmp9ZiWqU`). Configure `SHEETS_WEBHOOK_URL` with the existing Apps Script `/exec` deployment and `INTAKE_SIGNING_KEY` with the matching RSA private JWK on the target Worker. The existing receiver contract and columns remain unchanged. Its lock and Reference-column check deduplicate retries using the server-issued form session ID.

The API reports success only after a matching JSON save acknowledgement. Sheets errors/timeouts retain the visitor's form and return a retryable error; there is no D1/R2 lead fallback or pending lead/email payload queue. D1 still holds non-payload anti-abuse sessions and rate counters. Existing D1 submissions, CMS access and historical Inbox sync remain intact; new Sheets-only leads do not appear in the CMS Inbox.

The approved receiver has no privacy-request tab or private Google Drive upload contract. Online privacy requests and résumé applications therefore return clear unavailable errors with `contact@ifranchise.in` as the contact, rather than accepting incomplete submissions or storing private files in Cloudflare. Restoring those two workflows requires separately approved receiver/Drive integration.

`pnpm test` tests signed saves and email notifications using isolated mock services and an in-memory database. Never point automated tests or local browser QA at the production spreadsheet. The optional campaign measurement remains inactive under the existing privacy controls; source-page paths are retained and sensitive URL parameters are excluded.

## Checks and build

```sh
pnpm test
pnpm test:cms
pnpm typecheck
pnpm lint
pnpm build
```

`node tests/local-auth-http.mjs http://localhost:3019 http://127.0.0.1:3019` verifies both local Super Admins, page and RSC login responses, invalid account rejection, dashboard and team access, sign-out replay protection, API 401s, public pages, and enquiry validation. It submits account choices without reading a password and never prints session cookies. It creates local sessions but submits no enquiries. Adjust the origins to test another port.

Browser and other HTTP checks in `tests/` require a running local preview. Inspect each script for its base URL before running it.

## Structure

- `app/` — page routes, API endpoints and theme styles
- `components/` — shared website and admin interface
- `lib/` — content, enquiry, permission and integration logic
- `content/` — versioned editorial and franchise content
- `public/` — approved brand assets, photographs, artwork and fonts
- `db/`, `drizzle/` — database definitions and migrations
- `integration/` — CRM integration contract

The portal manages franchise opportunities, careers, editorial content, FAQs, videos and team permissions. Live database records and uploaded files remain in the hosted storage; cloning the repository does not copy that data.

## Branding

The public website header uses the approved wordmark with tagline, without the brandmark. The header adapts to the website theme. The favicon uses the original blue brandmark (`#32159B`) on a transparent background in every website and device theme. Its SVG, PNG, ICO and Apple touch icon are under `public/`; metadata is in `lib/favicon.ts`.

## Publishing

The live site remains on its current deployment until a separate cutover is approved. The existing Cloudflare preview uses `wrangler.preview.jsonc`, `ifranchise-db-preview`, and `ifranchise-files-preview`. The intended Cloudflare account is `it@ifranchise.in`; `ifranchise.in` DNS remains with GoDaddy and must stay unchanged during migration. Google Workspace is the selected CMS identity provider. A push does not publish the website, change DNS, or apply remote migrations. See the current audit and remaining work in [docs/cloudflare-preview.md](docs/cloudflare-preview.md).

`.openai/hosting.json`, `vite.config.sites.ts`, and `build/sites-worker.ts` remain in the repository so the Sites path can be restored. They are not the active local runtime. `pnpm dev:sites` still starts the previous Sites command.

Runtime credentials, local databases, build output and private uploads must remain outside Git. Configure production secrets through Wrangler only after owner approval. CRM intake stays off. The previous gateway origin is retained and is not called.


## Transactional email

Resend is the server-side email provider. CMS messages use `iFranchise <it@ifranchise.in>`; website enquiry/job notifications use `iFranchise <contact@ifranchise.in>`. Authentication stays with Cloudflare Access / Google Workspace, with the development-only two-account picker unchanged. See [CMS operations](CMS-OPERATIONS.md#transactional-email-operations) and the [preview setup](docs/cloudflare-preview.md#resend-transactional-email).

The owner manages the existing Resend account as `marketing@ifranchise.in` and supplies `RESEND_API_KEY` through secure server-side environment configuration. This account email is not a runtime credential, sender or lead recipient. All internal website lead notifications must be **From `iFranchise <contact@ifranchise.in>` To `contact@ifranchise.in`** (`WEBSITE_NOTIFICATION_TO`). New Sheets-only leads generate an internal notification after a fresh save acknowledgement, using a fixed recipient and a frozen Resend idempotency key. They do not enqueue customer confirmations or write email payloads to Cloudflare. Existing CMS/historical outbox messages and customer-confirmation templates remain separate and unchanged. Keep hosted `EMAIL_MODE=disabled` until the owner completes manual configuration and approves delivery verification. Do not create a new Resend domain, rotate keys, or change DNS on their behalf.

The Sheets-only notification makes at most two bounded attempts in the Worker background. A duplicate Sheets acknowledgement never resends email: the existing receiver cannot return the original payload or notification state. A lost acknowledgement, interrupted Worker or exhausted email retries can leave a saved lead without email; durable recovery requires receiver changes that are not approved. Disabled mode skips notifications and does not create a later replay queue. Provider acceptance is not verified delivery.

For local CMS email QA, apply local migrations (`pnpm db:local`) and configure `EMAIL_MODE=capture`, `EMAIL_ENVIRONMENT=development`, `EMAIL_PUBLIC_ORIGIN=http://localhost:3019`, and a random 32-byte base64 `EMAIL_OUTBOX_KEY` in the ignored local environment file. Capture mode saves CMS/historical messages encrypted locally and sends nothing; new Sheets-only leads skip email in capture/disabled mode. Keep real API keys out of frontend variables and source control. No Gmail API/OAuth refresh-token setup is required for email delivery.

### Email design review

Run `pnpm email:preview` to generate the complete HTML/plain-text collection in the ignored `outputs/email-review/` directory. Open `index.html` to switch between desktop/mobile previews and the text versions. Fixtures are fictional; this command imports only the template renderer and cannot send email or load credentials.

All templates share the approved iFranchise wordmark, a 600px container, inline typography, centered CTA links with classic Outlook VML fallbacks, and a consistent footer. The PNG wordmark is derived from `public/assets/ifranchise-wordmark.svg`; it is served from `EMAIL_PUBLIC_ORIGIN/assets/ifranchise-email-logo.png`. The logo asset is included in the production build. Live text and CTA links remain usable when images are blocked.

The collection covers invitations, activation, Workspace access help, admin activity, and all four website submission types. A delivery-retry example demonstrates the admin template; it does not introduce new automatic status emails. Delivery state continues to appear in the protected CMS. Existing encrypted outbox bodies remain frozen for retry idempotency and are not redesigned retroactively.
