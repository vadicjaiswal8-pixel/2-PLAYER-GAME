# Recon Brief marketing website

This is the finalized Recon Brief marketing website: a static, premium editorial landing page for an AI-assisted research and competitive intelligence platform.

The update preserves the original hero composition, typography, spacing, animation placement, responsive behavior, section structure, and blue visual identity while improving the product copy, application links, workflow coverage, logo mark, and trust language.

## Requirements

- Node.js 24.x is recommended for the Vercel setup; Node.js 18 or newer also supports the legacy static build script.
- npm (Vite is retained for local development; the production build is dependency-free).
- Python 3.9+ or Vite Preview for local preview.

## Run locally on Windows

Open **PowerShell** in this project folder.

```powershell
node build.mjs
py -m http.server 3000 --directory dist
```

If the Python launcher is not available, use:

```powershell
python -m http.server 3000 --directory dist
```

Then open `http://localhost:3000` in a browser. Stop the server with `Ctrl+C`.

To preview the source files directly instead of the generated build:

```powershell
py -m http.server 3000
```

## Build

For the Vercel-compatible production build:

```powershell
npm install
npm run build
```

The production build runs `node build.mjs` and writes the static site to `dist/`. It copies eligible source HTML files while preserving their paths, including the nested blog listing and article pages, copies shared CSS/JavaScript and the contents of `public/`, verifies the blog output files and images, and regenerates `sitemap.xml` and `robots.txt` at the project root, under `public/`, and in `dist/`. The sitemap is built from self-canonical, indexable page URLs. `vercel.json` rewrites the clean blog URLs to their nested `index.html` files. Vite remains available for local development but is not used for production output.

## Main files

- `index.html` — active Vite homepage entry: semantic marketing page, SEO metadata, navigation, product story, demo, workflows, trust, and CTAs.
- `about.html` and `how-it-works.html` — the two additional marketing pages, using the shared static-site styles and script.
- `styles.css` — original blue Recon Brief design system, layout, responsive rules, and motion.
- `script.js` — navigation, scroll reveal, workflow animation, interactive illustrative demo, and accessible interactions.
- `public/` — the included public icons, `robots.txt`, and generated sitemap snapshot. The root-level `sitemap.xml` and `robots.txt` are preserved for compatibility and synchronized by the build. Both identify `https://www.reconbrief.in/sitemap.xml`; www is the observed preferred host because non-www redirects there.
- `src/` — retained React source tree; it is not imported by the configured root HTML build. `index.html.html` is also retained but is not a Vite entry.
- `favicon.svg`, `public/favicon.svg`, `public/favicon.png`, and `public/recon-brief.svg` — existing mint-tile, geometric navy Recon Brief mark with its light-blue accent; pages use the 64×64 PNG favicon.
- `package.json`, `package-lock.json`, `vite.config.js`, and `vercel.json` — Vite 8/Vercel deployment configuration.
- `VERCEL_DEPLOYMENT.md` — exact GitHub/Vercel placement, settings, and asset instructions.
- `build.mjs` — dependency-free production static build; preserves nested HTML routes, verifies blog outputs and assets, and generates the sitemap/robots files.
- `manus-routes.json`, `sitemap.xml`, `robots.txt`, `public/sitemap.xml`, and `public/robots.txt` — route discovery and crawler metadata. The generated sitemap is served at the existing `/sitemap.xml` URL from `dist/`.
- `app.config.ts` — project logo metadata.

The configured Vercel build is the static HTML/CSS/JavaScript site; eligible `.html` pages are copied with their relative paths preserved and considered for the sitemap. For a future public SEO page, add its HTML file with a self-canonical `https://www.reconbrief.in/<route>` URL and do not mark it `noindex`; no sitemap URL entry needs to be maintained by hand. The separate Recon Brief application is not included in this package. The optional homepage evidence-network background reference was removed after confirming that the asset was unavailable; no replacement image was invented or added.

## Content and trust notes

The visible counts, unsupported performance percentages, and verification language were removed. The report imagery and interactive research path are explicitly presented as **illustrative/sample** material; the marketing demo does not run live research.

Primary application CTAs link to `https://app.reconbrief.in/` in a new tab. Internal section links remain available for navigation.

## Changes in this update

1. Preserved the original visual identity and animation system.
2. Updated the logo to the blue rounded-square/white-R Recon Brief mark.
3. Replaced unsupported metrics and fake verification labels with descriptive product language.
4. Clarified Market & Company Research, Competitive Intelligence, Academic Research & Studies, and Presentation Creation workflows.
5. Marked report imagery and the interactive demo as illustrative.
6. Linked the main workspace and workflow CTAs to the real Recon Brief app.
7. Added this Windows/local-run documentation.



## October 2026 targeted animation pass

This pass made two focused corrections without redesigning unrelated sections. The static visual in the **Research that is ready to leave the room** output section was replaced with a faithful marketing-site adaptation of the real application hero animation found in `/home/ubuntu/recon-redesign/index.html` and `/home/ubuntu/recon-redesign/style.css`.

The reused application component is `.rb-hero-proof`. Its report frame, floating motion, and scan-line behavior were carried into the marketing page as `.app-hero-animation`, using the existing `/assets/report-preview.jpg` asset. The adaptation is CSS-only and does not require app APIs, data, or runtime dependencies. It respects `prefers-reduced-motion` and is contained within the existing output visual area.

