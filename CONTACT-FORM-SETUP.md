# Contact form: Zoho CPaaS email setup

The Contact Us form now posts to `/api/contact`, a Vercel serverless function that validates the enquiry, then sends two emails through the Zoho CPaaS Email API: a notification to support@reconbrief.in (Reply-To is the visitor) and a confirmation to the visitor. The website design is unchanged.

## Files in this update
Created:
- `api/contact.js` the secure endpoint (updated: key cleaning, minimal Zoho payload, detailed sanitised diagnostics) (Vercel detects the `api/` folder automatically; no change to `vercel.json`, `package.json` or `build.mjs`)
- `.env.example` placeholder names only
- `tests/contact-api.test.mjs` backend tests with a mocked Zoho (run `node tests/contact-api.test.mjs`; uses a fake key)

Modified:
- `contact.html` form now submits to `/api/contact`; adds an invisible spam-trap field, a fill-time field, and length limits on three inputs
- `script.js` sets the fill-time field when the page loads
- `styles.css` one rule that hides the spam-trap field
- `.gitignore` now ignores `.env`, `.env.*` and `.vercel/`

## Environment variables to add in Vercel
Vercel dashboard > your project > Settings > Environment Variables.

| Name | Required | Value |
|---|---|---|
| `ZOHO_CPAAS_API_KEY` | Yes | The API key of agent_1 from your Zoho CPaaS account |
| `ZOHO_CPAAS_API_URL` | No | Defaults to `https://cpaas.zoho.in/v1.1/email` (your India-region endpoint) |
| `CONTACT_FROM_EMAIL` | No | Defaults to `support@reconbrief.in` (must stay a verified sender) |
| `CONTACT_TO_EMAIL` | No | Defaults to `support@reconbrief.in` |
| `CONTACT_ALLOWED_ORIGINS` | No | Extra website origins allowed to call the endpoint, comma separated. `https://www.reconbrief.in`, `https://reconbrief.in` and the deployment's own Vercel URL are always allowed |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Recommended | Shared storage for rate limiting (see below). `KV_REST_API_URL` / `KV_REST_API_TOKEN` also work |

Add `ZOHO_CPAAS_API_KEY` for Production (and Preview if you want to test on preview deployments). Environment variables only apply to deployments created after you add them, so redeploy afterwards (Deployments > latest > Redeploy).

Rate limiting: the endpoint allows 5 submissions per 10 minutes and 20 per day per visitor IP, and 3 per hour per email address. On serverless hosting a plain in-memory counter is not shared between instances, so for real protection add shared storage: Vercel dashboard > Storage (or Marketplace) > Upstash Redis > create and connect it to this project. It fills in the two variables above automatically. Without it, the function still limits per instance and logs nothing sensitive.

## Uploading to GitHub
1. Extract the ZIP. Open the folder `recon-brief-website`.
2. Copy everything inside it into the root of your GitHub repository, replacing existing files. Make sure the new `api` folder, `tests` folder and the hidden files `.gitignore` and `.env.example` are included (turn on "show hidden files" if you do not see them).
3. Do not upload `node_modules`, `dist` or any `.env` file with real values. The ZIP does not contain any.
4. Commit and push (GitHub web: Add file > Upload files > drag the folder contents > Commit changes). Vercel deploys automatically.
5. Add the environment variable(s) above in Vercel, then redeploy once.

## Testing the deployed form
1. Open https://www.reconbrief.in/contact, fill every field with an email address you can read, tick the privacy checkbox and send.
2. You should see "Message sent." Within a minute: support@reconbrief.in receives "New Website Enquiry – Recon Brief" with all fields, the consent wording and timestamps; your test address receives "We received your enquiry – Recon Brief".
3. In the support inbox press Reply: the To address should be the visitor.
4. Untick the checkbox and send: the form must refuse and show a message.
5. Optional command line test (replace the email):
```
curl -i -X POST https://www.reconbrief.in/api/contact -H "Content-Type: application/json" -H "Origin: https://www.reconbrief.in" -d '{"name":"Test","email":"you@example.com","subject":"Test","type":"General Enquiry","message":"Testing the contact form integration.","consent":true,"consent_text":"I have read the Privacy Policy and understand how Recon Brief will collect and use my personal information to respond to my enquiry."}'
```
Expected: `HTTP/2 200` and `{"ok":true}`.

