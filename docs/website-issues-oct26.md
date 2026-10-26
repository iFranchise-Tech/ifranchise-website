# Website issues review — 26 October 2026

Scope: the 15 items in **Website Issues (1).pdf**. The existing Site and private GitHub repository are reused. No access policy, administrator role, delivery credential, database schema or brand financial value was changed.

## Results by issue

| Issue | Result |
|---|---|
| 001 — Home hero | Removed the bottom “How we can help” control. The actual support/process sections remain. Both main CTAs fit on one row at 320, 375, 390 and 430 px; the heading remains two lines at those widths. |
| 002 — Public login | **Intentionally unchanged.** The user chose “Keep the current restricted access.” Hosting remains restricted and admin permissions remain protected. |
| 003 — Home process | Replaced the process photograph with an existing stock image of professionals reviewing plans and documents. The About iFranchise link aligns with the left edge of its text column. |
| 004 — FAQs | All FAQ editors enforce five questions per section, 100 characters per question and 400 per answer, including the general, brand, article and blog editors. The server rejects over-limit and duplicate questions. Existing add/edit/delete/reorder controls and concurrent-edit safeguards remain. Unchanged legacy data is retained rather than silently deleted. |
| 005 — Typography | Applied a shared public-page hierarchy for hero, page, section, card and detail headings. Admin typography remains separate. |
| 006 — Catalogue | Removed selected-filter pills and their Clear all row. Choices and suggestions derive from published brand records. Search suggestions support keyboard arrows, Enter, Escape and pointer selection. Combined filters, counts, sorting, URL restoration and the existing empty-state reset were verified. Unknown investment values are not treated as zero. |
| 007 — Footer | Company name reads “iFRANCHISE SERVICES PRIVATE LIMITED,” bold at the Registered office heading’s size. Copyright includes “All rights reserved.” Links and address remain intact. |
| 008 — List your Brand | Removed the extra Franchise development control. Reused a relevant stock image of a retail business discussion. Narrow screens show the complete photograph beneath readable text and the main CTA. |
| 009 — Resource heroes | Resources, Blogs, Articles and Videos use distinct existing stock photographs with a consistent editorial layout. Hero CTAs were removed. |
| 010 — Resource listing | Removed Fresh perspectives and the separate Newly added section. The normal grid starts with the latest published records using the existing date field; cards are no longer split across two grids. |
| 011 — About | Replaced the hero with an existing consultation photograph and adjusted responsive composition. |
| 012 — Careers | Replaced the hero with an existing workplace collaboration photograph. The mobile layout displays the full scene below the copy. Jobs and application fields were not changed. |
| 013 — Job details | On desktop, four summary facts now appear inside Role Details. Reports to, Openings, Joining and Interview process are hidden there. The existing mobile arrangement is retained at the established 750 px breakpoint. |
| 014 — Enquiry | Country-aware length checks reject extra digits without silently truncating. Valid international paste is normalized without duplicating the dial code. A confirmed successful brand enquiry redirects to its brand-specific thank-you page. Failures preserve values and remain on the form. Malformed responses, HTTP errors and unconfirmed receipts cannot trigger success. Requests have a 30-second timeout. |
| 015 — Investment | Minimum guarantee appears below Agreement term and revenue share below Lock-in period. Odette’s original amounts and wording are retained. The outlet pill uses actual brand data. Structured fixed/share/guarantee/higher-of arrangements and complex legacy terms remain supported. |

## Data and shared behavior

- Catalogue sectors use brand `category`; operating models use the existing `brandModels` utility; investment bands use the established numeric investment value in lakh. Search suggestions contain actual brand names and sectors only.
- Resource ordering uses the existing published-resource records and their `date` values. No dates, cards, investment figures or outlet totals were invented.
- `lib/contact-validation.mjs` remains the shared validation layer used by public and admin forms and the API. Maximum input length uses the installed libphonenumber metadata, including legitimate non-Indian domestic trunk prefixes.
- `lib/intake/receipt.mjs` centralizes successful receipt verification for the existing intake forms. HTTP success alone is insufficient: `received: true` and a non-empty reference are required.
- `lib/return-details.mjs` formats the existing structured return model. It splits legacy text only when the existing sentence is unambiguous; tiered or complex terms are preserved.
- Existing licensed stock assets were reused. No AI image, external image service, new dependency or additional lead spreadsheet was introduced.

