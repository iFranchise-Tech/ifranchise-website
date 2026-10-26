# Global contact validation audit

Verified locally on 26 October 2026. This report covers the iFranchise website repository, including its public intake and website administration screens.

## Form inventory and migration

| Form / surface | Email and phone coverage | Implementation |
| --- | --- | --- |
| Contact us: Explore a franchise and Expand business | Both fields, including switching journeys | Existing `components/enquiry.tsx` inherits the updated shared fields and submission preflight. |
| List your Brand | Both fields | Same shared enquiry form. |
| Franchise details: desktop enquiry and mobile modal | Both fields for every brand | Same shared enquiry form, including future brands. |
| Careers: Business Development Trainee and Asst. Business Development Manager (Franchise Expansion) | Both fields | Existing `components/job-application.tsx` inherits the updated fields and preflight; future job applications use the same component. |
| Privacy choices request | Email | Raw input migrated in `components/privacy-request.tsx`. |
| Admin: invite employee / employee access | Work email | `components/admin/fields.tsx` now uses the shared email input; `components/admin/portal.tsx` validates before requesting a save. Existing member email remains read-only. |
| Admin: job editor, Application section | Work email | Shared admin field, with validation before draft save, submit, publish and preview in `components/admin/editor.tsx`. Invalid hidden fields reveal the Application section. |

The twelve brand routes exercised were `/franchise/odette`, `/franchise/original-burger-co`, `/franchise/franco`, `/franchise/biggies-burger`, `/franchise/bigguys`, `/franchise/brand-avenue`, `/franchise/lassi-n-cafe`, `/franchise/fusion-pizza-big-burger`, `/franchise/kasturi-creations`, `/franchise/10-downing-street`, `/franchise/freshco-goli-soda`, and `/franchise/emori`.

Repository searches covered raw email/tel inputs, generic admin fields, contact payload construction, normalization, API validation and contact-property names. No editable CRM contact/profile, public registration, or candidate onboarding form exists in this repository. The website's submission list displays stored contacts read-only. Hosted authentication and the separate HR/onboarding applications are outside this repository; they were not modified. Archived jobs without active application forms do not create additional input implementations.

## Shared implementation

- `components/contact-fields.tsx`: `EmailField` and `PhoneField`, including keyboard and pointer selection, browser autofill, focus/error associations, gentle blur validation, and viewport-aware dropdown positioning.
- `lib/contact-validation.mjs`: shared email syntax/domain checks, known typo suggestions, work-domain policy, country metadata, national input parsing, phone validation and E.164 normalization. It reuses the installed `libphonenumber-js/max`; no dependency was added.
- `components/intake-fields.tsx`: validates and normalizes again before constructing public submission payloads.
- `app/contact-fields.css`, imported by `app/layout.tsx`: contained, scrollable dropdowns, focus/error styling and small-screen layout.
- `lib/cms/policy.mjs`, `lib/cms/validation.ts`, `app/api/admin/route.ts`: apply the same email validation independently on the server to admin identity policy, job content and employee invitations.
- Existing `lib/enquiry.mjs` and `lib/intake/validation.mjs` already import the common validators. All five intake kinds—investor, brand, general, job and privacy—therefore receive the stricter backend rules. Legacy enquiry adapters also retain those common rules.

Email suggestions are opt-in completions. Known typo domains such as `gmial.com` produce a correction suggestion and block submission until the user corrects the address. Common providers are suggestions, not an allowlist. Custom domains, aliases, IDNs, international local parts and supported quoted mailbox names remain accepted. Leading/trailing whitespace is trimmed. The established lowercase email storage convention is preserved; international domains normalize to their ASCII representation.

The telephone selector includes the countries/territories supported by the installed library, with flag, name and calling code. Indian mobile numbers require exactly ten national digits starting with 6–9. International numbers use country-specific metadata and preserve the existing mobile-number policy. Presentation separators are stripped; letters and arbitrary characters are rejected. A full `+91` paste strips the country code once; a different country's international paste asks the visitor to select that country. National input and country selection remain separate in the UI; stored phone values retain the established E.164 contract.

No database schema, API field names, external delivery destination, form consent, job upload, permissions, or unrelated visual design was changed.

## Actual verification results

