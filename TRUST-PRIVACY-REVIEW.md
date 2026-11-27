# Trust & Privacy publication review

This document is development-only and must not be published as a public route or copied into the website's `public/` directory.

## Scope reviewed

The available repository is the Recon Brief static marketing site. It contains the public HTML pages, shared CSS/JavaScript, build scripts, Vite configuration, Vercel configuration, social assets, sitemap, robots file, and `llms.txt`. It does not contain the authenticated application, Supabase project configuration, database migrations, Settings screen, account-deletion handlers, or provider configuration.

## Analytics finding

Google Analytics 4 remains active on the public marketing pages. The inspected pages load `https://www.googletagmanager.com/gtag/js?id=G-RDSBK5Q74S` and call `gtag('config', 'G-RDSBK5Q74S')`. The public Trust & Privacy page now discloses that the marketing website uses Google Analytics 4. No analytics code was added or removed in this update.

The public disclosure intentionally does not claim what data Google retains or how Google processes it. Those details should be aligned with the applicable Google documentation and the site's consent configuration before publication.

## Application-level items requiring confirmation

The following statements remain based on the supplied product description and were not independently verified from this static repository:

- Supabase project region and applicable Supabase data-processing terms.
- Exact account creation and sign-in behavior.
- Whether `Settings → Delete your account` exists and which records it deletes.
- Whether individual reports, projects, sources, and sign-in records are deleted together or have retention exceptions.
- Whether uploaded originals are always processed only in the browser and never uploaded.
- Exact AI-provider, Tavily, Vercel, and Google data flows, retention, training, and processing locations.
- Usage-counter and hashed-IP implementation.
- Browser retention durations and cookie/session behavior in the authenticated app.
- Database row-level-security rules, security headers, provider allow-listing, error handling, and file-library hosting.

Do not add more specific regional, retention, deletion, training, or security claims until the authenticated application code, database behavior, configuration, and current provider terms have been reviewed.

## Public-page change made

The internal `IMPORTANT BEFORE PUBLICATION` warning box, publication-review status, Supabase-region placeholder, provider-terms placeholder, and internal discrepancy notes were removed from the public page. The page retains the Trust & Privacy sections and now presents the verified static-site analytics fact in visitor-facing language.
