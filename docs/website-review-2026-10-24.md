# Website issues review — 24 October 2026

Source: the supplied 57-page “Website Issues.pdf”, issues 001–024. Changes retain the existing content, approved brand assets, light/dark palettes, admin permissions and enquiry integrations.

## Implemented changes

| Issue | Resolution |
| --- | --- |
| 001 | Centered the homepage scroll-indicator contents. Previously removed decorative hero motion remains removed. |
| 002 | Moved “View all opportunities” to a centered button below the three cards. |
| 003 | Aligned the process image and text with the shared content grid, removed the enclosing outline, and placed the About link at the right. |
| 004 | Added supporting text alongside the resource heading; centered the library CTA below the cards. |
| 005 | Unified container widths and responsive gutters; compacted the header; added desktop hover dropdowns with a pointer bridge; retained keyboard/touch controls; moved the current-theme icon before Contact us. |
| 006 | Balanced the listing heading and supporting copy; made filters sticky. Mobile search stays visible and extra filters expand on demand. |
| 007 | Made the brand summary sticky within its content parent on suitable desktop heights. It remains in normal flow on smaller screens. Centered Request details without an arrow; added a restrained, reduced-motion-aware phone ring. |
| 008 | Arranged six investment fields into three columns and two rows, with returns integrated as the final full-width row. |
| 009 | Replaced the large floating WhatsApp label with a green circular button after one brief introduction per browser session. It hides at the footer and avoids mobile reading controls. |
| 010 | Centered the List your Brand scroll indicator, with a reduced-motion-aware arrow nudge; removed the hero CTA arrow. |
| 011 | Balanced the heading/copy and retained four equal desktop cards, switching to a two-by-two mobile grid. |
| 012–013 | Made resource navigation, categories, search and topic selection one compact sticky group. Kept the compact image hero and removed the Blogs CTA arrow. |
| 014 | Added the shared two-column article masthead, approved editorial brand avatar, author role, calendar/reading icons and calculated reading duration. |
| 015 | Reduced title/description gaps in resource cards while retaining aligned card actions. |
| 016–017 | Balanced About content and centered its CTA; replaced the image with existing approved consulting photography inside the shared container. Service hover states retain their geometry and use theme-aware purple styling. |
| 018–019 | Removed the careers hero CTA arrow; made career filters sticky; added two-column desktop job cards with consistent metadata icons and a single mobile column. |
| 020 | Corrected the Reddit mark and made Instagram link copying report actual success or provide a selectable fallback link. Existing channel tracking and save/resume behavior remain. |
| 021 | Standardized “Resume” labels and messages, improved the upload control, retained PDF/5 MB restrictions and private storage. |
| 022–023 | Paired name/email and mobile/profile fields on desktop. Added Unicode-aware full-name validation and keyboard-accessible state/city suggestions. Cities load on demand for the selected state; stale requests are cancelled and cross-state values are rejected on the server. |
| 024 | Audited routes, redirects, canonical metadata, links, assets and submissions. Retained responsive WebP images, WOFF2 fonts, route splitting and cache exclusions. Kept the location dataset out of the initial client bundle. Added duplicate-send protection to candidate submissions. |

## Location data

The pinned dataset contains 28 states, 8 union territories and 4,290 city/town/locality options. Common aliases such as Bangalore resolve to Bengaluru. Six misassigned places were corrected. Source, adaptation notes and ODbL license are in `lib/data/` and downloadable under `/data/`. This is a maintained location dataset, not a guarantee that every Indian settlement is present. The picker provides a no-results message and state-specific suggestions.

## Validation completed

- Production build and TypeScript checks passed.
- 49 focused automated tests passed: contact validation, names/locations, intake, signed Sheets delivery, permissions, brochure disablement, resource sharing/reading, categories, catalogue and asset caching.
- Local HTTP integration: investor, brand and legacy enquiries accepted; duplicate submission reused its receipt; candidate PDF upload accepted; invalid email and cross-origin requests rejected. These were synthetic local records with no Sheets credentials configured.
- 161 internal links and 135 visible assets returned successfully.
- All 73 inventory routes reached HTTP 200 and canonical metadata; 30 legacy routes redirected in one hop. Three representative nonexistent routes returned HTTP 404.
- Browser inspection included desktop, tablet and 390px mobile layouts in both themes, homepage process alignment, investment grid, career cards, resource filtering, name validation, keyboard state/city selection and clearing city on state changes. Keyboard menu opening/Escape dismissal and Instagram copy feedback were exercised.
- Full lint remains blocked by pre-existing findings: 301 errors and 123 warnings. A comparison with the starting commit found no added lint errors or warnings in changed tracked files; all new code files passed lint.

## Performance observations and limits

Local built-preview HTTP checks (five requests per route, median total response time including HTML body):

| Page | Median | HTML bytes |
| --- | ---: | ---: |
| Home | 17.7 ms | 83,433 |
| Franchise listing | 8.8 ms | 64,053 |
| EMORI | 8.8 ms | 95,888 |
| Resources | 13.1 ms | 136,653 |
| Blogs | 9.1 ms | 50,164 |
| Example article | 12.6 ms | 94,737 |
| About | 5.0 ms | 53,507 |
| Careers | 4.8 ms | 46,562 |
| Contact | 4.8 ms | 46,200 |

The initial homepage sample was 135 ms / 82,617 bytes. It was a single differently warmed request, so these results do not establish an improvement percentage. Local response time is not browser rendering time or real-user production performance. No Lighthouse score is claimed. The browser connection stalled during the final viewport reset, so the last responsive CSS adjustment has build/source verification but was not re-inspected in the browser. Earlier desktop/mobile screenshots were inspected during this review; a full device/browser matrix was not tested.