| Check | Result |
| --- | --- |
| `node --test tests/*.test.mjs` | **85 passed, 0 failed**. |
| `node tests/contact-validation-http.mjs` against the isolated localhost preview | **109 HTTP checks passed**. |
| `tsc --noEmit --pretty false --incremental false` | Passed, no diagnostics. |
| Sites production build helper | Passed, including client/server output and static asset cache generation. |
| `git diff --check` | Passed. |

The unit suite covers every requested email example; whitespace, repeated `@`, consecutive dots, invalid domain labels, reserved domains and common typos; legitimate aliases/custom/IDN addresses; domain completions; and length limits before and after IDN normalization. Phone checks include Indian lengths/prefixes, letters, leading zero, duplicated country code, full international paste, country mismatch, formatting round trips and valid/invalid samples for India, United Kingdom, United States, Canada, United Arab Emirates, Australia, Singapore and France.

The HTTP suite verifies 422 responses for invalid contacts independently of the browser for all intake kinds, plus both admin email endpoints. It confirms valid formats advance to session checks, saves a private local job draft with a normalized application email, and successfully stores all five intake kinds with normalized contacts and duplicate-safe receipts. Job submission includes a synthetic PDF. External delivery was disabled: saved records had zero delivery attempts. No test lead was sent to Google Sheets or a real recipient, and no employee invitation was created.

Browser regression was performed in the ChatGPT in-app browser:

- All twelve brand enquiry forms and List your Brand: invalid email/phone blocked, correction allowed progression.
- Contact us: both journeys, switching journeys, domain suggestions, country change, invalid input preservation, and a complete successful local enquiry with receipt.
- Both active job application pages: malformed contacts blocked; valid corrections cleared contact errors.
- Privacy request: reserved-domain error, submission blocking, keyboard completion and correction.
- Admin invite: invalid email blocked; work-domain completion and Escape behavior checked without creating access.
- Admin job editor: invalid hidden application email revealed the proper section; corrected email saved a private draft successfully.
- Email suggestions: Arrow Down/Up, Enter, Escape, Tab, and pointer selection. Selection is never automatic.
- Country dropdown: searchable names/calling codes, keyboard selection, flags, selected-country rules and international paste.
- Mobile viewport checks at **390 × 844** and **320 × 640**: popup placement within the enquiry dialog, no horizontal document overflow, dropdowns opening upward when needed, and usable step progression. Escape closes the suggestion panel without closing the enquiry modal.
- An intentionally early local submission received the existing anti-bot timing error; the form retained its values and succeeded on retry.

Updated test files: `tests/contact-validation.test.mjs`, `tests/cms-policy.test.mjs`, `tests/enquiry.test.mjs`, `tests/intake.test.mjs`. Added `tests/contact-validation-http.mjs`, which refuses hosted origins and delivery-configured local environments.

## Limits and remaining verification

- Email validation checks syntax and known invalid/typo domains. It does **not** perform DNS/MX checks, send verification mail, verify ownership, inspect private contacts, or assert that a mailbox exists. Unknown custom-domain deliverability remains unverified rather than being labelled invalid.
- Phone validation checks numbering metadata, not whether the number is allocated, reachable or owned by the visitor. Metadata follows the installed library version.
- Mobile checks used browser viewport emulation, not physical iOS/Android devices or screen-reader testing. Native autofill presentation depends on the browser and saved user data.
- Full real Google Sheets delivery and live email/phone verification were deliberately not exercised with synthetic contacts. Existing delivery configuration and contracts are unchanged.
- The development console reports an existing `p-wait` reveal-animation hydration mismatch on some public routes. The affected `components/premium-motion.tsx` code was not changed; no contact-field hydration error was observed.
- Implementation and build verification were performed locally. The owner subsequently explicitly authorized uploading the tested source to the existing Sites project, publishing it and syncing the private GitHub repository. Final deployment and repository results are reported separately at task completion.

## Complete changed-file list

`app/api/admin/route.ts`, `app/layout.tsx`, `app/contact-fields.css`, `components/admin/editor.tsx`, `components/admin/fields.tsx`, `components/admin/portal.tsx`, `components/contact-fields.tsx`, `components/intake-fields.tsx`, `components/privacy-request.tsx`, `lib/cms/policy.mjs`, `lib/cms/validation.ts`, `lib/contact-validation.mjs`, `tests/cms-policy.test.mjs`, `tests/contact-validation.test.mjs`, `tests/enquiry.test.mjs`, `tests/intake.test.mjs`, `tests/contact-validation-http.mjs`, and this report.
