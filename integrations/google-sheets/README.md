# Website intake

Production uses one Google Workspace workbook, with four tabs: Franchise Enquiries, Brand Expansion, General Enquiries and Job Applications. The bound Apps Script project contains `Code.gs` and executes as the workbook owner.

The website stores a submission in D1 before acknowledging it. Its server signs the sheet delivery with RSA-SHA256; the receiver contains only the public verification key, rejects unsigned or stale requests and deduplicates by reference. Formula-like user input is escaped. Existing records are never overwritten by a repeated delivery.

`INTAKE_SIGNING_KEY` (private JWK) and `SHEETS_WEBHOOK_URL` are secret Wrangler environment variables. Do not put their values in source, build archives, browser code or documentation. The public key already in `Code.gs` stays in place. Changing the receiver requires a new Apps Script deployment version. Keep the production workbook unchanged until a labeled test against a separate spreadsheet succeeds.

The receiver URL is reachable by anyone, but no data can be read from it. Only signed submissions can append to the fixed workbook and allowed tabs. The sheet itself remains private; access to the website does not grant Google Sheet access.

The D1 insert happens before delivery. `pnpm test` runs `tests/sheets-delivery.mjs` against a local database and a local webhook, not against Google. `deliver()` posts a signed body only when both secrets are set. It marks `sheet_status` as `synced` only after the script returns `ok: true` for the same reference. Any other result increments `attempts` and leaves the row `pending`. `finishDelivery()` runs that work with `waitUntil` when a request context exists, so a webhook failure does not remove the stored submission or turn the visitor response into an error. The same request also calls `retryPending()` for up to two older pending rows. A later submission retries again. Staff who can edit enquiries or applications can sync up to five pending rows from **Submissions → Sync pending**. Privacy requests stay `not_applicable` and are not sent. A successful form confirmation means the website has stored the submission, not that a Google row has arrived. This has not been confirmed against a live workbook.

Candidate PDFs are stored under private `applications/` object keys. The sheet links to an authenticated admin page. Job-post editing does not itself grant access to applications; grant the separate **Job applications** permission. Existing staff permissions are unchanged.

Local checks: `node --test tests/intake.test.mjs` and `node tests/intake-http.mjs` against the local preview. The HTTP test creates clearly labelled local test submissions and a test PDF only. Never run it against production without a deliberate test plan and cleanup.

The Job Applications tab keeps its existing 21-column receiver contract. Column L (Application details) contains labelled qualification, course, qualification status, institution, current employment and optional cover note. Each is also stored separately in the protected application record. Column J is blank for freshers and applicants who are not currently employed; stale hidden notice values are discarded server-side.

Optional visitor messages for franchise and brand-expansion enquiries are stored as `message` in the protected website record and delivered as labelled “Visitor message” text in the existing Notes column (S for Franchise Enquiries; R for Brand Expansion). Empty messages leave Notes blank. The 19/18-column receiver contracts, workbook and existing rows are unchanged. Job applications continue to use their separate cover note.
