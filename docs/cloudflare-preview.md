# Preview Cloudflare Worker

This runbook covers the existing preview and preparation for a separately approved production release. Production DNS, data, secrets, and deployment remain unchanged. Do not commit, push, merge, or deploy to production without the owner's approval.

`wrangler.jsonc` stays the local config. Its D1 id is a placeholder. `wrangler.preview.jsonc` names the preview Worker `ifranchise-website-preview`, the database `ifranchise-db-preview` (`724549ad-1e0a-431b-b15d-192b55e407de`), and the bucket `ifranchise-files-preview`. Do not replace that preview database id, and do not paste a production database id into either file.

`workers_dev` is true only in `wrangler.preview.jsonc`; `preview_urls` is false in both files. The preview is served at https://ifranchise-website-preview.damp-field-d970.workers.dev. A push does not deploy. Do not run `pnpm db:remote` for preview work: it uses `wrangler.jsonc`.

## Current checkpoint — after approved Stage 2

On 2026-11-02, only migrations `0003_dual_super_admins.sql` and `0004_transactional_email.sql` were applied to `ifranchise-db-preview` with explicit owner approval. The ledger now contains all five migrations. Row-by-row verification preserved five content records, eight submissions and all other existing rows. Both authorized Super Admin memberships exist with invited status pending sign-in. The four new invitation/email tables are empty; schema, indexes and foreign-key checks passed. The verified backup and recovery bookmarks remain only in ignored `.secrets/preview-backups/`.

The dedicated preview Worker now has `RESEND_API_KEY`, `EMAIL_OUTBOX_KEY`, `RESEND_WEBHOOK_SECRET`, `INTAKE_SIGNING_KEY` and `SHEETS_WEBHOOK_URL` as encrypted secrets. Values were not exposed. The website-specific Resend webhook exists and is disabled; leave it disabled. Do not alter the separate onboarding webhook. The remaining email variables and hosted Access setup still need an approved configuration stage. Worker code has not been deployed by this work, and email sending is not enabled.

The email redesign is local and ready for GitHub review. Pushes run checks only; the preview Worker has no Workers Builds trigger (read-only verification during the email review). Production release and any preview deployment require separate approval. The initial audit below is historical where explicitly described as such; this checkpoint supersedes earlier pending-migration and missing-email-secret findings.

## Account audit — 2026-11-02

The owner confirmed `it@ifranchise.in` as the intended Cloudflare account and Google Workspace as the CMS identity provider. The account ID is `c6f16e2ecab5d90da313fabb748c979c`. GoDaddy manages `ifranchise.in` DNS; leave its nameservers and records unchanged during migration.

| Area | Verified state | Remaining work |
|---|---|---|
| Worker | `ifranchise-website-preview` exists; public homepage responds successfully. Its deployed Super Admin variable contains only `abdul@ifranchise.in`. | Release the reviewed local code and both authorized addresses to preview after Access is verified. |
| D1 | `ifranchise-db-preview` has five content records and eight submissions. Migrations `0000`–`0004` are applied, with both authorized Super Admin memberships and unchanged content/submissions. | No additional migration is pending. Preserve the verified backup and recheck the ledger before a future release. |
| R2 | `ifranchise-files-preview` is bound to `BUCKET`; its public bucket domain is disabled and it has no custom domain. | Verify authorized media uploads and reads using disposable preview fixtures. |
| Access | `/admin` and `/api/admin` redirect to `ifranchise.cloudflareaccess.com`. Deployed `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` are empty, so Worker JWT verification cannot authenticate staff. | The read-only token confirmed the existing application and audience; add Google Workspace and configure the Worker only after approval. |
| Google Sheets | Both delivery secrets exist. D1 records seven submissions as `synced` and one as `not_applicable`. | Verify the destination Apps Script and spreadsheet. A recorded receiver acknowledgement does not prove the intended spreadsheet contains the row. |
| Production | No production Worker, database, bucket, custom domain, or DNS zone was returned in this account inventory. | Identify the live source and migration/export access; prepare separate production resources only under an approved release plan. |
| GitHub | Repository is public. The current `gh` identity has read permission. Latest observed feature-branch CI succeeded; there is no deployment job. | Review the complete diff, confirm intended visibility and release identity, and prepare release controls before publishing. |

