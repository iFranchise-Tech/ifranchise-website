# iFranchise website

Source for the iFranchise website and its team administration portal.

- Website: https://ifranchise-studio-2026.babbysyed.chatgpt.site
- Admin portal: https://ifranchise-studio-2026.babbysyed.chatgpt.site/admin
- GitHub destination: `iFranchise-Tech/ifranchise-website` (private)

## Local development

Requires Node.js 22.13 or newer and pnpm 11.25.0. Run commands from this repository root.

```sh
pnpm install --frozen-lockfile
pnpm db:local
pnpm exec wrangler d1 execute DB --local --file=database/content.sql
pnpm dev
```

`pnpm db:local` applies `drizzle/` to the local D1 database under `.wrangler/state`. Import `database/content.sql` once on a new database. Do not import it again after editors have published changes.

`pnpm dev` starts Vinext. Confirm the printed address is **http://localhost:3019/**. No `.env` or `.dev.vars` file is required for the public website.

`pnpm db:verify-empty` repeats the migration and seed on a throwaway local database. It does not use `.wrangler/state` or a remote database. The preview Worker, Access application, and test spreadsheet steps are in [docs/cloudflare-preview.md](docs/cloudflare-preview.md).

### Configuration

Wrangler reads one local secret file. When `.dev.vars` exists, that file wins and `.env` is ignored. When `.dev.vars` is absent, Wrangler reads `.env`. Do not create both. Copy `.dev.vars.example` to `.dev.vars` only after a real value exists, and leave unused lines commented. `.env.example` repeats those placeholders for reference.

Non-secret settings stay in `wrangler.jsonc` for local development and `wrangler.preview.jsonc` for the separate preview Worker. A value in `.dev.vars` overrides the same key from `wrangler.jsonc` during local development. Preview secrets are set with `pnpm exec wrangler secret put --config wrangler.preview.jsonc`, not in either JSON file.

| Variable | Required for | Where it belongs |
|---|---|---|
| `SITE_ACCESS` | Public site. Already `public`. | `wrangler.jsonc` |
| `CMS_SUPER_ADMIN_EMAIL` | First Super Admin. Already `abdul@ifranchise.in`. | `wrangler.jsonc` |
| `DB` | Content and form storage. Local name `ifranchise-db`. | `wrangler.jsonc` binding |
| `BUCKET` | Uploads. Local name `ifranchise-files`. | `wrangler.jsonc` binding |
| `ACCESS_TEAM_DOMAIN` | Staff sign-in, after an Access application exists. | `.dev.vars` locally; preview Worker secret |
| `ACCESS_AUD` | Staff sign-in, after an Access application exists. | `.dev.vars` locally; preview Worker secret |
| `SHEETS_WEBHOOK_URL` | Optional test spreadsheet copy. | `.dev.vars` locally; preview Worker secret |
| `INTAKE_SIGNING_KEY` | Optional test spreadsheet copy. Private JWK. | `.dev.vars` locally; preview Worker secret |
| `CMS_BROCHURE_IMPORT_TOKEN` | Optional one-time brochure import. | `.dev.vars` locally; preview Worker secret |

`pnpm db:local` applies `drizzle/` to the local D1 database under `.wrangler/state`. `pnpm exec wrangler d1 migrations apply DB --remote --config wrangler.preview.jsonc` applies the same files to `ifranchise-db-preview` only after its real database id replaces the placeholder. Do not run `pnpm db:remote` for this work. Local R2 is simulated in `.wrangler/`. The preview bucket is `ifranchise-files-preview`.

Opening `/admin` in a browser returns the staff sign-in screen with status 401. Cloudflare Access cannot complete that sign-in on localhost, because it only issues a session for the hostname on the Access application. Admin APIs and resume downloads stay 401 without a valid token. There is no local password or preview identity. A real sign-in can be checked only on the preview hostname after the account owner creates the Access application.

### Database

Migrations live in `drizzle/` and apply only to the database selected by the Wrangler command. `pnpm db:local` never writes to production. `pnpm db:remote` is reserved for an approved production change. Local state in `.wrangler/` is gitignored.

No scheduled D1 or R2 backup is configured in this repository. Before an approved production change, export the database with `pnpm exec wrangler d1 export ifranchise-db --remote --output backup.sql` and copy required R2 objects with `pnpm exec wrangler r2 object get`. Those commands have not been run against production from this branch.

### Google Sheets

Forms are stored in D1 first. If `SHEETS_WEBHOOK_URL` and `INTAKE_SIGNING_KEY` are unset, the row stays `pending` and nothing is sent. When both are set in `.dev.vars` for a test spreadsheet, or as preview Worker secrets, the server signs the body and posts it after the database insert. A failed or unconfirmed response increments `attempts` and leaves `sheet_status` as `pending`. The visitor still receives the stored-submission response. The next submission retries up to two older pending rows, and a staff member who can edit enquiries or applications can run **Submissions → Sync pending**. Privacy requests are not sent to Sheets. `pnpm test` verifies that retry against a local database and a local webhook. It has not been confirmed against Google. Do not point a test at the production spreadsheet.

## Checks and build

```sh
pnpm test
pnpm test:cms
pnpm typecheck
pnpm lint
pnpm build
```

Browser and HTTP checks in `tests/` require a running local preview. Inspect each script for its base URL before running it.

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

The live site remains on its current Sites deployment until a separate cutover is approved. This branch runs locally. A later preview uses `wrangler.preview.jsonc` and a new D1 database, R2 bucket, and Access application. A push does not publish the website, change DNS, or apply remote migrations. See [docs/cloudflare-preview.md](docs/cloudflare-preview.md).

`.openai/hosting.json`, `vite.config.sites.ts`, and `build/sites-worker.ts` remain in the repository so the Sites path can be restored. They are not the active local runtime. `pnpm dev:sites` still starts the previous Sites command.

Runtime credentials, local databases, build output and private uploads must remain outside Git. Configure production secrets through Wrangler after the preview worker is approved. CRM intake stays off. The previous gateway origin is retained and is not called.
