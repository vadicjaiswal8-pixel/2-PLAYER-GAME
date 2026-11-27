

## October 2026 Samples experience extension

### Implementation approach

Extend the existing static HTML/Vite marketing site with two public pages: `/samples` and `/samples/company-research/the-whole-truth-foods`. Reuse the current header, footer, typography, colors, spacing, navigation, and responsive behavior. Add Samples links to the existing active marketing-page headers and footers. Keep the landing-page categories in a reusable data-driven structure in `samples.html`; only Company Research links to a working report page, while Market Research, Competitive Intelligence, Academic Research, and Custom Research remain explicit non-interactive Coming Soon cards.

Render the supplied Whole Truth Foods Markdown as semantic HTML in the report page. Preserve the source order and complete content, including real HTML tables for Company Snapshot, Financial & Operating Performance, and Evidence Registry; real lists; headings; paragraphs; evidence references; interpretation notes; research gaps; Evidence Check findings; and all E1–E12 registry rows. Use horizontal table scrolling on small screens rather than clipping or flattening tables. Add public canonical, Open Graph, and Twitter metadata using existing brand assets without inventing authors, dates, source URLs, or verification claims.

### Project structure

The root-level HTML files remain the public page entries. `samples.html` owns the category-selection experience; `samples-company-research-whole-truth-foods.html` owns the complete sample report view. `styles.css` receives scoped Samples/report styles; `manus-routes.json` declares both routes; `build.mjs` continues to discover canonical pages and generate sitemap/robots outputs. Existing application/source files, static assets, and report-generation functionality remain untouched.

### Design decisions

- **Design movement:** editorial business intelligence journal with restrained instrument-panel details (probability 0.06).
- **Core principles:** evidence first, calm hierarchy, readable density, and clear availability states.
- **Color philosophy:** preserve the deep ink background and blue/mint accents so research feels analytical and trustworthy without looking clinical.
- **Layout paradigm:** a report-led editorial column with a slim sticky contents rail and horizontal overflow only where tables require it.
- **Signature elements:** numbered section markers, evidence chips/links, and fine-line table rules.
- **Interaction philosophy:** only verified destinations are clickable; Coming Soon categories communicate future scope without fake actions.
- **Animation:** reuse existing reveal behavior; no decorative motion is necessary for report content and reduced-motion behavior remains respected.
- **Typography system:** existing Newsreader display serif for report headings, DM Sans for readable body copy, and DM Mono for evidence/meta labels.
- **Brand essence:** evidence-backed research intelligence for people making consequential decisions; measured, transparent, useful.
- **Brand voice:** precise, calm, and candid. Example lines: “Explore the evidence behind the conclusion.” “A sample report, formatted for scrutiny.”
- **Signature brand color:** the existing Recon Brief blue accent.