The temporary token audit succeeded for token verification, the organization, applications, application policies, reusable policies, groups, and identity providers. The token expires on 2026-11-09 at 23:59:59 IST. Its Worker/settings/secrets/R2 calls returned 403 and D1 inventory returned 401 because it is scoped to Access. Existing Wrangler authorization independently verified those preview resources with read-only requests. No additional token permissions are needed for this audit.

The verified Access configuration is:

- Organization issuer: `https://ifranchise.cloudflareaccess.com`. Use `auth_domain`; the organization display name still contains the older `tight-haze-ce07.cloudflareaccess.com` name.
- Application: `ifranchise-website-preview`, ID `1adcd1a0-2931-453c-a3c3-49aadf2e4af0`, type `self_hosted`, session duration `24h`.
- Audience: `682034cb4cec4c2b29c2a7f294fffe449fd235c7ad4a9ca830938ca178016155` (an application identifier, not a login credential).
- Protected paths: `/admin`, `/admin/*`, `/api/admin`, `/api/admin/*` on the preview hostname. Add `/admin.rsc` for the framework's top-level client-navigation route; keep the public site and intake routes outside Access.
- Policy: reusable `iFranchise Staff Only`, ID `c3b58804-8961-41e4-addf-e2bc0b87ca45`, allows the `ifranchise.in` email domain, with no require/exclude selectors. The CMS must still enforce invitations and assigned roles.
- Identity providers: one built-in `cloudflare` provider; no `google-apps` provider. Google Workspace has not been configured.
- `allowed_idps` is empty; explicitly select the new Workspace provider after setup. The application currently has `http_only_cookie_attribute: false`; review enabling HttpOnly for its session cookie.
- No Access groups exist. Do not invent a group dependency for the current CMS invitation model.

If a single audit token is desired later, the unavailable resource checks correspond to `Workers Scripts — Read`, `D1 — Read`, and `Workers R2 Storage — Read`; widening the current token is unnecessary while the existing Wrangler session provides this visibility. Future configuration needs `Access: Apps and Policies — Edit` and `Access: Identity Providers — Edit`, plus Google Cloud OAuth project access and Workspace administrator consent. No DNS-write permission or Global API Key is required. See Cloudflare's [permission reference](https://developers.cloudflare.com/fundamentals/api/reference/permissions/).

