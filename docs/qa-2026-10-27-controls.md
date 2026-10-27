# Contact controls and responsive UI verification — 27 October 2026

## Root cause and correction

The phone control mixed shared and page-specific minimum heights, allowing the country button divider to extend below the input. The shared component now owns the control height, flex sizing, contained divider, centered chevron and ISO country label (IN +91 instead of a flag). The compound field uses one focus indicator.

The stale phone error was retained separately from the current number after input sanitisation rejected extra digits. Invalid digits are now kept visible; the error is derived from the current value and country. Both public form handlers refresh phone validity from the live field before submission. Indian national numbers require exactly ten digits and a valid mobile prefix; existing international normalization is preserved. Browser-native phone error bubbles are suppressed in favor of inline messages. No dependency or API-contract change was required.

## Affected forms and files

- Contact Us, List Your Brand, general franchise enquiries, and every brand sidebar/modal: `components/enquiry.tsx`, shared `components/contact-fields.tsx` and `app/contact-fields.css`.
- Careers applications: `components/job-application.tsx` and the same shared fields.
- Admin public contact settings: existing `components/admin/content-settings.tsx` consumes the corrected shared control; no separate phone implementation remains.
- Shared client/server rules: `lib/contact-validation.mjs`.
- Regression suites: `tests/contact-validation.test.mjs`, `tests/website-issues.test.mjs`, `tests/contact-validation-http.mjs`.
- The HTTP fixture now uses the existing localhost preview authentication cookie. Production authentication is unchanged.

## Actual results

- Node tests: 108 passed, 0 failed.
- HTTP/API checks against local preview: 109 passed, 0 failed. Invalid phone and email requests are rejected; valid session-backed requests normalize correctly and duplicate submissions do not create a second record.
- TypeScript: passed.
- Production build: passed, including the final phone focus-ring CSS adjustment.
- Contact Us: entered 11 Indian digits, submission blocked; deleted the extra digit; completed remaining fields; received an enquiry receipt with the corrected number.
- List Your Brand: same invalid-to-valid correction flow completed and displayed Enquiry received.
- Careers: pasted +91 with an overlength national number, submission blocked; corrected it to ten digits; successful application receipt, with other fields and resume preserved.
- Brand modal: changed country to GB +44 using search/keyboard selection; a valid UK mobile number completed the enquiry and reached the brand-specific thank-you page.
- Unit coverage includes short/long Indian numbers, invalid mobile prefixes, letters, explicit +91 paste, repeated corrections, country changes and multiple international formats.
- Checked shared phone geometry at desktop and 320/390 px widths: selector and input remain within their outer border; country letters, dial code and chevron share a vertical center. Admin phone field also passed at desktop/mobile widths.
- Checked native select arrows in enquiry preferences, careers, opportunity filters and resource filters: positioned inside fields with reserved text padding. No horizontal document overflow observed in the checked pages.
- Contact journey buttons retain stable dimensions and no transform/transition when switching journeys.
- Brand gallery advances immediately. Active FAQ tab becomes visible automatically on the 390 px tab bar; desktop section tracking also verified.

## Scrollbar idle follow-up

The persistent scrollbar was reproduced: pointer dragging called `focus()` on the scrollbar, leaving `:focus-visible` true after the 1.1-second scroll activity timer expired. `components/scrollbar-activity.tsx` now clears pointer-induced focus rather than assigning it. Keyboard tab focus remains available and deliberately visible for accessibility.

- Before the fix: after dragging away from the right edge and waiting, scroll activity ended but the scrollbar retained focus and opacity 1.
- After the fix: repeated drag/release cycles clear focus, finish the activity timer and reach opacity 0 while idle.
- Hovering the right edge reveals the control and expands its thumb from 4px to 9px; dragging still moves the page.
- Tab navigation still focuses the scrollbar; Page Down and Home move the page correctly.
- Scrollbar geometry tests: 2 passed, 0 failed. TypeScript and whitespace checks passed after the follow-up.

## Other requested visual changes in this revision

Full-image responsive heroes with mobile image sources, solid legible wordmark over imagery, scroll-only logo resizing, mobile resource-row alignment, compact enquiry handle, mobile/desktop role detail consistency, footer organization capitalization and a neutral scrollbar keyboard outline. The no-open-roles career view is available only as a local preview query; job records have not been removed.

## Verification limits

Tests used synthetic local data. Google Sheets delivery was intentionally not triggered; existing integration code and receipt paths are unchanged. Physical iOS/Android and Windows browsers were not available; responsive checks used the ChatGPT in-app browser. The existing non-blocking reveal-animation hydration warning appeared in development; it is separate from phone validation and this revision does not claim to resolve it.