## Actual verification

| Check | Result |
|---|---|
| Node unit suite, `node --test tests/*.test.mjs` | **100 passed; 0 failed.** Includes email/phone validation, catalogue data/filtering, FAQ limits, return arrangements and malformed/successful receipts. |
| Contact-validation HTTP suite | **109 checks passed.** All five intake kinds, normalized numbers, duplicate-safe requests and both admin email endpoints. Synthetic local data only; no external delivery. |
| CMS workspace HTTP suite | **12 feature groups passed.** Admin editing, permission isolation, stale updates, previews, commercial terms, media, ordering, FAQ controls, contact settings and legal-page editing. Local changes restored or archived. |
| Website-issues HTTP suite | **67 checks passed**, including the final production build. Eight FAQ locations, valid five-question previews, rejected sixth/long/duplicate entries, unchanged record versions, updated routes/assets and safe confirmation routes. |
| TypeScript | `tsc --noEmit` passed. |
| Production build | Sites build helper passed. |
| Diff hygiene | `git diff --check` passed. |
| Responsive browser review | ChatGPT in-app browser. Home checked at 320, 375, 390, 430, 768 and 1440 px; catalogue, careers, job detail, list-brand, resources, investment and confirmation views checked at representative desktop/mobile widths. No horizontal page overflow in the measured views. |
| Catalogue interaction | Combined fashion + FICO filter returned four brands in name order; refresh retained the filters; an empty search showed the reset; keyboard completion selected Odette; Escape dismissed suggestions; pointer selection selected Food & beverage. |
| Enquiry interaction | An extra Indian digit was rejected; a pasted +91 number was normalized; a deliberately stopped local service produced an error with values retained; restarting and retrying redirected to the Odette confirmation page. Reloading the confirmation did not resubmit. |

## Files changed

**Public layout and pages:**

- `app/layout.tsx`
- `app/website-issues.css` (new)
- `components/home-video-hero.tsx`
- `components/home-page.tsx`
- `components/about-page.tsx`
- `components/solutions-page.tsx`
- `components/careers-page.tsx`
- `components/job-detail.tsx`
- `components/photo-hero.tsx`
- `components/resources-page.tsx`
- `components/resource-library.tsx`
- `components/shell.tsx`
- `components/franchise-detail.tsx`

**Catalogue, enquiry and shared utilities:**

- `components/catalogue.tsx`
- `components/catalogue-search.tsx` (new)
- `lib/catalogue.mjs`
- `lib/return-details.mjs` (new)
- `lib/contact-validation.mjs`
- `components/enquiry.tsx`
- `components/intake-fields.tsx`
- `lib/intake/receipt.mjs` (new)
- `components/enquiry-confirmation.tsx` (new)
- `app/franchise/[slug]/thank-you/page.tsx` (new)

**Admin content controls:**

- `components/admin/content-settings.tsx`
- `components/admin/editor.tsx`
- `components/admin/fields.tsx`
- `lib/cms/defaults.ts`
- `lib/cms/display.mjs`

**Regression coverage:**

- `tests/contact-validation.test.mjs`
- `tests/cms-workspace-http.mjs`
- `tests/website-issues.test.mjs` (new)
- `tests/website-issues-http.mjs` (new)

## Limits of verification

- No live enquiry was submitted to Google Sheets or email during this review. Delivery code and credentials remain unchanged; local acceptance, validation and duplicate handling were tested. External delivery is not newly certified by these checks.
- Browser testing used the ChatGPT in-app browser and responsive viewport sizes, not physical iOS/Android devices or a full cross-browser matrix.
- The thank-you page uses a short-lived, brand-specific session marker without personal data. A direct visit, an expired marker or unavailable session storage shows a neutral enquiry prompt rather than claiming an unverified submission succeeded.
- Legacy FAQ content is not silently removed. Editing an over-limit legacy FAQ section requires bringing it within the stated limits; unrelated edits remain possible.
- Complex legacy returns are retained as readable Return terms until an administrator elects to enter their structured values. No financial terms were inferred.
