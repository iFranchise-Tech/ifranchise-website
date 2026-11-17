# Blog publication dates

An approved blog becomes publicly available at 00:00 Asia/Kolkata (UTC+05:30) on its `date`. Future-dated blogs remain absent from listings, category counts, related resources, saved resources, direct public URLs and the sitemap. Staff can still preview drafts before the release date.

`published('blogs')` checks the current time on every request after merging the source defaults with approved CMS content. CMS drafts and archived records are not released by the schedule. Invalid or missing dates stay hidden. A CMS record's approved date takes precedence over its source default.

Once the implementation and content are deployed, no cron job, GitHub push or rebuild is required on the publication day. A fresh page load uses the current schedule. Since 17 November 2026, pushes to `main` trigger the production Cloudflare build and deployment described in [cloudflare-production.md](cloudflare-production.md). Future publication dates are still checked at request time; they do not require scheduled builds.

The November 2026 schedule is:

| Blog | Author | Date (India time) |
| --- | --- | --- |
| Top 9 Clothing Franchise Opportunities in India That Are Worth Your Investment | Prajjwal Negi | 11 November 2026 |
| How to Start a Clothing Franchise in India: A Step-by-Step Guide | Sneha Mahajan | 11 November 2026 |
| How Much Does A Premium Clothing Franchise Cost In India? | Sneha Mahajan | 17 November 2026 |
| How the Franchise Business Model Works: A Complete Guide | Sneha Mahajan | 19 November 2026 |
| How to Franchise Your Clothing Brand in India | Sneha Mahajan | 23 November 2026 |

Run `node --test tests/blog-publication.test.mjs` to check the dates and release boundaries without changing the system clock or publishing content.
