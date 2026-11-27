# Recon Brief Blog Build Fix — Verification Notes

## Root cause addressed

The static build copied nested HTML pages (including `blog/index.html`) and the entire `public/` tree into the same `dist/` destination concurrently through one `Promise.all`. The `public/blog/` directory and the HTML build both target `dist/blog/`. That overlapping directory-copy work could race, leaving the blog listing or article output missing when the validation ran.

## Correction

- Copy HTML pages in a deterministic sequence.
- Copy the two required blog pages explicitly after verifying their source files exist.
- Copy top-level static assets only after HTML output is complete.
- Exclude `public/blog/` from the bulk public-asset copy; the two blog image assets are copied and byte-verified by `ensureBlogImagesInOutput()`.
- Keep the real output checks for the blog listing, article, canonical URLs, links and image assets.

## Local verification performed

- `npm run build` completed successfully for 10 consecutive clean builds.
- Each clean build emitted `dist/blog/index.html` and `dist/blog/company-research-guide/index.html`.
- Local static HTTP checks returned HTTP 200 for `/blog`, `/blog/`, `/blog/company-research-guide`, `/blog/company-research-guide/`, `/blog.css`, both blog images and `/sitemap.xml`.
- The sitemap contained 11 unique canonical URLs, including the Company Research article exactly once.
- The blog listing contained the intended article link; both pages contained their expected canonical URLs.

## Deployment note

These checks were run locally against the generated `dist/` output. A successful Vercel production deployment still needs to be confirmed by Vercel after the corrected project is committed and deployed.