The preview sheet configured in `Code.preview.gs` is [the separate preview workbook](https://docs.google.com/spreadsheets/d/1CtjZy19aXx-o39u3QqZMKxCPaRhyRBPM9Ebmp9ZiWqU/edit). A read-only browser visit as `it@ifranchise.in` returned “You need access.” The owner needs to grant Viewer access or provide an already authorized owner session before the seven D1 references can be matched to actual rows. No access request was sent, delivery retried, or sheet edited. Preview D1 SELECT queries reported zero changes and zero rows written.


The configured Sites project could not be found through the currently connected Sites account. Do not replace its project ID or recreate the live site to work around missing owner access. Confirm source ownership and export access before planning production data migration.

Local verification after the passwordless development-picker change: 165 Node tests plus the Sheets delivery test passed, along with CMS schema checks, typecheck, and the production build. Both Super Admins opened the dashboard and signed out in the browser. 148 HTTP checks passed across localhost and 127.0.0.1 on ports 3019 and 3021. The compiled production Worker rejected local cookies, picker endpoints, forged JWTs, and forged identity headers. Invitation tests used signed JWTs and verified that existing content, submissions, and unrelated members were unchanged. No remote migrations or data changes ran.

Anonymous preview GET checks returned 200 for the homepage, contact page, and franchise opportunities; the intake POST-only route returned 405 to GET without an Access challenge. `/admin` and `/api/admin` redirected to Access. `/admin.rsc` returned a 200 RSC response without an Access redirect, confirming the missing edge path coverage; this status alone does not establish access to private data. Hosted Google Workspace login, staff invitations, spreadsheet rows, and media workflow remain unverified. The earlier preview upload dry run passed before the picker change; rerun it against the reviewed final build before any approved deployment.


## Local proof, before any Cloudflare account change

From the repository root, with Node.js 22.13 or newer and pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm db:verify-empty
pnpm test
pnpm test:cms
pnpm typecheck
pnpm build
```

`pnpm db:verify-empty` creates a throwaway local database, applies `drizzle/0000` through `drizzle/0004`, verifies both configured Super Admin memberships, imports `database/content.sql` once, and deletes that database. It expects exactly these five editorial rows and zero submissions:

| kind | slug | status |
|---|---|---|
| blogs | what-to-notice-on-your-first-franchise-visit | published |
| industries | medical-industry | draft |
| jobs | qa-engineer | draft |
| jobs | ui-ux-designer | archived |
| placements | franchises | published |

A second import of `database/content.sql` must fail. Do not import it again after anyone has edited the preview database. The command does not read or write `.wrangler/state`.

`pnpm dev` remains http://localhost:3019/. Public pages and `/api/intake` stay anonymous. A browser request to `/admin` returns the staff sign-in screen with status 401 until the local development session or a Cloudflare Access session exists. Localhost cannot complete Cloudflare Access sign-in. The local development control is documented in the README and is not available on this preview hostname.

## Resume the existing preview

The preview Worker, D1 database, and R2 bucket already exist. Do not recreate them, change the database ID, or import `database/content.sql` again. The database contains existing submissions and editorial content.

Before an approved preview update, record the current Worker deployment and Access settings, and export preview D1 into ignored local storage. Inspect the pending migration set and confirm that the target is `ifranchise-db-preview` with ID `724549ad-1e0a-431b-b15d-192b55e407de`. Migration `0003_dual_super_admins.sql` upserts only the two authorized memberships and does not delete content, media, submissions, or other members. Do not use a production database or restore an older database over newer submissions.

After reviewing the backup and target, the preview migration command is:

```sh
pnpm exec wrangler d1 migrations apply DB --remote --config wrangler.preview.jsonc
```

This command was subsequently run under Stage 2 approval for `0003` and `0004`; both passed verification. Do not rerun migrations as part of template review. Recheck the ledger before any future migration approval. Stop if the command names any database other than `ifranchise-db-preview`.

Build and validate the upload locally before an approved preview deployment:

```sh
pnpm build
pnpm exec wrangler deploy --dry-run --config wrangler.preview.jsonc
```

Deploy the preview Worker only after the application audience, Google Workspace policy, and storage destination have been verified. Deployment is manual; CI does not run it.

```sh
pnpm exec wrangler deploy --config wrangler.preview.jsonc
```

Do not add a route for `ifranchise.in`, `www.ifranchise.in`, or the current Sites hostname. Use the existing preview `workers.dev` hostname. Leave DNS for the live site unchanged. Keep the previous Worker version available for rollback; a Worker rollback does not undo D1 migrations or restore secrets.

## Account owner: Access application

Inspect and reuse the existing self-hosted Access application for the preview hostname. The dashboard links application `1adcd1a0-2931-453c-a3c3-49aadf2e4af0`; verify its actual destinations, audience, policies, and identity providers before changing it. Do not create a duplicate application based on incomplete API discovery.

Protect these paths:

- `/admin`
- `/admin/*`
- `/admin.rsc` (framework client navigation)
- `/api/admin`
- `/api/admin/*`

Leave the public site and `/api/intake` outside that application. Require the verified Google Workspace identity provider and company identities. Access admits an authenticated identity; the CMS separately requires an active or unexpired invited membership. Do not grant a CMS role simply because an account has the company email domain. Only `abdul@ifranchise.in` and `sumanth.reddy@ifranchise.in` can be Super Admins. Staff invitations retain their assigned scopes and expiry.

Inspect existing Google Workspace integration before creating an OAuth client. If missing, the owner needs Google Cloud project/OAuth configuration access and Google Workspace administrator authorization. Use an internal web OAuth client for the confirmed Access team domain, with callback `https://<team>.cloudflareaccess.com/cdn-cgi/access/callback`. Enter the client secret directly into Cloudflare and complete the administrator consent there; never put it in the Worker, repository, or chat. Test the identity provider before changing the preview application's login methods. Account-wide Google trust or Access policy changes need a separately reviewed scope. Follow the current [Google Workspace integration guide](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/google-workspace/).

The Worker also lets `POST /api/admin/brochures` reach the route without an Access token so the route can require either a Super Admin or `CMS_BROCHURE_IMPORT_TOKEN`. The route still requires a same-origin request and one of those credentials. Keep `POST /api/admin/brochures` inside the Access application as well unless the account owner deliberately adds a bypass for that one import. A bypass is not required for preview.

From the verified Access application, copy the team domain and application audience (AUD). Configure them on the preview Worker only. Keep them independent from any future production application:

```sh
pnpm exec wrangler secret put ACCESS_TEAM_DOMAIN --config wrangler.preview.jsonc
pnpm exec wrangler secret put ACCESS_AUD --config wrangler.preview.jsonc
```

`ACCESS_TEAM_DOMAIN` is the issuer origin, such as `https://team-name.cloudflareaccess.com`. Empty or missing values fail closed on preview and production. Local development uses a two-account picker and a server-only `LOCAL_ADMIN_SECRET`, and only on loopback hosts. There is no staff password.

Localhost cannot receive the Access session cookie. After the preview application exists, sign-in is verified by opening `/admin` on the preview hostname. `cloudflared access token -app https://<preview-host>` can mint a real token for that same application. Sending that token to localhost works only when local `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` match the preview application, because the Worker checks Cloudflare’s published certificates. That command has not been run. Do not copy a production Access cookie.

`CMS_SUPER_ADMIN_EMAIL` lists `abdul@ifranchise.in,sumanth.reddy@ifranchise.in`. Migration `0003_dual_super_admins` seeds both Super Admin memberships without deleting other members or content. The first successful Access sign-in for either address activates that membership. Other `@ifranchise.in` addresses still need an invited or active CMS member row.

## Account owner: Google Sheets test copy

Do not call the production workbook `1eavzRbd_ajJsX9Hj6XaPiPsksXIzB7pdT8WhI6KesJk`, and do not replace the public key in the production Apps Script.

An existing preview webhook and signing key are already configured. First verify their intended Apps Script deployment and destination spreadsheet through the owner account. Do not rotate these secrets, resend the seven acknowledged submissions, or create a second integration merely because secret values cannot be read back. The local signing key matches the public key in `Code.preview.gs` and differs from the production script key; this alone does not verify the remote secret. The setup below is only for a confirmed missing preview integration.

1. Create a blank spreadsheet. Do not copy the production workbook.
2. Run `node scripts/create-intake-keys.mjs` if `.secrets/` does not already contain a key pair. It writes a new key pair under `.secrets/`, which is gitignored, and it will not overwrite an existing pair.
3. Open the blank spreadsheet, choose Extensions → Apps Script, and paste `integrations/google-sheets/Code.preview.gs`. Replace `INSERT_TEST_SPREADSHEET_ID` with that spreadsheet’s id. Replace `PUBLIC_KEY` with only `kty`, `n`, and `e` from `.secrets/intake-public.jwk.json`.
4. Run `setupPreviewSpreadsheet()` from the Apps Script editor. It adds any missing intake tabs and blank header cells. It leaves existing rows in place and does not deploy the web app.
5. Deploy that script manually as a new web app. Execute as the spreadsheet owner, allow access to Anyone, and copy the `/exec` URL.
6. Store the test web app URL and the new private JWK on the preview Worker:

```sh
pnpm exec wrangler secret put SHEETS_WEBHOOK_URL --config wrangler.preview.jsonc
pnpm exec wrangler secret put INTAKE_SIGNING_KEY --config wrangler.preview.jsonc
```

The code stores the submission in D1 before it calls the webhook. `pnpm test` runs `tests/sheets-delivery.mjs` against a local database and a local webhook:

- With either secret unset, the row stays `pending` and `attempts` stays `0`.
- A failed response or a confirmation for a different reference increments `attempts` and leaves the row `pending`.
- `{ok:true, reference}` for the same reference sets `sheet_status` to `synced`.
- `retryPending()` syncs a limited batch of older pending rows.
- A privacy request is stored as `not_applicable` and is not sent.

That test does not write to Google. After the preview secrets point at the test spreadsheet, submit one labelled preview enquiry, confirm the D1 row moves from `pending` to `synced`, and confirm the row appears only in the test spreadsheet.

## Checks that must stay local

CI installs with `pnpm install --frozen-lockfile`, then runs typecheck, `pnpm test:cms`, `pnpm db:verify-empty`, `pnpm build`, and `pnpm test`. It does not deploy, change DNS, or run a remote migration.

Run build and the full suite sequentially because integration tests read generated assets. The existing workflow checks pull requests and pushes to `feat/cloudflare-workers-access`. Production release still needs a reviewed target configuration, source-data export/restore plan, protected release credentials and approval controls, rollback plan, and explicit owner approval. Do not add an automatic production deployment while completing preview verification.


## Preview configuration and verification sequence

1. Have the Google Workspace administrator configure the internal OAuth client for origin `https://ifranchise.cloudflareaccess.com` and callback `https://ifranchise.cloudflareaccess.com/cdn-cgi/access/callback`. Enter its secret directly into Cloudflare, complete the Workspace consent, and test the provider. Do not change account-wide Google trust settings without reviewing their scope.
2. On the existing preview application, select only the verified Workspace provider, retain the company-domain policy and 24-hour session, add `/admin.rsc`, and review HttpOnly cookies. Do not attach the public homepage or `/api/intake` paths.
3. Set preview-only `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` to the verified values above. Keep `LOCAL_ADMIN_SECRET` and other local settings off hosted Workers. Retain existing Sheets secrets until the actual destination is verified; Google OAuth client credentials belong in the Access provider, not the Worker.
4. Obtain Viewer access to the preview workbook and match all seven acknowledged D1 references to sheet rows; confirm the privacy reference is absent. Audit existing rows only. A new delivery test requires separate authorization because it creates data.
5. Before an approved preview release, back up preview D1 and record the current Worker/Access configuration. The approved `0003` and `0004` migrations are already applied. Recheck the ledger; never reimport the editorial seed or apply new migrations without approval. Verify both memberships and unchanged content, submission, and unrelated-member records.
6. Deploy reviewed code to preview only after approval, with `CMS_SUPER_ADMIN_EMAIL=abdul@ifranchise.in,sumanth.reddy@ifranchise.in`. Keep the existing DB/R2 bindings and public website setting. Production needs its own resources, Access application/audience, and release approval.
7. In preview, verify real Google Workspace login for each Super Admin, dashboard/team access, scoped staff invitation and activation, uninvited/external/suspended-account rejection, sign-out, and private media access. Exercise HTML and RSC admin paths, check API denial behavior, and confirm public pages/forms remain outside Access. Distinguish the edge's current login redirects from the Worker's unauthorized API 401 response. Do not weaken either gate to make a test pass.
8. Before release, run the full local suite, CMS checks, typecheck and production build; verify compiled hosted authentication rejects the development picker and cookies. Keep a rollback plan for the Worker and Access settings that preserves newer D1 submissions. No deployment, migration, configuration change, commit, push, or merge is authorized by this runbook alone.


## Resend transactional email

### Account ownership and delivery handoff (3 November 2026)

The owner will configure Resend manually using **`marketing@ifranchise.in`** and supply credentials securely. Reuse the existing `ifranchise.in` domain and suitable existing API key; do not create or rotate resources on the owner's behalf. The account email is administrative context only, not an application environment variable or a substitute for API authentication.

- Internal website notifications: **From `iFranchise <contact@ifranchise.in>`; To `contact@ifranchise.in`**. Set the ordinary variable `WEBSITE_NOTIFICATION_TO=contact@ifranchise.in`. Server-side dispatch blocks any other sender or recipient for this email type, including encrypted payloads from previous attempts. Blocked messages remain visible for review and the persisted lead is retained.
- Store `RESEND_API_KEY` only as an encrypted Worker secret or in an ignored local server environment file. Preserve the existing `EMAIL_OUTBOX_KEY`. Neither key belongs in browser code, chat, logs or Git.
- Keep hosted `EMAIL_MODE=disabled` while credentials are pending. For an approved preview send, the recipient allowlist must include `contact@ifranchise.in`; account ownership does not add `marketing@ifranchise.in` or `it@ifranchise.in` as website lead recipients.
- Customer confirmations and CMS transactional messages are separate email types with their existing addressing and security rules. This handoff does not change invitation-based authentication or CMS mail.
- No Resend dashboard changes, DNS/nameserver edits or webhook activation are part of this handoff. The earlier domain audit below is historical; the credentials supplied by the owner must be verified against the correct Resend team before a live test. Actual mailbox receipt remains unverified until that test completes.

### Verified setup (2 November 2026)

The repository previously had no Gmail API sending code. Staff invites were `mailto:` drafts; website submissions used D1 and Google Sheets. The local implementation now uses `env.RESEND_API_KEY` with Resend’s HTTPS API entirely in the Worker. CMS sender: `iFranchise <it@ifranchise.in>`. Website sender: `iFranchise <contact@ifranchise.in>`. No API key, email body or invitation secret is exposed by the frontend or delivery-status API.

Read-only checks in the signed-in **iFranchise** Resend team confirmed:

- Domain `ifranchise.in`, ID `a4ffdf6e-7adc-4b73-bda9-a128bcb97546`, is **Verified**, sending enabled, Tokyo (`ap-northeast-1`), GoDaddy DNS. DKIM, return-path MX and SPF all show Verified. Both sender addresses use this verified domain; a separate per-address verification is not required. Actual mailbox receipt and the installed API key’s permissions still need an approved delivery test.
- Receiving is disabled. Keep incoming mail with Google Workspace. Click tracking is disabled; open tracking is enabled; TLS is Opportunistic. Do not change these shared domain settings without approval. Consider disabling open tracking for transactional mail and reviewing Enforced TLS separately; domain-wide changes could affect the existing onboarding application.
- The existing webhook for `https://onboarding.ifranchise.in/api/email-events` belongs to another application and must not be edited. The owner subsequently created a separate website preview webhook at `/api/email/webhook` and disabled it pending release readiness.
- The Cloudflare connector is signed in as `it@ifranchise.in`. A GET of the preview Worker's `previews_base_config` confirmed `RESEND_API_KEY` as `secret_text`; **it is the only Base binding**. No branch Previews exist. The owner subsequently attached all three email secrets directly to `ifranchise-website-preview`, alongside `INTAKE_SIGNING_KEY` and `SHEETS_WEBHOOK_URL`; this was verified by secret names only. Hosted Access issuer/AUD configuration remains pending.

**Important environment distinction:** this repository’s `wrangler.preview.jsonc` deploys a separate staging Worker named `ifranchise-website-preview`. Cloudflare labels that Worker's main deployment “Production,” but it is not the public production website. “Previews Base” is the template for Cloudflare branch Previews. Base secrets apply only to new branch Previews; they do not attach to the existing staging Worker or retroactively change active Previews. No key was copied or configuration changed during this audit. See [Cloudflare Preview configuration](https://developers.cloudflare.com/workers/previews/configuration/).

Keep the existing dedicated staging Worker for the current preview plan. The API key is now attached to that exact target. A switch to branch Previews would require a separate reviewed configuration with supported Wrangler/version bindings. The pinned Wrangler/config currently use the dedicated staging approach. Branch Previews do not run cron handlers: use the protected **Process pending emails** action during branch QA, or keep the dedicated staging Worker for scheduled retries. Do not infer that the Base secret makes the existing workers.dev URL ready.

### Exact environment configuration

| Name | Type | Local development | Dedicated preview Worker |
| --- | --- | --- | --- |
| `RESEND_API_KEY` | Secret | Unnecessary for capture; separate test key for approved live sending | Configured on the dedicated preview Worker; do not replace it during template review |
| `EMAIL_OUTBOX_KEY` | Secret | Random 32 bytes encoded as base64; generated locally in the ignored env file | Configured on the dedicated preview Worker; preserve this encryption key |
| `RESEND_WEBHOOK_SECRET` | Secret | Only needed for signed webhook QA | Configured from the separate website webhook; keep that webhook disabled |
| `EMAIL_MODE` | Variable | `capture` (never sends); hosted builds reject it | Keep `disabled` until approved testing, then `resend` |
| `EMAIL_ENVIRONMENT` | Variable | `development` for capture; `preview` for approved live tests | `preview` |
| `EMAIL_PUBLIC_ORIGIN` | Variable | `http://localhost:3019` (adjust when the email-testing server uses another port) | `https://ifranchise-website-preview.damp-field-d970.workers.dev` |
| `EMAIL_ALLOWED_RECIPIENTS` | Variable | Required for live sends, ignored for capture | Explicit comma-separated controlled QA recipients; include each invitation recipient and internal notification mailbox being tested |
| `CMS_NOTIFICATION_TO` | Variable | Default `it@ifranchise.in` | `it@ifranchise.in` |
| `WEBSITE_NOTIFICATION_TO` | Variable | Default `contact@ifranchise.in` | `contact@ifranchise.in` |
| `ACCESS_TEAM_DOMAIN` / `ACCESS_AUD` | Existing protected config | Local picker does not need Access | Existing audited issuer/AUD, plus Google Workspace IdP and correct admin path coverage; still required |
| `DB` / `BUCKET` | Existing bindings | Local D1/R2 | Existing preview D1/R2 only |
| `SITE_ACCESS` | Variable | `public` | `public`; secure admin paths separately |
| `CMS_SUPER_ADMIN_EMAIL` | Variable | Both approved addresses | `abdul@ifranchise.in,sumanth.reddy@ifranchise.in` |

For a controlled preview test, an initial allowlist may be `abdul@ifranchise.in,sumanth.reddy@ifranchise.in,it@ifranchise.in,contact@ifranchise.in`, provided the owner approves those mailboxes receiving test messages. Add the exact controlled staff account for invitation acceptance QA. No test message is redirected to an arbitrary catch-all; a recipient outside the allowlist is blocked and visible in the delivery screen.

Generate the encryption key locally with a cryptographically secure password manager or `openssl rand -base64 32`, and enter it directly into the correct Worker secret field. Keep keys out of chat, Git, logs and client-prefixed variables. Use separate local/preview/production keys. Preserve the encryption key while queued email exists. API keys can be rotated independently. The project does not fetch a Worker secret back into the local environment.

### Resend account and webhook setup — after approval

1. Use the existing **iFranchise** team and verified `ifranchise.in` domain; do not create a duplicate domain or move DNS. Keep separate sending-only keys for preview and production, each restricted to this domain. The installed key's secret value was neither exposed nor tested with a real send.
2. Keep the exact two sender strings above. `it@ifranchise.in` and `contact@ifranchise.in` should remain real Google Workspace mailboxes/aliases for replies; Resend sends mail and does not replace those inboxes or CMS authentication.
3. The **separate website** webhook already exists and is disabled. After the intended preview endpoint is approved and deployed, review that existing webhook for `https://ifranchise-website-preview.damp-field-d970.workers.dev/api/email/webhook`. Select `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained`, `email.failed`, and `email.suppressed`. Store its unique signing secret as `RESEND_WEBHOOK_SECRET` on the same target. Do not reuse the onboarding webhook secret.
4. Keep `/api/email/webhook`, `/api/cms/access-help`, `/cms/access-help`, `/cms/activate`, and public pages/forms outside Cloudflare Access. Webhooks require a valid Svix signature over the untouched request body and timestamp; activation additionally verifies the invited Access identity at the protected POST endpoint. Secure `/admin`, `/admin/*`, `/admin.rsc`, `/api/admin`, `/api/admin/*` as already documented. Activation links hold tokens in a URL fragment, remove it from the address bar, and retain it in session storage only while completing work-account sign-in.
5. Complete Google Workspace Access configuration. Resend does not authenticate users, issue sessions or reset Google passwords. The approved recovery flow emails Google Workspace recovery guidance; there are no app-owned passwords or fake reset tokens. Workspace OAuth remains separate from mail delivery; no Gmail API scopes, refresh tokens or Gmail sender OAuth are needed.
6. Back up preview D1, then apply only the pending reviewed additive migrations (`0003` if still pending, plus `0004`). Never reimport `database/content.sql` into the existing preview. Verify member/content/submission counts and both owners before/after. This step was completed under Stage 2 approval for `0003` and `0004`; no further migrations are pending.
7. Review the built bundle and target binding names; then deploy only when explicitly approved. The dedicated preview config includes a minute cron to drain the durable outbox. Set `EMAIL_MODE=resend` only for approved test recipients. Check the correct environment before every secret/config/deploy action.
8. Send controlled invitation, renewal, activation, access-help and all four enquiry/job notifications. Confirm From/Reply-To, HTML/plain-text rendering, real mailbox arrival, Resend IDs, signed delivered/bounce events and CMS delivery states. Test wrong identity, expired/used token, suspension, non-Super-Admin management denial, duplicate form receipt, public-page access and missing JWT rejection. Never replay historical submissions to test delivery.

### GoDaddy DNS — current records, no changes required for sending

The following records already resolve and match Resend's verified status. **Do not add duplicate SPF records or replace working mail records.** Values below document the existing setup, not permission to edit it.

| Type | GoDaddy Name | Required/current value | Current result |
| --- | --- | --- | --- |
| TXT | `resend._domainkey` | The exact `p=…` public key displayed in the existing Resend domain's Records tab | Present; Resend DKIM Verified |
| MX | `send` | `feedback-smtp.ap-northeast-1.amazonses.com`, priority `10` | Present; Verified |
| TXT | `send` | Effective policy `v=spf1 include:amazonses.com ~all` | Present through the existing SPF-management include; Verified |
| TXT | `_dmarc` | Optional initial monitoring policy `v=DMARC1; p=none;` | No record found in the read-only lookup; requires separate owner approval/policy review |

The live `send` TXT is `v=spf1 include:dc-fd741b8612._spfm.send.ifranchise.in ~all`; that include resolves to `v=spf1 include:amazonses.com ~all`. Preserve the existing SPF management chain. Apex SPF similarly delegates to `dc-aa8e722993._spfm.ifranchise.in`, which includes `_spf.google.com`. The five apex Google MX records remain intact. Do not add a Resend receiving MX at `@`, replace Google MX, add a second apex SPF, change nameservers or enable Resend receiving.

If a required record ever needs repair, use GoDaddy **DNS → ifranchise.in → Add/Edit Record**, with the host labels above (GoDaddy appends the domain), the exact existing-domain values from Resend, and Auto/default TTL or 600 seconds. Review the proposed DNS diff first. No DNS changes were necessary or made for this implementation. See [Resend's GoDaddy guide](https://resend.com/docs/guides/dns/godaddy) and [verified sender-domain behavior](https://resend.com/docs/dashboard/domains/introduction).

### Local implementation and verification

The outbox is committed atomically with new submissions/member events, so provider outages cannot discard them. Retries reuse a frozen encrypted request body and stable idempotency key. Webhooks deduplicate by signed event ID, tolerate send-response races and do not regress delivery states. Eight attempts / a 23-hour retry window stay inside Resend's documented [24-hour idempotency period](https://resend.com/docs/dashboard/emails/idempotency-keys). Unsafe retries require provider reconciliation rather than blind resending.

The local migration retained **5 content records, 2 members and 33 submissions**. Only local schema/state was changed. Both Super Admins remain configured, and role checks are enforced on the server. New invite tokens are 256-bit random, SHA-256 indexed, identity-bound, single-use and valid for 14 days. Local capture works without an API key; actual sending and deployment remain pending approval. The separately approved preview migration is recorded in the current checkpoint above.


Final local verification for this implementation: **172 tests passed** (171 Node tests plus one Sheets-delivery integration test), `pnpm test:cms` passed for eight CMS content types, `pnpm typecheck` and `pnpm build` passed, and the disposable empty-database check passed all five migrations. **74 HTTP checks** passed across localhost/127.0.0.1 on port 3019. The compiled production Worker rejected local sessions, forged JWTs/identity headers and local picker endpoints while public pages stayed accessible. Browser QA confirmed the access-help request was `captured` with zero send attempts and the Super Admin delivery screen loaded. A scan of 298 built files found zero local secret occurrences and no Resend API/key markers in client JavaScript. Those earlier checks performed no live Resend sending, remote migrations, deployment, DNS changes or Git publication. The subsequent approved migration and email/GitHub review are recorded separately above.


### Email design review checkpoint

The shared templates now include the approved wordmark as a PNG, inline typography, a 600px container, centered standard/VML CTAs, minimal summaries and consistent footers. HTML and plain-text previews for every variant are generated by `pnpm email:preview`; generated files stay outside Git. Existing invitation fragments, expiry rules, identity checks, encryption, webhook processing and retry behavior are preserved.

Validation after redesign: 186 Node tests plus one local Sheets integration test passed (187 total); CMS schema checks, typecheck, all five migrations on a disposable local database and the production build passed. Offline Chrome checked nine examples at four viewport widths (36 checks), inline-style fallbacks and image-blocked readability. Actual Gmail/Outlook inbox rendering, live Resend receipt and hosted Workspace login remain pending separately approved hosted testing. No live emails, webhook activation, additional remote migrations or deployment occurred during the redesign.
