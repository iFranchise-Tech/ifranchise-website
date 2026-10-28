# Touch forms and navigation follow-up — 28 October 2026

## Changes

- Shared state fields use a controlled native select, commit the chosen state, clear obsolete validation and release input focus.
- City suggestions remain optional for manual city entry. The popup uses the visual viewport to fit above the keyboard, with touch scrolling, tap selection and keyboard navigation. Selection closes the list and releases input focus.
- The mobile homepage uses the large viewport height so the hero covers the viewport as browser controls retract.
- The confirmation screen has a single return action. Successful submission stores only the originating pathname, fragment and scroll position for 30 minutes; no form answers or query parameters are retained for this navigation.
- Internal page links use client navigation, with image warm-up and a pending indicator. Reveal animation no longer starts sections invisible.
- List Your Brand targets the enquiry card heading. Careers targets the Open positions heading, with measured navbar clearance.
- About uses a new stock photograph on mobile; source and credit are in image-credits.md.
- Franco outlet count is 5+.
- Privacy wording describes sharing, safeguards and retention without naming storage products or transport channels. The notice version is updated.

## Verification actually performed

- Unit suite: 136 passed, 0 failed.
- New touch/navigation unit cases: 6 passed, 0 failed in the final focused run. Covers keyboard-reduced viewport placement, narrow screens, anchor offset, internal-link classification, safe return paths, expiry and exclusion of query parameters.
- HTTP regression: 109 checks passed against the local API. Covers invalid values, normalization, successful storage and duplicate protection for investor, brand, general, privacy and job requests, plus admin email validation.
- TypeScript check and final production build passed.
- In-app Chromium, 390 × 844: invalid state -> Karnataka selected -> Bengaluru chosen -> consent -> successful local enquiry -> redesigned confirmation -> return to the originating Contact Us page and scroll position.
- In-app Chromium, 820 × 1180, production build: invalid state -> corrected state and city -> no invalid location fields, popup closed and input focus released -> successful local enquiry and confirmation.
- City suggestions were exercised with Arrow Down/Enter and pointer selection.
- List Your Brand button placed the enquiry heading below the mobile navbar (card top about 88 px, navbar bottom 72 px).
- Careers button placed Open positions 16 px below the navbar on tablet and desktop. A temporary local-only role was archived after this check; production job availability was not changed.
- Mobile homepage measured 844 px high in an 844 px viewport with no horizontal overflow; heading stayed within four lines and the two actions stayed adjacent.
- Home-to-About navigation retained visible content while loading, and the destination mobile stock image completed loading.
- Franco rendered 5+ on the production preview; no console errors were observed in that check.

## Limits

- Responsive Chromium previews do not reproduce the physical iPhone/iPad Safari software keyboard or browser chrome. Those device-specific behaviours still require physical-device testing.
- The local test environment does not have live Google Sheets delivery credentials. Local acceptance, normalization, deduplication and confirmation were tested; external delivery was not exercised. No synthetic lead was sent to production.
- No claim is made that all operating systems, browser versions or network speeds were tested. Restricted hosting access is preserved.
