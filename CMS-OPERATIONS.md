# Website admin

Portal: `/admin`. Sign-in is Cloudflare Access. The Worker and `adminIdentity()` both require a valid Access token. Only verified `@ifranchise.in` identities with an active or unexpired invited membership can enter. Identity is bound to the Access subject after the first accepted invitation. Configured Super Admins are listed in `CMS_SUPER_ADMIN_EMAIL` (`abdul@ifranchise.in` and `sumanth.reddy@ifranchise.in`) and seeded by `drizzle/0003_dual_super_admins.sql`. Other company addresses do not become Super Admins automatically. Passwords remain with Google Workspace through Cloudflare Access. The CMS can send an access-help email through Resend; it cannot reset a Workspace password. Localhost uses the development session documented in the README.

## Roles

- Super Admin: all sections, team administration, direct publishing and approvals.
- Approver: view/edit and publish assigned sections directly; approve submissions in their reporting chain. Own changes never require a separate approval. Existing self-submissions can be published directly.
- Editor: create/edit/submit assigned sections.
- Viewer: read assigned content and previews.

Assign every non-super-admin employee to an active Approver or Super Admin. Manager scopes must cover the employee's scopes. Circular hierarchies and removal of one's own Super Admin access are rejected. Suspensions apply to subsequent requests immediately. Invitations expire after 14 days and can be renewed. New invitations require both a cryptographically random, single-use token and the matching verified Cloudflare Access identity. Tokens expire after 14 days, are stored only as SHA-256 digests, and are revoked on renewal or suspension. Existing legacy invitations keep their email-bound sign-in behavior until renewed.

The portal queues branded Resend invitation emails from `iFranchise <it@ifranchise.in>`. It sends activation confirmations and administrative notifications as well. The Super Admin **Email delivery** section shows delivery states and permits safe retries; it never exposes bodies, tokens or keys. Cloudflare Access is a separate gate: a CMS invitation does not admit someone whom Access rejects, and an Access login does not grant CMS edit rights by itself.

## Publishing

Franchises, jobs, articles, homepage copy, FAQs, and franchise display order share permission-aware publishing. Super Admins and Approvers with edit access to the affected section use Publish / Save changes to save and publish atomically. Their removal actions archive immediately. Save draft remains an explicit optional action. Editors without approval permission use draft → submit → manager review → publish/request changes, including removal requests. Old clients submitting as an authorised publisher are processed directly instead of queued. Reporting-chain restrictions still apply when reviewing another employee’s submission. Published snapshots remain unchanged while explicit drafts are edited. Archived content and previous revisions can be restored as a draft before publishing. URL slugs stay stable after creation.

Content and membership writes use optimistic version checks. Membership edits also guard against concurrent hierarchy changes. Immutable audit events accompany transactional content mutations. Original imported content is captured in history on its first edit. Previews and API responses are protected and are not cacheable. Public routes read published records only. Built-in content provides the initial catalogue until a database override exists; tombstones prevent archived built-in entries reappearing.

## Storage and operations

D1 (`DB`) stores memberships, content snapshots, audit events and media metadata. R2 (`BUCKET`) stores uploads. Add schema changes through new Drizzle migrations; do not modify applied migrations or run DDL in handlers. Keep cloud databases intact when deploying new versions. Local `.wrangler/state` is disposable QA data and is never packaged. Production records and files are not stored in the source archive.

Uploads are restricted to PNG, JPEG, WebP and PDF, checked by content signature and size (8 MB). Uploaded draft files require authorized membership. An upload becomes public only while referenced in a current published record. SVG/HTML uploads are not accepted. Draft documents are never sent to another service. Public media responses use a restrictive content policy and no browser cache so archived files stop being publicly accessible on subsequent requests.

Public forms can be stored in local D1. Optional Google Sheets delivery runs only after that insert and only when both sheet secrets are set. A failed delivery leaves the row pending for retry. Enquiry relays and advertising conversion sending remain disabled.

## Validation

- `node --test tests/cms-policy.test.mjs`
- `node tests/cms-http.mjs` — disposable dev preview on 127.0.0.1:3027 only.
- `node tests/cms-permissions-http.mjs` — production Worker locally on 127.0.0.1:3028, test identities in disposable local storage.
- `node tests/cms-media-http.mjs` — local production Worker upload/access tests.
- TypeScript check, framework build and responsive browser checks in both themes.

HTTP tests intentionally mutate local test data and must never target the hosted site. Test identities must not be seeded in hosted storage. The bootstrap account is accepted only after a real Cloudflare Access sign-in with the configured work email. Production sign-in needs the owner's Access application and has not been verified from this branch.


## Transactional email operations

