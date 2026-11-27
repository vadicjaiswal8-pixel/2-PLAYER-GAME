

## October 2026 Samples experience

- [x] Add a Samples link to the existing desktop and mobile website header and the existing footer, with both pointing to `/samples` and without changing unrelated navigation behavior.
- [x] Create `/samples` with five distinct categories: Company Research, Market Research, Competitive Intelligence, Academic Research, and Custom Research. Company Research must be Available and clickable; the other four must be clearly marked Coming Soon, must not open the Company Research report, and must not use fake report pages or misleading controls.
- [x] Create the public report route `/samples/company-research/the-whole-truth-foods` and make it directly accessible, shareable, and linked from the Company Research card.
- [x] Render the complete attached Whole Truth Foods report in its original order and content, including the opening summary, all required headings, paragraphs, lists, evidence references, interpretations, research gaps, Evidence Check findings, and all E1–E12 Evidence Registry entries.
- [x] Render Company Snapshot, Financial & Operating Performance, and Evidence Registry as semantic HTML tables with every original column, row, value, period, definition, source ID, and classification preserved. Tables must remain selectable text and use controlled horizontal scrolling on mobile.
- [x] Add report metadata identifying Company Research, The Whole Truth Foods, Company Research Report, Standard Analysis, and 12 sources without inventing an author, publication date, verification badge, or source URL.
- [x] Preserve the existing Recon Brief design system, public static architecture, authentication/application boundaries, unrelated routes, research engine, and existing functionality. Do not add dependencies or backend/database changes.
- [x] Validate navigation, direct routes, canonical metadata, sitemap inclusion, table integrity, absence of raw Markdown table syntax, complete section order, E1–E12 presence, responsive desktop/mobile rendering, and the existing build.

## October 2026 Samples report 404 fix

- [x] Trace the Samples link, route manifest, report source, Vite HTML input discovery, generated output, sitemap, and Vercel configuration; confirm the live deployment served Samples but omitted the report artifact and sitemap URL.
- [x] Move the complete report into a guaranteed root-level static build artifact and add exact Vercel rewrites for the clean report URL and trailing-slash variant; do not add a broad SPA rewrite.
- [x] Rebuild and verify the report artifact, 3 semantic tables, 13 report sections, Evidence Registry, canonical sitemap URL, and exact rewrite targets.
- [ ] Redeploy through the user’s Vercel account and verify the live URL; this remains open because this workspace has no Vercel authentication.

## October 2026 inline Samples fallback

- [x] Keep the existing separate report artifact and route configuration, but make both Company Research controls open the complete report inline on `/samples` so the visitor does not depend on the broken production route.
- [x] Reuse the canonical report HTML artifact through same-origin fetch; remove only its outer header, footer, noise layer, and script before injecting the report body, avoiding a second report copy.
- [x] Add collapse/reopen behavior, accessible button state, loading/error status, focus return, restrained expansion styling, and responsive containment.
- [x] Verify with Chromium at 1280px and 390px: URL remains `/samples`, open/collapse/reopen works, 3 tables and 13 sections remain present, no horizontal overflow occurs, and no console exceptions are emitted.
- [ ] Verify the change on the live production domain after deployment; this remains blocked by missing Vercel authentication in the current session.

## October 2026 report presentation correction

- [x] Confirm the deployed defect with browser measurements: the live inline viewer was nested inside `.samples-grid`, producing a 553px report layout and 242px main document column at desktop; the corrected sibling layout measures 1217px and 911px locally.
- [x] Remove the duplicate inline viewer title so the report cover is the only report title and retains the category label, metadata, source count, overview, and decorative panel.
- [x] Give the report viewer the full section-shell width, use a compact 210px desktop TOC sidebar with a dominant main column, and remove nested section-shell width compounding.
- [x] Scope the Evidence Registry minimum width to its table instead of its section, preserving intentional mobile table scrolling without widening the page.
- [x] Add a native mobile “In this report” disclosure while preserving the desktop sidebar and section links.
- [x] Verify desktop/mobile rendered layout, single title, 3 tables, 13 sections, table widths, no horizontal page overflow, inline behavior, and zero console exceptions in Chromium.
- [ ] Verify the final visual fix on live production after deployment; the live site currently still serves the pre-fix layout and this session has no Vercel credentials.

## October 2026 mobile responsiveness correction

- [x] Correct the Samples mobile decorative-panel selector and reduce its mobile height/stack offsets so all five report-type labels remain inside the panel at 360px, 390px, and 430px.
- [x] Keep the Samples hero button, supporting copy, and next section within the viewport without page-level horizontal overflow.
- [x] Make report opening summary text readable on mobile, keep the report title and metadata within the content width, stack financial metric cards into natural-height single-column cards, and reduce mobile section-heading scale.
- [x] Allow evidence-reference groups to wrap naturally while keeping each semantic table in its own touch-scroll container.
- [x] Verify 360px, 390px, and 430px mobile renders plus 1280px desktop: title, paragraphs, metric cards, section headings, table containers, TOC disclosure, category cards, and interactions remain usable; no console exceptions were emitted.
- [ ] Verify the final mobile fix on live production after deployment; the live site still serves the previous build and this session has no Vercel credentials.