The Research Layer section was inspected and intentionally left structurally unchanged: it still contains the original paragraph, top rail, four columns, labels, and dividers. No unsupported statistics or new claims were added.

### Exact files changed in this pass

| File | Change |
| --- | --- |
| `index.html` | Replaced only the output-section center image markup with the app-derived animated report component. The heading and three output cards remain unchanged. |
| `styles.css` | Added the app-derived floating report and scan-line keyframes, responsive containment, and reduced-motion override. The existing stylesheet was preserved. |
| `README.md` | Documented the source component, adaptation boundary, and validation results. |
| `plan.md` | Recorded the targeted animation integration decision. |
| `TODO.md` | Recorded the completed acceptance criteria for this pass. |

### Validation for this pass

The production build, JavaScript syntax check, CSS diff check, asset loading checks, and structural assertions passed. Browser Preview captures were completed at 1440px desktop and 390px mobile widths. The styled page rendered correctly, the app-derived animation markup was present in the output area, the Research Layer retained four columns, and all three output cards remained present. No unavailable dependencies remain for this animation adaptation.


## Vite 8 / Vercel deployment hardening

This package now includes `package.json`, `package-lock.json`, `vite.config.js`, `vercel.json`, and `VERCEL_DEPLOYMENT.md` for the existing Vite/Vercel setup. Vercel can run `vite build` and publish `dist/`. The approved HTML/CSS/JS design is unchanged; only the stylesheet/runtime references were made Vite-safe and the interaction script is bundled as a module.

The production build was tested with Node.js 22.13.0 and Vite 8.0.0. The generated `dist/` contains the hashed CSS and JavaScript bundles, both research images, favicon, route manifest, sitemap, and robots file. A Vite preview server returned HTTP 200 for the page and every generated asset. Chromium DevTools reported no JavaScript exceptions and no failed resource loads. The browser check also confirmed the animated report frame and scan line, mobile navigation, workflow-stage interaction, and sample-brief progression.


## October 2026 deployed-asset repair

The evidence-network visual and animated report preview are now imported from `assets/` by `script.js` and referenced relatively from `index.html`/`styles.css`. Vite emits hashed copies into `dist/assets/`, so the deployed site no longer depends on `/assets/evidence-network.png` or `/assets/report-preview.jpg` being manually copied into a Vercel `public/` folder. The original image files remain in the package as source assets and fallback references.

This was tested with a clean Vite build after removing `public/assets/`. Both hashed images were still emitted. Chromium then loaded both images at their expected intrinsic widths, reported no runtime exceptions or failed resource loads, and confirmed the report float and scan-line animations were active.

## Responsive optimization pass

The responsive layout was audited at 320px, 375px, 390px, 768px, 1024px, and 1366px viewport widths. The pass contains the perspective workflow grid and decorative hero/CTA orbits, replaces mobile demo-stage horizontal expansion with a wrapping two-column layout, hides the desktop header CTA at compact widths, and enables the compact navigation menu through 900px so iPad portrait does not crowd the header. The approved desktop composition remains unchanged.

Production screenshots were captured at 390px phone, 768px iPad portrait, 1024px iPad landscape, and 1366px desktop sizes. The final build also passed the browser overflow audit with no document-level horizontal viewport movement at those sizes.

## Vercel asset-path correction

The research visuals are served from `public/assets/` and are referenced with public URLs: `/assets/evidence-network.png` and `/assets/report-preview.jpg`. `script.js` no longer imports these files as JavaScript modules, and the HTML/CSS references use the same public paths. A clean `npm run build` was run after the change; both files were present in `dist/assets/`, returned HTTP 200 from the Vite production preview, and rendered in Chromium without runtime or failed-resource errors.

## Favicon deployment correction

The site now uses the uniquely named `/recon-brief-favicon.svg?v=2` asset, with both `icon` and `shortcut icon` links. This avoids collisions with Vercel's default `/favicon.svg`. The production build emits `dist/recon-brief-favicon.svg`, and the Vite preview returned it with HTTP 200 and the Recon Brief blue mark.

## Inline favicon fallback

The live deployment returned 404 for the separately named favicon asset, so the favicon is now embedded directly as a base64 SVG data URL in `index.html`. This removes any dependency on Vercel's public-folder routing for the browser tab icon while retaining the Recon Brief favicon files in the package.

## Animation asset deployment correction

The Evidence Layer network visual and From insight to output report preview now use Vite imports from `assets/`. Vite emits hashed production files such as `evidence-network-*.png` and `report-preview-*.jpg` in `dist/assets`, and the HTML no longer requests the old unbundled `/assets/*.png` or `/assets/*.jpg` paths.

## Vite-safe animation asset setup

The animation images are intentionally served from `public/assets/` using ordinary public URLs. `script.js` contains no JavaScript image imports, so the project works with the existing Vite 8 configuration without module-resolution errors. The build copies both files to `dist/assets/`.

## Self-contained animation fallback

The Evidence Layer network and From insight to output report visuals are now generated with inline SVG/CSS motion artwork. They no longer depend on `/assets/evidence-network.png` or `/assets/report-preview.jpg`, so their animations remain available even when a deployment host omits binary public assets.
