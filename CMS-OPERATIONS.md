# Website admin

Portal: `/admin`. Hosted authentication is provided by Sites. Only verified `@ifranchise.in` identities with an active or unexpired invited membership can enter. Identity is bound to the site's stable authenticated user ID after the first accepted invitation. The initial Super Admin is configured through the `CMS_SUPER_ADMIN_EMAIL` runtime variable, not client code. The portable local starter uses an explicitly development-only preview identity; this is removed from production bundles.

## Roles

- Super Admin: all sections, team administration and approvals.
- Approver: view/edit assigned sections and approve submissions in their reporting chain; cannot approve their own submissions.
- Editor: create/edit/submit assigned sections.
- Viewer: read assigned content and previews.

Assign every non-super-admin employee to an active Approver or Super Admin. Manager scopes must cover the employee's scopes. Circular hierarchies and removal of one's own Super Admin access are rejected. Suspensions apply to subsequent requests immediately. Invitations expire after 14 days and can be renewed. Invitations are email-bound; no transferable bearer invite token is used.

The portal creates access invitations and provides a prefilled email through the sender's mail application. It does not send emails automatically. The site's current private/custom audience is an independent platform gate: new employees also need access in the site's native sharing settings. Existing shared colleagues still need a CMS invitation and assigned role. Sharing grants alone never grant CMS edit rights.

## Publishing

Franchises, jobs, articles, homepage copy, FAQs, and franchise display order use the same workflow: draft → submit → review → publish/request changes. Published snapshots remain unchanged while drafts are edited. Removal is a reviewed archive action; archived content can be restored as a new draft. URL slugs stay stable after creation. Revision restore never publishes automatically.

Content and membership writes use optimistic version checks. Membership edits also guard against concurrent hierarchy changes. Immutable audit events accompany transactional content mutations. Original imported content is captured in history on its first edit. Previews and API responses are protected and are not cacheable. Public routes read published records only. Built-in content provides the initial catalogue until a database override exists; tombstones prevent archived built-in entries reappearing.

## Storage and operations

D1 (`DB`) stores memberships, content snapshots, audit events and media metadata. R2 (`BUCKET`) stores uploads. Add schema changes through new Drizzle migrations; do not modify applied migrations or run DDL in handlers. Keep cloud databases intact when deploying new versions. Local `.wrangler/state` is disposable QA data and is never packaged. Production records and files are not stored in the source archive.

Uploads are restricted to PNG, JPEG, WebP and PDF, checked by content signature and size (8 MB). Uploaded draft files require authorized membership. An upload becomes public only while referenced in a current published record. SVG/HTML uploads are not accepted. Draft documents are never sent to another service. Public media responses use a restrictive content policy and no browser cache so archived files stop being publicly accessible on subsequent requests.

Lead intake, enquiry relays and advertising conversion sending remain disabled. This portal does not enable lead collection, marketing automation or analytics.

## Validation

- `node --test tests/cms-policy.test.mjs`
- `node tests/cms-http.mjs` — disposable dev preview on 127.0.0.1:3027 only.
- `node tests/cms-permissions-http.mjs` — production Worker locally on 127.0.0.1:3028, test identities in disposable local storage.
- `node tests/cms-media-http.mjs` — local production Worker upload/access tests.
- TypeScript check, framework build and responsive browser checks in both themes.

HTTP tests intentionally mutate local test data and must never target the hosted site. Test identities must not be seeded in hosted storage. The deployed bootstrap account is accepted only after real Sites sign-in with the configured work email; production sign-in needs the owner's account.