## October 2026 Evidence Registry source links

- [x] Verify the original public source destinations independently before editing the report; use only canonical source pages and preserve the original registry titles, IDs, and classifications.
- [x] Add safe new-tab links for E1–E7 and E9–E12 with `target="_blank"` and `rel="noopener noreferrer"`, plus Recon Brief blue hover/focus styling.
- [x] Leave E8 (StartupDissect) as plain text because the original page could not be opened or canonically verified; do not fabricate a replacement URL.
- [x] Verify the rendered registry contains 11 external source links, one plain-text E8 entry, preserved 3-column table structure, and source-link attributes; verify the E3 link resolves to the official Whole Truth Foods domain and browser attributes are correct.
- [ ] Verify the updated links on the live deployed report after deployment; production currently serves the prior build.

## October 2026 obsolete sample URL redirect

- [x] Replace the broken Whole Truth Foods report rewrites with permanent Vercel redirects from the old report URL (with and without a trailing slash) to `/samples`.
- [x] Preserve `samples-company-research-the-whole-truth-foods.html` because the inline Samples viewer fetches it directly as `/samples-company-research-the-whole-truth-foods.html`.
- [x] Remove the redirected old page path from `manus-routes.json`; the existing build excludes redirect sources from the generated sitemap.
- [ ] Deploy through the existing GitHub/Vercel workflow and verify the live 301 response.

## Homepage product demo modal and CTA refinement

- [x] Add a secondary `Watch demo` button beside the existing `Try a sample brief` hero CTA without changing the primary destination.
- [x] Add an accessible dark modal that opens the provided 30-second silent `recon-briefdemowebsite.mp4` asset with native playback controls, volume, fullscreen, Escape/keyboard close behavior, focus restoration, background-scroll locking, responsive sizing, lazy loading, and reduced-motion support.
- [x] Refine the two hero CTA buttons as a cohesive premium pair using the existing dark editorial palette, with the primary visually dominant and the secondary dark/transparent with a thin blue border and play icon.
- [x] Preserve the current header, hero layout, animation system, typography, Samples page, Trust & Privacy page, report engine, APIs, authentication, routing, and unrelated SEO metadata.
- [x] Verify the homepage build, CTA destinations/behavior, modal playback controls, desktop/mobile layout, and production inclusion of the provided video asset.

## Playback fix and How It Works demo

- [x] Fix the existing silent product demo modal so the provided MP4 visibly starts from the Watch demo user action, while retaining native controls and the existing modal heading/design.
- [x] Add a poster frame derived from the provided MP4 so the player does not appear as an empty dark rectangle before playback.
- [x] Add a responsive direct embedded demo player to How It Works after the introductory workflow explanation, using the same MP4 exactly once from the shared public asset path.
- [x] Refine the actual `.hero-primary-cta` and `.hero-secondary-cta` selectors so the homepage CTA pair has visibly distinct final computed styles at desktop and mobile sizes.
- [x] Verify the MP4 response, browser decode/play/pause/seek behavior, modal close/focus behavior, How It Works embedded player, build output, and unaffected public pages.

## Autoplay, loop, and viewport playback refinement

- [x] Start the existing silent MP4 automatically from the homepage Watch demo user action, muted and looped, while retaining native controls and a graceful manual-play fallback.
- [x] Stop and reset the modal player when it closes, releasing its active playback/buffer state without removing the shared asset.
- [x] Autoplay the same muted, looped MP4 when the How It Works player is visible, pause it when it leaves the viewport, and skip automatic motion when reduced-motion is requested.
- [x] Verify the asset path, production inclusion, HTTP range/MIME response, browser playback, pause, seek, responsive layout, CTA computed styles, and absence of video console errors.

## Remove temporary video features

- [x] Remove the homepage Watch demo CTA, modal markup, and video-specific runtime handlers without replacing it with a placeholder; keep Try a sample brief and its `#demo` destination.
- [x] Remove the How It Works embedded video section, heading, description, and player-specific spacing while preserving the research workflow content.
- [x] Remove unused video-specific CSS and retain the original MP4 and poster assets for a future dedicated Videos page.
- [x] Verify production build, desktop/mobile layout, surviving CTA behavior, absence of video UI, and clean browser console output.


## October 2026 approved positioning and Company Research page

- [x] Refine the editable homepage and About page around “Research you can inspect. Intelligence you can act on.” while preserving the existing design, working application destination, report-depth labels, and the five approved research categories.
- [x] Create the root-level `/company-research` page with approved metadata, structured company-research sections, FAQs, sample links, audience guidance, limitations, and responsive existing styling.
- [x] Make targeted copy and contextual-link updates on the editable Market Research, Competitor Analysis, and Research Methodology pages without rewriting their educational frameworks.
- [x] Leave `/samples`, `/how-it-works`, `/trust-and-privacy`, the obsolete React implementation, `index.html.html`, the existing report redirect, and generated `dist/` files untouched.
- [x] Run the production build and verify the new route, canonical metadata, sitemap inclusion, protected-page hashes, internal links, and responsive rendering.
