# Website Issues (2) — implementation and verification

Date: 28 October 2026. Source: the supplied 58-page Website Issues (2).pdf. This report covers this revision only; it does not certify legal compliance or every historical request.

## Changes by issue group

- **001 — brand headers:** kept the shared compact brand heading layout; corrected qualitative brand presence so text such as “Growing Omnichannel Presence” is not given an “outlets” suffix. Numeric outlet counts still receive the appropriate singular/plural label. Description remains full width.
- **002 — typography:** aligned shared heading/form roles with the existing homepage fonts; reduced the oversized Saved Resources heading. The previously rejected typography PDF has not been reapplied and the homepage typography is unchanged.
- **003 — WhatsApp and sorting:** compact brand-blue circular WhatsApp control, safe-area spacing, subtle motion with reduced-motion support, and existing page exclusions retained. Sort by now has a visible label and a contained dropdown arrow on mobile and desktop.
- **004 / 012 — Articles and Videos:** replaced only these two hero images with new real-stock strategy-discussion and podcast-studio photographs. Supplied responsive WebP variants, including mobile sources, and recorded source credits. Articles retains its exact heading with natural wrapping and left alignment. Other page imagery is unchanged by this revision.
- **005 / 009 — shared form flow:** all public intake kinds now use a server-confirmed thank-you page with a check animation and a Home action. No contact details or receipt identifiers are placed in the URL. Direct visits without a recent confirmed receipt show neutral copy. State/city controls support keyboard interaction, state search, two-character city suggestions, city aliases and valid manual city names. City is disabled until state selection; changing state clears the old city. Dropdowns open on user intent, not merely because step two receives focus. Back/Continue preserves valid data.
- **006 — performance:** reviewed local route response times, initial linked bundles and asset caching. Replaced a pre-hydration class mutation in reveal animations with the Web Animations API to avoid hydration mismatch/flicker. Existing responsive assets, lazy loading, private-route exclusions and cache revision checks remain in place. Measurements and limits are below.
- **007 — Instagram sharing:** opens the official Instagram destination synchronously and offers the copied link/manual paste workflow. Does not claim to automatically publish or prefill unsupported Instagram posts.
- **010 / 013 — mobile heroes:** corrected mobile padding that counted the header twice, kept safe-area spacing, and verified About hero text placement while preserving its photograph and CTA.
- **011 — enquiry rail:** one flush-right, narrow control with consistent purple Enquire and white collapse portions, equal widths and appropriate outer corners. Existing full-control dragging, keyboard movement, collapse and modal behavior remain intact; modal contains the form only.
- **014 — privacy choices:** removed internal storage keys and notice versions from public-facing explanatory text. Added human-readable saved/expiry status, 180-day consent expiry, invalid/future/version-mismatched-value handling and status refresh when an open page's saved choice expires. Existing users' consent values are not changed by the release itself.
- **015 — navigation stability:** narrowed header mutation observation to relevant route/hero/navigation changes, preventing form step changes from repeatedly reinitializing header state. Contact mode switching was checked for stable header and logo dimensions.
- **016 — configuration/security:** added an empty-value .env.example and ignored local environment files. Signing key, Sheets receiver URL and admin bootstrap configuration remain server-side. No database schema, intake API contract, Apps Script receiver, delivery configuration, hosting audience or admin permissions were changed.

## Verification performed

- **130/130 automated Node tests passed**, including the four new regression tests in tests/issues-two.test.mjs. The four new tests were also rerun separately and passed.
- **109/109 HTTP checks passed** against the local application: invalid public intake requests rejected; normalized valid investor, brand, general, privacy and job submissions stored locally; duplicate safety checked; both admin email validation endpoints checked.
- **TypeScript check passed** after the final source edit.
- **Production build passed** using the Sites build helper. Asset revision: `7173fb940ed83b18`.
- **11 production routes returned HTTP 200** in the local release smoke check.
- **In-app browser, 390 × 844:** invalid 11-digit mobile number blocked Continue; correcting to 10 digits cleared the obsolete error and allowed step two; state/city keyboard selection worked; Back/Continue retained values; a valid local submission displayed Sending and navigated to the thank-you page. No external message was delivered by this test.
- **In-app browser, mobile:** Videos banner and compact WhatsApp control reviewed; Sort by label visible and sorting functional; qualitative Franco brand presence correct; enquiry rail collapse/expand and keyboard movement worked; modal displayed the form only. No horizontal overflow on reviewed pages. About hero screenshot saved.
- **In-app browser, 1440 × 900:** Articles hero and text reviewed; Contact Explore/Expand mode switching retained an 80 px header and 190 px logo width across three switches, with no horizontal overflow. Privacy choice status and cookie-settings dialog checked without changing the saved choice. No warning/error console entries on the reviewed Articles/Privacy pages.
- Static client-bundle audit found no occurrences of private configuration names INTAKE_SIGNING_KEY, SHEETS_WEBHOOK_URL or CMS_SUPER_ADMIN_EMAIL in generated client JavaScript. This is a targeted exposure check, not a penetration test.

