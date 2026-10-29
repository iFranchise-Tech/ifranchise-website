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

`pnpm dev` starts Vinext. Confirm the printed address is **http://localhost:3019/**.

Copy `.env.example` to `.env` before adding secrets. The example has every secret commented out, so it does not override `wrangler.jsonc`. Public pages work with that file unchanged. If `.dev.vars` exists, Wrangler uses it and ignores `.env`.

### Environment

| Variable | Required for | Where it is read |
|---|---|---|
| `SITE_ACCESS` | Public vs whole-site lock. `public` is already set in `wrangler.jsonc`. | Worker config, not `.env` |
| `ACCESS_TEAM_DOMAIN` | Admin sign-in | `.env` or `.dev.vars`, overriding `wrangler.jsonc` when set |
| `ACCESS_AUD` | Admin sign-in | same |
| `CMS_SUPER_ADMIN_EMAIL` | First Super Admin, `@ifranchise.in` only | `wrangler.jsonc`, or `.env` when uncommented |
| `SHEETS_WEBHOOK_URL` | Optional Google Sheets copy of form submissions | `.env` |
| `INTAKE_SIGNING_KEY` | Optional Google Sheets copy. Private JWK JSON | `.env` |
| `CMS_BROCHURE_IMPORT_TOKEN` | Optional one-time brochure import | `.env` |

For production, set `INTAKE_SIGNING_KEY` and `SHEETS_WEBHOOK_URL` with `pnpm exec wrangler secret put`, not in the repository. `DB` and `BUCKET` are Cloudflare bindings. The `database_id` in `wrangler.jsonc` is still a placeholder.

Local `/admin` returns 401 until `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` match a Cloudflare Access application and the request carries a valid token. Protect only `/admin`, `/admin/*`, `/api/admin`, and `/api/admin/*`. Do not protect the public site or `/api/intake`. There is no local preview identity.

### Database

Migrations live in `drizzle/` and apply only to the database selected by the Wrangler command. `pnpm db:local` never writes to production. `pnpm db:remote` is reserved for an approved production change. Local state in `.wrangler/` is gitignored.

No scheduled D1 or R2 backup is configured in this repository. Before an approved production change, export the database with `pnpm exec wrangler d1 export ifranchise-db --remote --output backup.sql` and copy required R2 objects with `pnpm exec wrangler r2 object get`. Those commands have not been run against production from this branch.

### Google Sheets

Forms are stored in D1 first. If `SHEETS_WEBHOOK_URL` and `INTAKE_SIGNING_KEY` are unset, the row stays `pending` and nothing is sent. When both are set, the server signs the body and posts it after the database insert. A failed or unconfirmed response increments `attempts` and leaves `sheet_status` as `pending`. The visitor still receives the stored-submission response. The next submission retries up to two older pending rows, and a staff member who can edit enquiries or applications can run **Submissions → Sync pending**. Privacy requests are not sent to Sheets. This delivery path has not been confirmed against a live workbook. Do not point a test at the production spreadsheet.

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

The live site remains on its current Sites deployment until a separate cutover is approved. This branch runs locally and, later, on a preview Cloudflare Worker. A push does not publish the website, change DNS, or apply remote migrations.

`.openai/hosting.json`, `vite.config.sites.ts`, and `build/sites-worker.ts` remain in the repository so the Sites path can be restored. They are not the active local runtime. `pnpm dev:sites` still starts the previous Sites command.

Runtime credentials, local databases, build output and private uploads must remain outside Git. Configure production secrets through Wrangler after the preview worker is approved. CRM intake stays off. The previous gateway origin is retained and is not called.
