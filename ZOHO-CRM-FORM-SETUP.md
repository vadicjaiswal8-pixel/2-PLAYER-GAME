# Zoho CRM enquiry form: what changed and how to test it

## What changed (3 files)
| File | Change | Why |
|---|---|---|
| `contact.html` | The old enquiry form is replaced by the Zoho CRM Web-to-Lead form "Recon Brief Website Enquiry", styled with the site's own fields, spacing, colours and button. One sentence above the form was updated, because it mentioned an "enquiry type" that no longer exists. | This is the integration. |
| `contact-thanks.html` (new) | A small noindex page: "Thank you. Your enquiry has been received." | Lets the site know when Zoho has accepted an enquiry (see below). Not in the sitemap. |
| `ZOHO-CRM-FORM-SETUP.md` (new) | This guide. | |

Everything else (header, footer, hero, animations, other pages, app links, SEO tags, `api/`, `package.json`, `build.mjs`, `vercel.json`) is untouched. The project is a static multi-page site built by `build.mjs`; the React files in `src/` are not part of the build, so the form is plain HTML plus a small script, which lets Zoho's own scripts run exactly as generated.

## Field mapping (unchanged Zoho names)
| Website label | Zoho field name posted | Required |
|---|---|---|
| Full Name (one field) | `Last Name` | Yes |
| Email | `Email` | Yes |
| Company / Institution | `Company` | Yes |
| Phone | `Phone` | No |
| Message | `Description` | No |
| Privacy consent | checkbox (Zoho does not post it; it only gates the submit) | Yes |

Preserved from Zoho's source: form action `https://crm.zoho.in/crm/WebToLeadForm`, method POST, form name/id, hidden `xnQsjsdp`, `xmIwtLD`, `actionType`, `zc_gad`, `returnURL`, the honeypot `aG9uZXlwb3Q`, the validation functions (`checkMandatory…`, `validateEmail…`, `privacyAlert…`, `disableErr…`), `_wfa_fstprtcken`, the `wf_anal` analytics script and every "Do not remove" comment.

Small, deliberate edits to Zoho's script: errors show inside the form instead of pop-up `alert()` boxes; the checks run in on-screen order; the function now returns `true` when valid; one line that wrote the visitor's name into `window.name` was removed; the Reset button was left out; a space inside an email is rejected too.

## How it works, in plain words
1. The visitor fills the form. Zoho's own checks run first (required fields, email, privacy box).
2. On submit, the form posts straight to Zoho CRM, into a hidden frame, so the visitor stays on your page. The button locks so it cannot be sent twice.
3. The form tells Zoho to send the browser to `/contact-thanks` afterwards (`returnURL`). Only when the hidden frame really arrives at that page does the site show "Your enquiry has been received".
4. If the response cannot be read (for example Zoho shows its own page or the connection drops), the site says it could not confirm receipt, keeps the visitor's text, and offers an email link. It never claims success without confirmation.

## Test locally
`node build.mjs`, then serve the `dist` folder with a server that honours `vercel.json` clean URLs (for example `npx vercel dev`). A plain file server will not resolve `/contact-thanks`. Local testing can check the fields and validation; it must not be used to send test leads to your live CRM.

What was tested here (Zoho mocked, nothing sent to your CRM): markup and hidden fields match the source; every mapped field arrives under the right name; Full Name goes to `Last Name` as one value; validation and email checks; privacy box required and starting unticked; one POST only, even on double-click; success shown only after the redirect; no success message for an unreadable response or a network failure; mobile, tablet, desktop, light and dark layouts; no horizontal overflow; no script errors; other pages unchanged; the build passes.

## Deploy (GitHub to Vercel)
1. Extract the ZIP. Copy everything inside `recon-brief-website-main` into the root of your GitHub repository, replacing files. Only `contact.html` changes, plus the two new files.
2. Commit and push. Vercel deploys automatically. Open the Vercel preview first if you can.

## Manual live test (you decide when; it creates one real lead)
1. Open the deployed `/contact` and submit one test enquiry with an address you control.
2. Expected: the form shows "Thank you. Your enquiry has been received." Then check Zoho CRM, Leads: Last Name is the full name, plus Email, Company, Phone and Description.
3. If the page instead says "We could not confirm that your enquiry arrived" but the lead is in the CRM, the integration works and only the confirmation is not coming back. Zoho is then not redirecting to `returnURL`; in Zoho, set the form's thank-you page to `https://www.reconbrief.in/contact-thanks`. No code change is needed.
4. If the lead is missing, check the form's name/tokens in Zoho and that the form is active.

## Open points
- **Not tested against live Zoho.** That Zoho honours the `returnURL` this site sends is unverified; step 3 above is the fallback.
- The privacy text, including "Your information will not be sold to third parties", is exactly Zoho's wording from your form; confirm it is accurate.
- Zoho does not record the privacy tick (the checkbox has no name in its source), so it only gates the submit.
- The earlier `api/contact.js` (Zoho CPaaS email) is still in the project but no longer used by this form. It can stay or be deleted later.