## If something fails
Vercel > your project > Logs, filter for `/api/contact`. Each request logs one JSON line with an event name and a short request id. Logs never contain the API key, visitor email addresses or message text, and anything Zoho sends back is cleaned before it is logged (emails become `[email]`, long token-like strings become `[redacted]`).

When the enquiry email fails you get a `notify_failed` line with:
- `status`: the HTTP status Zoho returned (for example 401, 400, 500)
- `zohoCode` and `zohoMessage`: Zoho's own error code and message, for example `TM_3301`
- `subErrors`: up to five entries with `code`, `target` (the field Zoho objected to, such as `from`) and `message`
- `zohoRequestId`: quote this to Zoho support
- `contentType`, `jsonBody`, `preview`: if Zoho answered with a web page instead of JSON, a short cleaned preview
- `endpointHost`, `endpointPath`, `endpointPathExpected`: which URL was called
- `keyPresent` and `keyFixesApplied`: whether a key was set and whether it had to be cleaned (`had_Zoho-enczapikey_prefix`, `quotes`, `outer_whitespace`, `inner_whitespace`)
- `senderDomain` and `ms`: the sender's domain and how long Zoho took

`notify_error` means no answer arrived at all (network or timeout); its `cause` field shows codes such as `ENOTFOUND` (wrong host) or `ETIMEDOUT`.

How to read it:
- `not_configured` / HTTP 503: `ZOHO_CPAAS_API_KEY` missing, or not redeployed since adding it.
- `status 401` or `403`: wrong or revoked key, a key from another agent, or a key from a different Zoho data centre than the host in `ZOHO_CPAAS_API_URL`.
- `status 400` with a `TM_` code: Zoho rejected the request; `subErrors[].target` names the field (for example an unverified `from` sender for this agent).
- `status 404` or `notify_error` with `ENOTFOUND`: the host or path is wrong. Compare `endpointHost` with the API host your agent shows under Agents > agent_1 > SMTP/API.
- `status 500` or another 5xx with `jsonBody: false`: Zoho (or its gateway) failed before producing a normal error. Send `zohoRequestId` or the time and `requestId` to Zoho support, and confirm the agent, sender domain and account review status are all active.
- `origin_rejected` / 403: the form is being served from an address not in the allowed list; add it to `CONTACT_ALLOWED_ORIGINS`.
- `rate_limited` / 429: too many submissions (possibly your own testing); wait 10 minutes.
- `confirm_failed`: the visitor confirmation failed but the enquiry reached support; the visitor still sees success.

Vercel environment variables for this feature: `ZOHO_CPAAS_API_KEY` (required, key only), `ZOHO_CPAAS_API_URL` (optional, default `https://cpaas.zoho.in/v1.1/email`), `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL` (optional, default `support@reconbrief.in`), `CONTACT_ALLOWED_ORIGINS` (optional), and `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (recommended, for shared rate limiting).

## What was and was not tested
Tested: server validation (missing fields, bad emails, wrong enquiry type, missing consent, oversize body, malformed JSON), honeypot and too-fast submissions, HTML escaping and header-injection stripping, CORS and origin checks, rate limiting (in-memory and the shared-storage path), exact Zoho request format against Zoho's documentation, success, failure and confirmation-failure paths, missing key, log contents, a real HTTP request through a streamed body, the browser form on desktop and mobile posting to the real function, and a scan showing no key or Zoho reference in the built website files. All Zoho calls were mocked.
Not tested: real delivery through Zoho, whether the `.in` host and agent_1 key work together, spam-filter placement of the emails, behaviour on Vercel itself. Do the live test above after deploying.

## Notes
- The consent record is carried inside the enquiry email (wording, the visitor's browser time, the server time). There is no database, so the email is the only record.
- No CAPTCHA was added; the honeypot, fill-time check and rate limits are the spam protection. Add Cloudflare Turnstile later if abuse appears.
- The Privacy Policy text itself was not changed (see HANDOFF.md for the legal review items).
