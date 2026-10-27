# Mobile refinements — 28 October 2026

## Changes

- Homepage hero uses the dynamic viewport height, with safe-area-aware content spacing. Heading is larger on phones, with a maximum of four lines at the smallest checked width. The two actions remain alongside each other.
- List your Brand, About us and Careers share a 540–680px mobile banner height, scaled to the small viewport. Resources retain their existing compact banner. Desktop photography and typography are unchanged.
- List your Brand uses a business-planning stock photograph. About us uses a new portrait crop of colleagues collaborating. Credits are in `image-credits.md`.
- The mobile brand enquiry rail contains Enquire and a collapse arrow only. Pointer dragging starts from either button. A movement threshold separates dragging from tapping, so dragging does not open the form. Keyboard positioning is retained.
- The page opts into the iPhone safe area, pads navigation controls away from it, and supplies a dark browser tint over photographic heroes and a light tint elsewhere. Safari remains responsible for its native chrome, blur and status icons.

## Verification

Checks performed in the ChatGPT in-app browser against the local development site:

| Check | Actual result |
| --- | --- |
| Home at 320 × 740 | Hero 740px; heading four lines; no horizontal overflow; actions side by side |
| Home at 390 × 844 | Hero 844px; heading two lines; no horizontal overflow; actions side by side |
| Home at 440 × 956 | Hero 956px; heading two lines; no horizontal overflow |
| Brand / About / Careers phone banners | Each 680px at checked 390–440px-wide tall viewports; relevant images and readable overlay text |
| Home at 1440 × 900 | Hero 900px; existing 68.4px desktop heading; no horizontal overflow |
| Brand page at 1440px | Sticky form and its two existing desktop contact links remain; mobile rail absent |
| Brand page at 390px | Rail has exactly two buttons and zero links |
| Drag from Enquire | Rail moved from top 342px to 159px without opening form |
| Tap after dragging | Enquiry dialog opened; WhatsApp and email absent from mobile dialog |
| Collapse, keyboard ArrowDown, expand | Collapsed control is 48px high; keyboard repositioning and reopening work |
| Mobile navigation | Opens below 72px header without width overflow; browser tint changes to light for open menu |
| TypeScript | `tsc --noEmit --incremental false` passed |
| Production build | All five build stages and static asset cache generation passed |

## Limits

- Phone dimensions are responsive browser checks, not physical iOS or Android testing. Real iPhone Safari status-bar blending, notch insets and browser-toolbar expansion still require device verification.
- No lead submissions were created: submission logic and integrations were not changed.
- Safari safe-area approach follows [WebKit guidance](https://webkit.org/blog/7929/designing-websites-for-iphone-x/). Websites cannot dictate the exact appearance of Safari's own controls.

## Follow-up: fresh images and vertically centred inner-page text

- Replaced the initial List your Brand and About us mobile selections with two previously unused real Pexels photographs (12902905 and 12899116), optimised to 1200 × 1800 WebP (184,024 and 142,270 bytes respectively).
- Centred the text block vertically within mobile photographic banners using symmetrical spacing. Homepage placement remains unchanged.
- At 390 × 844, List your Brand, About us and Careers remain 680px tall; Resources, Blogs, Articles and Videos remain 390px tall. All seven text-block centres match their banner centre (0px measured difference), all images loaded, no horizontal overflow.
- At 320 × 740, List your Brand and About us are 606.8px tall; Articles is 390px. Copy remains centred with no overflow. Homepage still fills 740px and its heading remains four lines.
