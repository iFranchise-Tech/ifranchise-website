# Website admin

Portal: `/admin`. Sign-in is Cloudflare Access. The Worker and `adminIdentity()` both require a valid Access token. Only verified `@ifranchise.in` identities with an active or unexpired invited membership can enter. Identity is bound to the Access subject after the first accepted invitation. The initial Super Admin is configured through `CMS_SUPER_ADMIN_EMAIL`, not client code. There is no local preview identity: `/admin` returns 401 until Access is configured.

## Roles

- Super Admin: all sections, team administration, direct publishing and approvals.
- Approver: view/edit and publish assigned sections directly; approve submissions in their reporting chain. Own changes never require a separate approval. Existing self-submissions can be published directly.
- Editor: create/edit/submit assigned sections.
- Viewer: read assigned content and previews.

Assign every non-super-admin employee to an active Approver or Super Admin. Manager scopes must cover the employee's scopes. Circular hierarchies and removal of one's own Super Admin access are rejected. Suspensions apply to subsequent requests immediately. Invitations expire after 14 days and can be renewed. Invitations are email-bound; no transferable bearer invite token is used.

The portal creates access invitations and provides a prefilled email through the sender's mail application. It does not send emails automatically. Cloudflare Access is a separate gate: a CMS invitation does not admit someone whom Access rejects, and an Access login does not grant CMS edit rights by itself.

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
