iFranchise — modern website, full content migration and paused CRM integration
Updated 18 October 2026

Private website: https://ifranchise-studio-2026.babbysyed.chatgpt.site
Existing public domain is unchanged. Preview keeps robots noindex/disallow.

CONTENT
All 12 existing franchise listings, original galleries, and 11 available brand
brochures. Seven blog posts, sixteen knowledge articles, model and investment
guides, ten city pages, About, founder profiles, services, FAQs and active careers.
78 page routes and 13 old aliases verified. Original path shapes are retained.

Source data and audit: content/*.json. Original public-site asset paths are
retained beneath public/. Public detail pages identify commercial figures as
source proposals requiring confirmation, not independently verified performance.
Lassi N Cafe has conflicting investment figures; its budget filter is withheld.
Auto-generated upper limits, placeholder staff and unsupported reviews omitted.
The readiness self-check retains questions without treating risk appetite as an
investment recommendation. Answers remain in the current page only.

CRM
Real gateway adapter in lib/journey-client.mjs for investor and brand journeys.
Both local intake and conversion switches are Off. Paused status is read-only.
See integration/crm-contract.txt and the migration report for review/activation.
Existing metadata, structured data, semantic server HTML and consent controls
remain. Advertising tags and conversion sending have not been activated.

VERIFICATION
node --test tests/enquiry.test.mjs
node tests/migration-smoke.mjs (local preview at http://127.0.0.1:3018)
TypeScript and Sites build; desktop and mobile browser checks.

Use the Sites workflow for future source synchronization and publication.

OCTOBER 2026 UI REVAMP
Solid purple/lime visual system; grouped desktop and mobile navigation; persistent
contact CTA; user-confirmed Facebook, Instagram, LinkedIn, X and WhatsApp links.
Full company address is shown on Contact and in the footer. Brand profiles have
photo heroes, an investment summary, anchor navigation, galleries with a modal,
a desktop enquiry sidebar and a mobile enquiry bar. Catalogue filters include
sector, starting investment and model, with sorting/reset. Articles have search
and topic filters. Motion supports reduced-motion preferences and does not loop.
No account, CRM record, receiving switch or conversion setting is changed by UI.
Additional verification: node --test tests/catalogue.test.mjs
