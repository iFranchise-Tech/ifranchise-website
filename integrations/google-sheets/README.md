# Website intake

Production uses one Google Workspace workbook, with four tabs: Franchise Enquiries, Brand Expansion, General Enquiries and Job Applications. The bound Apps Script project contains `Code.gs` and executes as the workbook owner.

The website stores a submission in D1 before acknowledging it. Its server signs the sheet delivery with RSA-SHA256; the receiver contains only the public verification key, rejects unsigned or stale requests and deduplicates by reference. Formula-like user input is escaped. Existing records are never overwritten by a repeated delivery.

`INTAKE_SIGNING_KEY` (private JWK) and `SHEETS_WEBHOOK_URL` are secret Sites environment variables. Do not put their values in source, build archives, browser code or documentation. Changing the receiver requires a new Apps Script deployment version. Keep the same deployment URL and workbook.

The receiver URL is reachable by anyone, but no data can be read from it. Only signed submissions can append to the fixed workbook and allowed tabs. The sheet itself remains private; access to the website does not grant Google Sheet access.

Delivery runs in the request's background execution context. Pending records are retried on subsequent submissions. Super Admins and staff with the relevant enquiry/application edit permission can also use **Submissions → Sync pending**. A Google outage leaves the website record available for retry; a successful form confirmation means the website has stored the submission, not that a Google row has necessarily arrived yet.

Candidate PDFs are stored under private `applications/` object keys. The sheet links to an authenticated admin page. Job-post editing does not itself grant access to applications; grant the separate **Job applications** permission. Existing staff permissions are unchanged.

Local checks: `node --test tests/intake.test.mjs` and `node tests/intake-http.mjs` against the local preview. The HTTP test creates clearly labelled local test submissions and a test PDF only. Never run it against production without a deliberate test plan and cleanup.

The Job Applications tab keeps its existing 21-column receiver contract. Column L (Application details) contains labelled qualification, course, qualification status, institution, current employment and optional cover note. Each is also stored separately in the protected application record. Column J is blank for freshers and applicants who are not currently employed; stale hidden notice values are discarded server-side.

Optional visitor messages for franchise and brand-expansion enquiries are stored as `message` in the protected website record and delivered as labelled “Visitor message” text in the existing Notes column (S for Franchise Enquiries; R for Brand Expansion). Empty messages leave Notes blank. The 19/18-column receiver contracts, workbook and existing rows are unchanged. Job applications continue to use their separate cover note.