- Website franchise, expansion, general enquiry and job notifications use `iFranchise <contact@ifranchise.in>`. Notifications go to `WEBSITE_NOTIFICATION_TO` (default `contact@ifranchise.in`), with the validated submitter email as Reply-To. Resume attachments, private file URLs and free-text form contents stay in the CMS. Privacy requests are not copied to Resend or Sheets.
- CMS invitations, activation confirmations, access-help emails, team changes and content submit/publish/reject/archive notifications use `iFranchise <it@ifranchise.in>`. Administrative notifications go to `CMS_NOTIFICATION_TO` (default `it@ifranchise.in`). Only the two configured Super Admins can manage staff or delivery operations. Neither may be demoted/suspended through team management.
- `EMAIL_MODE=disabled` is the safe hosted default. New website notifications remain queued; new invitations fail cleanly before changing membership if email configuration is unavailable. `capture` works only in a development build and never calls Resend. `resend` requires the key, encryption key, canonical origin and environment; preview/local sending additionally requires an explicit recipient allowlist. No real messages are sent by automated tests.
- Additive migration `0004_transactional_email.sql` must be applied before this version runs. It preserves existing members/content/submissions and adds the outbox, signed-event receipts, rate limits, invitation hashes and the invitation-required flag. Remote migrations require separate approval.
- D1 commits each source event and its outbox entry together. Resend failures do not lose website submissions. Background delivery uses `waitUntil`; a scheduled handler drains pending messages. The dedicated preview Worker config includes a once-per-minute cron. Cloudflare branch Previews do not run Cron Triggers; use **Process pending emails** for branch QA, or use the existing dedicated staging Worker.
- Delivery states distinguish `queued`, `sending`, `retry`, `accepted`, `sent`, `delayed`, `delivered`, `bounced`, `complained`, `suppressed`, `failed`, `blocked`, `manual_review`, `cancelled` and local-only `captured`. API acceptance does not mean inbox delivery. Signed webhooks determine recipient-server delivery; events are replay-safe and order-safe, including events arriving before the send response.
- Requests use one permanent D1 deduplication key and a stable Resend idempotency key/body. Retries back off from one minute to one hour and stop after eight attempts or 23 hours from the first attempt. `manual_review` messages must be reconciled in Resend before any new delivery is requested. Do not reset those rows or replay old submissions blindly. Safe UI retries apply only to unsent failed/blocked rows within the retry window; every retry is audited.
- Structured logs contain only message/event IDs, states and fixed error codes. They omit keys, message bodies, tokens and recipients. Message payloads are AES-GCM encrypted using a dedicated environment-specific `EMAIL_OUTBOX_KEY`. Keep this key stable while pending mail exists; rotation needs a controlled drain/re-encryption plan. Terminal payloads are cleared after 30 days by maintenance, while deduplication/delivery metadata remains. Expired invitation hashes are removed after a further 30 days; raw event-receipt metadata is pruned after 90 days while the outbox retains its deduplication key and final delivery state.
- Access help is same-origin, rate-limited by IP and email, and returns the same response for known and unknown work addresses. It supplies Google recovery guidance, not a CMS password-reset token. No application passwords are created or stored, so no new password-hashing system is introduced.
- See `docs/cloudflare-preview.md` for the exact environment, Resend, webhook and GoDaddy setup checklist. Google Workspace/Cloudflare Access OAuth remains necessary for identity; Gmail API scopes, Gmail refresh tokens and Gmail sending credentials are not used.

### Template review and mail-client compatibility

`lib/email/templates.mjs` owns the shared layout, copy, details and CTA rendering. Every message has HTML and plain text. Dynamic text and attributes are escaped; links reject unsafe schemes or embedded credentials. Enquiry emails retain only the reference, sender name and applicable job title; private messages, phone numbers, CVs and download links remain in the CMS.

Run `pnpm email:preview` for an offline collection with fictional sample data. `tests/email-templates.test.mjs` checks sender/Reply-To, fragment token preservation, recovery guidance, escaping, layout fallbacks and the logo. Existing integration tests continue to exercise encryption, invitations, activation, authorization, outbox retries and signed delivery events with mocked network calls.

The layout uses tables, inline CSS and absolute HTTPS PNG images. Embedded styles only enhance mobile spacing; fixed-width conditional tables and VML CTAs cover classic Outlook. See [Gmail CSS support](https://developers.google.com/workspace/gmail/design/css) and [Microsoft's Outlook rendering guidance](https://learn.microsoft.com/en-us/dynamics365/customer-insights/journeys/email-troubleshoot-rendering). Offline Chrome checks at 740, 600, 375 and 320 pixels verify no horizontal overflow, centered CTAs, image loading and inline-style fallbacks. These checks do not substitute for actual Gmail/Outlook inbox screenshots. Real mailbox tests remain pending separate approval to send controlled previews; no test emails were sent during redesign.