## Local performance observations

These are local development-machine release-server observations, not public-host or real-user speed claims. The before column is the median of the existing local response-time samples; after is the median of three final-release time-to-first-byte samples. They are useful smoke checks but not a controlled performance benchmark. The first homepage request was cold (195.8 ms), with subsequent requests at 21.6 and 18.8 ms.

| Route | Before local median (ms) | Final local TTFB median (ms) | Initial linked JS files | JS gzip estimate |
|---|---:|---:|---:|---:|
| `/` | 26.0 | 21.6 | 21 | 134.4 KiB |
| `/franchise-opportunities` | 13.0 | 11.4 | 26 | 144.4 KiB |
| `/franchise/emori` | 19.0 | 12.7 | 35 | 211.8 KiB |
| `/contact-us` | 14.0 | 10.4 | 34 | 200.2 KiB |
| `/list-your-brand` | 13.0 | 9.4 | 29 | 198.6 KiB |
| `/about-us` | 10.0 | 7.3 | 21 | 133.3 KiB |
| `/careers` | 11.0 | 7.8 | 29 | 144.4 KiB |
| `/resources` | 26.0 | 22.3 | 27 | 144.5 KiB |
| `/resources/articles` | 22.0 | 18.5 | 28 | 144.9 KiB |
| `/resources/videos` | 10.0 | 7.1 | 28 | 144.9 KiB |
| `/privacy-choices` | 10.0 | 8.5 | 25 | 196.8 KiB |

All routes reference one shared CSS file: 524,471 raw bytes, approximately 91.4 KiB when gzip-compressed locally. JS estimates count unique initial HTML script/modulepreload URLs, not lazy chunks or all browser requests. The table excludes fonts, images, video and HTML compression, so it is not total page weight. The larger shared CSS is an existing consolidation opportunity; removing historical overrides wholesale was avoided in this corrective release because it can alter unrelated layouts.

Responsive hero assets use 640/960/1440/2400/3200-width WebP sources plus mobile variants. Largest source files: Articles 393,576 bytes; Videos 943,524 bytes. Actual selection depends on viewport and pixel density. Existing tests for content-hashed caching, asset revision updates, repeated requests and private endpoint exclusions passed.

## Remaining limits

- No actual Windows, Android or iPhone device was available in this run. Responsive in-app Chromium checks do not constitute Safari/WebKit, Android hardware or Windows verification. iOS status-bar/browser-chrome behavior needs a real iPhone check.
- LCP, INP, CLS, real-network transfer size, throttled-network timings and public-host loading times have not been measured here. They must not be represented as passing or as improved by a measured percentage.
- The live Google Sheets and email integrations were not sent synthetic leads. API storage, normalization and success behavior were verified locally with outbound delivery disabled. Existing delivery wiring was preserved.
- Whole-rail pointer/touch dragging is preserved in source; keyboard movement and collapse/expand were exercised. Physical touch dragging was not verified in this run.
- Instagram's manual paste/share step was not completed and no social post was published.
- Form correction/resubmission was exercised end-to-end in Contact Us; all five public intake kinds passed HTTP regression checks. A complete visual submission through each separate form, a real resume upload and every browser autofill configuration were not repeated.

## Main implementation files

Shared form/location/confirmation: components/location-fields.tsx, lib/location-search.mjs, components/submission-confirmation.tsx, lib/intake/confirmation.mjs, app/thank-you/page.tsx, components/enquiry.tsx, components/enquiry-confirmation.tsx, components/job-application.tsx, components/privacy-request.tsx.

Navigation/layout/actions: components/shell.tsx, components/premium-motion.tsx, components/franchise-detail.tsx, components/resource-actions.tsx, lib/return-details.mjs, app/issues-two.css, app/layout.tsx.

Privacy/configuration: lib/measurement.mjs, components/privacy.tsx, components/managed-legal-page.tsx, app/privacy-choices/page.tsx, lib/cms/legal-defaults.ts, .env.example, .gitignore.

Assets/tests: lib/page-banners.ts, lib/stock-hero-manifest.json, docs/image-credits.md, twelve responsive hero WebP files, tests/issues-two.test.mjs.
