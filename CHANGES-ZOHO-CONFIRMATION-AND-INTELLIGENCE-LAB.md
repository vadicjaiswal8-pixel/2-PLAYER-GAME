# Zoho confirmation fix and Intelligence Lab

## Also included (re-applied in this package)
The project you uploaded for this task did not contain the earlier motion work, so it is re-applied here: the circular-reveal theme transition (with colour-fade fallback and instant switch for reduced motion), the 3D background field in the header of every page, the brand grid lit by the cursor on every page, smooth scrolling (Lenis), product-window depth tilt, word-by-word heading reveal and magnetic buttons. Content width stays at the original proportions. Files: `script.js`, `styles.css`, `public/lenis.min.js`, and the page HTML files (grid layers and Lenis tag only).

## Changed files
- `contact.html`: confirmation script rewritten (Task 1). Zoho fields, tokens, endpoint, form id, honeypot, validation and analytics are untouched.
- `contact-thanks.html`: now also writes a same-origin storage signal.
- `intelligence-lab/` (new, not deployed by the website build): `intelligence-lab.js`, `intelligence-lab.css`, `lab-preview.html`, `README.md`, `tests/lab.test.py`.
- `tests/zoho-form.test.py` (new): form tests with Zoho mocked.
Nothing else changed. No test enquiry was sent to the live CRM.

## Task 1: why the confirmation was missed
Zoho received the lead, but the browser never lets a page read Zoho's reply (cross-origin). The only possible proof is Zoho sending the hidden frame on to our own page, `/contact-thanks`. The old script decided at the FIRST page the frame loaded. If that first page was a Zoho page (an intermediate or Zoho's own thank-you page), it declared "could not confirm" at once and ignored anything that arrived later, even a redirect to our page.
Fix: the script no longer decides at the first load. It watches four signals: the frame landing on `/contact-thanks`, a message from that page, a storage signal from that page, and a later redirect. It waits 8 seconds after Zoho's page loads, and a late confirmation upgrades "could not confirm" to success. The `returnURL` is kept if it is already our thank-you URL (so a Zoho-side setting works), otherwise set to it. Duplicate sends are blocked while sending and until the visitor edits the form. "Received" is shown only on a real signal.
Limitation: if Zoho never sends the browser to `/contact-thanks`, no browser code can confirm. The visitor then sees the honest "could not confirm" message with an email link. To fix that case at the source, in Zoho (Web Forms, your form, thank-you page) set the redirect to `https://www.reconbrief.in/contact-thanks`. Add `?zfdebug=1` to `/contact` and open the browser console to see which signals fire during your next real test. I could not verify this against live Zoho, and I did not send a test enquiry.

## Task 2: Intelligence Lab
This repository contains no app or backend code (the app lives elsewhere), so the Lab is a self-contained module with an adapter, ready to copy into the app. See `intelligence-lab/README.md`.
- Stages are real: Request Received (screen holds the request), Connecting (a health attempt is running), Engine Online (a health attempt succeeded), Workspace Ready (your `workspaceReady` callback resolved). No timers decide progress.
- One health attempt at a time, 8 s timeout each, exponential backoff with full jitter (1 s base, 8 s cap), stops after 120 s with a Try again button. If the backend is already awake it finishes after one check. The request is preserved (also in sessionStorage across a reload). `onReady` fires once, so report generation cannot be triggered twice.
- Cards: Research Insight (19 insights over 9 topics, rotating, with Prev/Next) and Think Like an Analyst (3 questions for each of 5 workspaces, always optional, with an analyst perspective after answering). No AI calls.
- Background: canvas globe, orbital rings, data links with moving pulses, particles and light trails (blue with a little purple), pointer parallax, brighter as stages complete. Pauses off-screen and in hidden tabs; static for reduced motion.
- The composition follows your written spec. No reference image arrived with the message; send it and I will match it.
- You must provide a cheap unauthenticated `GET /health` on the Render service (200 when it can accept research requests, CORS for the app origin). Do not ping it on a timer to defeat sleep.
