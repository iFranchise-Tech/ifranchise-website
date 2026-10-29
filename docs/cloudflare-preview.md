# Preview Cloudflare Worker

This is the setup for a separate preview. It does not change the live Sites deployment, DNS, production D1, production R2, or the existing Access application.

`wrangler.jsonc` stays the local config. Its D1 id is a placeholder. `wrangler.preview.jsonc` names the preview Worker `ifranchise-website-preview`, the database `ifranchise-db-preview`, and the bucket `ifranchise-files-preview`. Its database id is also a placeholder (`00000000-0000-4000-8000-000000000001`). Replace that id only with the new preview database. Do not paste the production database id into either file.

`workers_dev` and `preview_urls` are false in both files. A push does not deploy. Do not run `pnpm db:remote` for this work. `pnpm db:remote` uses `wrangler.jsonc`.

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

`pnpm db:verify-empty` creates a throwaway local database, applies `drizzle/0000` through `drizzle/0002`, imports `database/content.sql` once, and deletes that database. It expects exactly these five editorial rows and zero submissions:

| kind | slug | status |
|---|---|---|
| blogs | what-to-notice-on-your-first-franchise-visit | published |
| industries | medical-industry | draft |
| jobs | qa-engineer | draft |
| jobs | ui-ux-designer | archived |
| placements | franchises | published |

A second import of `database/content.sql` must fail. Do not import it again after anyone has edited the preview database. The command does not read or write `.wrangler/state`.

`pnpm dev` remains http://localhost:3019/. Public pages and `/api/intake` stay anonymous. `/admin`, `/api/admin`, and `/api/admin/intake/resume/...` return 401 until a real Access token is present.

## Account owner: create the preview resources

Run these with a Cloudflare account that is allowed to create preview resources. Do not select the production D1 database or the production R2 bucket.

```sh
pnpm exec wrangler d1 create ifranchise-db-preview
pnpm exec wrangler r2 bucket create ifranchise-files-preview
```

Copy the printed D1 id into `database_id` in `wrangler.preview.jsonc`. Leave `database_name` as `ifranchise-db-preview`.

Apply the migrations to that new database, then import the editorial seed once:

```sh
pnpm exec wrangler d1 migrations apply DB --remote --config wrangler.preview.jsonc
pnpm exec wrangler d1 execute DB --remote --config wrangler.preview.jsonc --file=database/content.sql
```

Stop if the database id is still the placeholder, or if the command names any database other than `ifranchise-db-preview`.

Deploy the preview Worker only after those resources exist. This command is manual; CI does not run it.

```sh
pnpm exec wrangler deploy --config wrangler.preview.jsonc
```

Do not add a route for `ifranchise.in`, `www.ifranchise.in`, or the current Sites hostname. Attach a separate preview hostname later, after Access is in place. Leave DNS for the live site unchanged.

## Account owner: Access application

Create a new self-hosted Access application for the preview hostname only.

Protect these paths:

- `/admin`
- `/admin/*`
- `/api/admin`
- `/api/admin/*`

Leave the public site and `/api/intake` outside that application. Allow only `@ifranchise.in` identities.

The Worker also lets `POST /api/admin/brochures` reach the route without an Access token so the route can require either a Super Admin or `CMS_BROCHURE_IMPORT_TOKEN`. The route still requires a same-origin request and one of those credentials. Keep `POST /api/admin/brochures` inside the Access application as well unless the account owner deliberately adds a bypass for that one import. A bypass is not required for preview.

From the new Access application, copy the team domain and the application audience (AUD). Set them on the preview Worker only:

```sh
pnpm exec wrangler secret put ACCESS_TEAM_DOMAIN --config wrangler.preview.jsonc
pnpm exec wrangler secret put ACCESS_AUD --config wrangler.preview.jsonc
```

`ACCESS_TEAM_DOMAIN` is the issuer origin, such as `https://team-name.cloudflareaccess.com`. Empty values fail closed. There is no local preview identity. The first successful sign-in of `CMS_SUPER_ADMIN_EMAIL` (`abdul@ifranchise.in`) creates the Super Admin row only when that preview database has no Super Admin yet.

## Account owner: Google Sheets test copy

Do not call the production workbook `1eavzRbd_ajJsX9Hj6XaPiPsksXIzB7pdT8WhI6KesJk`, and do not replace the public key in the production Apps Script.

1. Make a separate spreadsheet with the four tabs `Franchise Enquiries`, `Brand Expansion`, `General Enquiries`, and `Job Applications`.
2. Run `node scripts/create-intake-keys.mjs`. It writes a new key pair under `.secrets/`, which is gitignored.
3. Put only the new public key in a copy of `Code.gs` bound to the test spreadsheet, and deploy that copy as a new web app.
4. Store the test web app URL and the new private JWK on the preview Worker:

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
