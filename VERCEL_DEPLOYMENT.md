# Recon Brief Vercel Deployment

This repository contains the Recon Brief marketing website in its existing Vite and static HTML/CSS/JavaScript format. The separate application at `https://app.reconbrief.in/` is not part of this package and is not changed.

## Repository placement

1. Commit the complete project root, including `package.json`, `package-lock.json`, `build.mjs`, `vercel.json`, all HTML pages (including the nested `blog/` directory), shared CSS/JavaScript, and `public/` files.
2. Keep the repository root as Vercel's Root Directory (`./`).
3. Push the intended branch and confirm Vercel is building that branch and commit.

## Vercel settings

- Framework Preset: **Other** (recommended for the dependency-free static-copy production build)
- Build Command: `npm run build` (required so the generated sitemap step runs)
- Output Directory: `dist`
- Root Directory: `./`
- Node.js: **24.x** (as recommended by the existing project setup)

`npm run build` runs `node build.mjs` directly. The authoritative Company Research article source is the root-level `company-research-guide.html`; the build maps it to `dist/blog/company-research-guide/index.html`. The Blog listing source is `blog/index.html`, and the build maps it to `dist/blog/index.html`. The build also copies `styles.css`, `blog.css`, `script.js` and the contents of `public/` into `dist/`. It verifies both nested blog outputs and their image assets before generating the sitemap. Vite remains available for local development but is not used for production output. `vercel.json` explicitly rewrites `/blog` and `/blog/company-research-guide` to their respective `index.html` files. The sitemap generator scans the completed output and includes only pages with a matching, self-canonical, indexable URL on the preferred host. It synchronizes the root-level `sitemap.xml` and `robots.txt` with their `public/` copies and served `dist/` versions, keeping the existing `/sitemap.xml` URL.

The live non-www host currently responds with a permanent redirect to `https://www.reconbrief.in/`. This project therefore uses `www` in canonical URLs, structured site URLs, and the absolute sitemap directive in robots.txt. No redirect behavior is configured or changed by this project update. For a future public SEO landing page, add a root-level `<slug>.html` file with a self-canonical URL such as `https://www.reconbrief.in/<slug>`; it is discovered and added to the sitemap during the normal build. Pages without a canonical URL, marked `noindex`, using another host, or matching private/test/redirect exclusions are omitted.

The Trust & Privacy navigation link intentionally points to `/trust-and-privacy`, but that page is deferred and is not included in the build or sitemap.

## Files to commit

Do not upload only selected HTML/CSS/JavaScript files. Commit the complete source tree, including all root configuration and the existing `public/` directory so Vite can copy its public files to `dist/`.

## Local production verification

```bash
npm ci
npm run build
npm run preview
```

The build should produce the configured HTML pages, static assets, and a generated `dist/sitemap.xml`. Check that the sitemap URLs parse and that each points to an accessible page. On Vercel, verify the extensionless routes and `/sitemap.xml` after deployment; this guide does not claim that a deployment has been performed.
