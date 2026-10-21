# iFranchise website

Source for the iFranchise website and its team administration portal.

- Website: https://ifranchise-studio-2026.babbysyed.chatgpt.site
- Admin portal: https://ifranchise-studio-2026.babbysyed.chatgpt.site/admin
- GitHub destination: `iFranchise-Tech/ifranchise-website` (private)

## Local development

Requires Node.js 22.13 or newer and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The development server prints its local address. For the complete Sites and Cloudflare setup, see [development notes](docs/development.md).

## Checks and build

```sh
pnpm exec tsc --noEmit
node --test tests/*.test.mjs
pnpm build
```

Browser and HTTP checks in `tests/` require a running local preview; inspect each script for its base URL and fixtures before running it. Development authentication and local storage are for preview only.

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

Production is hosted through Sites. Keep the existing identity and D1/R2 bindings in `.openai/hosting.json`. Use the Sites workflow to validate, build, save and deploy the exact source commit. GitHub stores the source; a push to this repository does not publish the website automatically.

Runtime credentials, local databases, build output and private uploads must remain outside Git. Configure production secrets through the hosting service. CRM intake and analytics follow their existing hosting configuration; copying the source does not activate them.
