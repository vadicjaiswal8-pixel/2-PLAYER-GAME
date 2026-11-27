# Recon Brief Deployment Guide

This package contains the active static Recon Brief marketing website. It is intended to be uploaded to GitHub and deployed through the existing Vercel workflow. No production deployment or GitHub push was performed during this audit.

## Prerequisites

- Node.js 20.19+ (Node.js 22 or 24 is recommended for the Vite 8 toolchain).
- npm.
- A GitHub repository connected to the existing Vercel project.

The project uses the included `package-lock.json`; use npm commands rather than switching package managers.

## Extract and install

Extract the ZIP and open a terminal at the extracted project root:

```bash
npm ci
```

## Build

Run the production build:

```bash
npm run build
```

The production build runs the dependency-free `node build.mjs` static-copy pipeline. The authoritative Company Research article source is the repository-root `company-research-guide.html`; the build maps it to `dist/blog/company-research-guide/index.html`. The Blog listing source is `blog/index.html`. The pipeline copies shared styles/scripts and public assets, verifies both blog outputs and blog images, then regenerates the root/public/dist sitemap and robots files. Vite remains available for local development, but it is not used to produce the production HTML output.

## Vercel settings

Deploy the project root. The included `vercel.json` already specifies:

- Build command: `npm run build`
- Output directory: `dist`
- Clean URLs: enabled
- Permanent redirects for the obsolete Whole Truth Foods report URL to `/samples`

Do not deploy the `dist/` directory as the repository root. Vercel should build from the project root.

## Local preview

After building, use either:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

or:

```bash
python3 -m http.server 4173 --directory dist
```

The Vite preview is preferred when checking Vite-served output. The Python server is useful for a simple static inspection of generated files.

## GitHub and Vercel workflow

1. Extract the package into a clean working directory.
2. Run `npm ci` and `npm run build`.
3. Review the generated `dist/` output and the changed source files.
4. Commit the package contents to the intended GitHub repository.
5. Push to the branch connected to Vercel.
6. Allow Vercel to run the existing build command and publish `dist/`.
7. After deployment, verify the homepage, `/company-research`, `/samples`, protected pages, canonical metadata, sitemap, robots file, and the permanent legacy report redirect.

## Verification and limitations

Verified locally during this audit:

- The active Vite build completes successfully.
- `company-research.html` is included in production output.
- The generated sitemap contains the canonical `/company-research` URL and excludes the redirecting Whole Truth Foods URL.
- The protected pages `samples.html`, `how-it-works.html`, and `trust-and-privacy.html` were not modified.
- The missing optional `/assets/evidence-network.png` reference was removed from active CSS after confirming that the asset was unavailable. No replacement image was invented.
- The package excludes credentials, `.env` files, `node_modules`, `.git`, generated `dist/`, temporary screenshots, and local logs.

Not verified in this package audit:

- A live production deployment or Vercel response.
- Google Search Console indexing status.
- External application behavior at `https://app.reconbrief.in/`.
- Google Analytics reporting or authenticated application behavior.

The static marketing pages do not require environment variables. The separate Recon Brief application is not included in this package.
