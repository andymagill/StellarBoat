# StellarBoat — Implementation Task List

> All architectural decisions are locked. This document is the ordered build plan.  
> Each task references the relevant SPEC.md section.  
> Checkboxes are for tracking progress in forks or during development sprints.

---

## How to Read This List

Tasks are grouped into **milestones**. Within each milestone, order matters — later tasks depend on earlier ones. The demo site is built alongside core features so every feature is exercised as it's implemented.

**Labels:**

- `[core]` — goes in `src/components/`, `src/layouts/`, `src/pages/` (core infrastructure)
- `[config]` — goes in `src/config/` or `src/types/` (fork customization surface)
- `[demo]` — goes in `src/demo/` (demo content and pages)
- `[ci]` — CI/CD, GitHub Actions, deployment config
- `[docs]` — documentation updates

---

## Milestone 0 — Repo Scaffolding

> Get a valid, buildable repo committed before writing any real code.

- [ ] `[ci]` Initialize repo from `npm create astro@latest` — select **Astro 5.x**, TypeScript strict mode, no framework
- [ ] `[ci]` Set `output: 'static'` and Cloudflare adapter active in `astro.config.mjs`; Netlify and Vercel adapters commented out with swap instructions (SPEC §15)
- [ ] `[ci]` Install **Tailwind CSS v4** (`@tailwindcss/vite`) — note: v4 uses the Vite plugin, not `@astrojs/tailwind`
- [ ] `[ci]` Install `eslint-plugin-astro`, `prettier-plugin-astro`; commit `.eslintrc.cjs` and `.prettierrc`
- [ ] `[ci]` Install `@astrojs/sitemap`, `@astrojs/rss`, `astro-icon`
- [ ] `[ci]` Create `.env.example` with all expected variables documented (SPEC §15)
- [ ] `[ci]` Add `.github/workflows/ci.yml` — lint, type-check, build, Lighthouse CI (SPEC §15); **no deploy step**
- [ ] `[docs]` Add a one-time setup note in `DEPLOYMENT.md`: connect the repo to Cloudflare Pages via the GitHub App in the CF dashboard; production deploys on `main`, previews on every PR branch — no workflow file needed
- [ ] `[docs]` Commit `README.md`, `SPEC.md`, `CONTRIBUTING.md`, `TASKS.md`
- [ ] `[config]` Create `src/config/site.example.ts` with full `SiteConfig` type and all fields documented via JSDoc
- [ ] `[config]` Create `src/types/config.ts` — export `SiteConfig`, `NavConfig`, `FooterConfig`, `AnalyticsConfig`, `FormsConfig`, `FeaturesConfig`
- [ ] Verify: `npm run build` succeeds on a blank site with Cloudflare adapter

---

## Milestone 1 — Design Token Foundation

> Establish the styling system before building any components. Tailwind v4 changes how this works.

- [ ] `[core]` Create `src/styles/tokens.css` — contains `@import "tailwindcss"` and the `@theme` block with full token set: color scale, semantic aliases, typography, spacing, radius, shadow (SPEC §7)
- [ ] `[core]` Configure `@tailwindcss/vite` plugin in `astro.config.mjs` to process `tokens.css` as the Tailwind entry point
- [ ] `[core]` Verify no `tailwind.config.js` is needed for theme — only create one if a plugin requires it
- [ ] `[config]` Add Inter + JetBrains Mono via `@fontsource` packages (zero runtime, font files served locally); import in `tokens.css`
- [ ] `[core]` Create `src/styles/global.css` — CSS reset, base element styles using token utilities; imported by `Base.astro`
- [ ] `[core]` Create `src/styles/prose.css` — typography styles for MDX content (headings, lists, code blocks, blockquotes, links); uses token utilities
- [ ] Verify: `npm run check` passes; `npm run build` succeeds; fonts resolve; no CSS warnings

---

## Milestone 2 — Base Layouts & Shell

> Build the HTML shell and page layouts. No real content yet — use placeholder text.

- [ ] `[core]` Create `src/layouts/Base.astro` — `<html>`, `<head>` with charset/viewport/fonts, slot for `<body>` content; accept `title`, `description`, `image`, `canonicalUrl`, `noIndex` props (SPEC §12)
- [ ] `[core]` Create `src/components/seo/SEO.astro` — outputs `<title>` in format `"Page Title — Site Name"` for inner pages, `"Site Name — Tagline"` for homepage; meta description, canonical, robots (SPEC §8)
- [ ] `[core]` Create `src/components/seo/OpenGraph.astro` — all OG and Twitter card tags
- [ ] `[core]` Create `src/components/seo/JsonLd.astro` — accepts a typed `schema` prop; injects `<script type="application/ld+json">` (SPEC §8)
- [ ] `[core]` Integrate SEO, OpenGraph, JsonLd into `Base.astro`
- [ ] `[core]` Create `src/components/layout/Header.astro` — responsive nav with mobile hamburger, reads from `src/config/nav.ts`; includes skip-to-content link
- [ ] `[core]` Create `src/components/layout/Footer.astro` — reads from `src/config/footer.ts`; copyright, nav links
- [ ] `[config]` Create `src/config/nav.ts` and `src/config/footer.ts` with example data
- [ ] `[core]` Create `src/layouts/Page.astro` — extends Base, includes Header + Footer (SPEC §12)
- [ ] `[core]` Create `src/layouts/Landing.astro` — extends Base, full-width, no nav gutters (SPEC §12)
- [ ] `[core]` Create `src/pages/404.astro` — token-styled error page
- [ ] `[ci]` Add `@astrojs/sitemap` to `astro.config.mjs` integrations with a placeholder filter (finalized in Milestone 8); this ensures sitemap is generated from the first buildable commit
- [ ] `[demo]` Create a placeholder `src/pages/index.astro` using `Page` layout with "StellarBoat demo" heading
- [ ] `[demo]` Create `src/pages/demo/tokens.astro` page using `Page` layout — visually render all token values: color swatches showing hex + var name, type scale with examples, spacing scale, radius samples, shadows and glows
- [ ] Verify: site builds; title format correct (`"Page — Site"` vs `"Site — Tagline"`); nav renders on mobile and desktop; 404 works; `/demo/tokens` renders correctly; changing `--color-primary-500` in `@theme` updates `bg-primary-500` utilities

---

## Milestone 3 — UI Primitives

> Build atomic UI components. These are the building blocks for all marketing sections.

- [x] `[core]` `src/components/ui/Button.astro` — variants: `primary`, `secondary`, `ghost`; sizes: `sm`, `md`, `lg`; supports `href` (renders `<a>`) or `type` (renders `<button>`); `class` prop passthrough
- [x] `[core]` `src/components/ui/Card.astro` — surface container with border, radius, shadow tokens; `class` passthrough
- [x] `[core]` `src/components/ui/Badge.astro` — small label pill; color variants
- [x] `[core]` `src/components/ui/Alert.astro` — info/success/warning/error variants; `role="alert"` when error/warning
- [x] `[core]` `src/components/ui/Divider.astro` — horizontal rule using border token
- [x] `[core]` `src/components/ui/Icon.astro` — thin wrapper around `astro-icon`; enforces `aria-hidden` when decorative, `aria-label` when meaningful
- [x] `[demo]` Add `/demo/ui` page rendering all UI primitives with all variants labeled
- [x] Verify: all variants render correctly; no hardcoded colors (all use token utilities)

---

## Milestone 4 — Analytics (GTM)

> Implement the GTM integration. This is intentionally simple — one component, one config field.

- [x] `[config]` Create `src/config/analytics.ts` with `AnalyticsConfig` type: `gtmId: string | null`, `consentMode: boolean`; default `gtmId: null` (SPEC §9)
- [x] `[core]` Create `src/components/analytics/Analytics.astro` — renders consent-init block + GTM `<script>` in `<head>`; no-ops when `gtmId` is null or in dev (`import.meta.env.PROD` guard); consent defaults block fires before GTM when `consentMode: true` (SPEC §9)
- [x] `[core]` Add GTM `<noscript>` iframe render in `Base.astro` body slot — immediately after `<body>`, separate from `Analytics.astro`; gated on `analytics.gtmId && import.meta.env.PROD` (SPEC §9)
- [x] `[core]` Create `src/components/analytics/CookieBanner.astro` — accessible accept/decline banner in `src/components/analytics/`; on accept calls `gtag('consent', 'update', ...)` and sets a persistent cookie; included in `Base.astro` only when `consentMode: true` (SPEC §9)
- [x] `[core]` Create `src/utils/analytics.ts` — `trackEvent(name, params)` pushes to `window.dataLayer`; no-ops if `dataLayer` not initialized (SPEC §9)
- [x] `[core]` Integrate `<Analytics />` into `<head>` in `Base.astro`; add GTM noscript block at start of `<body>`; add `<CookieBanner />` when `consentMode: true` (SPEC §9)
- [x] `[demo]` Add GTM container ID to demo `analytics.ts`; document in `src/demo/README.md` how to verify events fire in GTM Preview mode
- [x] Verify: GTM script absent in dev, present in production HTML; consent block precedes GTM script; noscript iframe is first element inside `<body>`

---

## Milestone 5 — Forms

> Implement form components and the Web3Forms default backend. Per-component override is a first-class feature.

- [x] `[config]` Create `src/config/forms.ts` with `FormsConfig` type; default `backend: 'web3forms'`; document all fields with JSDoc (SPEC §10)
- [x] `[core]` Create `src/types/forms.ts` — export `ResolvedFormConfig` and `FormAdapter` interface; `FormsConfig` remains in `src/types/config.ts` (SPEC §10)
- [x] `[core]` Create `src/components/forms/FormField.astro` — accessible field wrapper: `<label>`, `<input>`/`<textarea>`/`<select>`, error message container with `role="alert"` and `aria-live="polite"` (SPEC §10)
- [x] `[core]` Create `src/utils/forms/adapters/web3forms.ts` — implements `FormAdapter`; POST to Web3Forms API; return `{ ok, error }` (SPEC §10)
- [x] `[core]` Create `src/utils/forms/adapters/netlify.ts` — adds hidden fields; POST to `/?no-cache=1`; logs build warning if not on Netlify (SPEC §10)
- [x] `[core]` Create `src/utils/forms/adapters/api.ts` — POST to `config.actionUrl`; return `{ ok, error }` (SPEC §10)
- [x] `[core]` Create community adapter stubs: `formspree.ts`, `formspark.ts` — marked community-maintained in JSDoc
- [x] `[core]` Create `src/utils/forms/index.ts` — `submitForm(data, overrides?)` dispatcher; merges global config with `overrides`; selects and calls correct adapter (SPEC §10)
- [x] `[core]` Create `src/components/forms/ContactForm.astro` — name, email, message; accepts optional `backend` prop and adapter-specific override props; passes merged config to `submitForm`; handles loading/success/error states with ARIA (SPEC §10)
- [x] `[core]` Create `src/components/forms/LeadCaptureForm.astro` — name, email, optional company + phone; same backend prop pattern (SPEC §10)
- [x] `[core]` Create `src/components/forms/NewsletterForm.astro` — email only; same backend prop pattern (SPEC §10)
- [x] `[demo]` Add `src/pages/demo/forms.astro` page showing: `ContactForm` with global Web3Forms default, `NewsletterForm` with `backend="api"` override, both side-by-side (SPEC §10)
- [x] `[demo]` Add `src/demo/edge/resend-worker.ts` — a Cloudflare Worker example for the `api` backend that forwards form data to Resend
- [x] Verify: contact form submits via Web3Forms; newsletter form routes to different endpoint; error state renders on failure; no-JS native POST still works

---

## Milestone 6 — Marketing Section Components

> Build the homepage section components.

- [x] `[core]` `src/components/marketing/Hero.astro` — variants: `centered`, `split-left`, `split-right`; props: `headline`, `subheadline`, `cta` (primary), `ctaSecondary` (optional), `image` (optional) (SPEC §13)
- [x] `[core]` `src/components/marketing/Features.astro` — variants: `grid-3`, `grid-2`, `list`; props: `items[]` with `icon`, `title`, `description`
- [x] `[core]` `src/components/marketing/Testimonials.astro` — props: `items[]` with `quote`, `author`, `role`, `avatar` (optional); variant: `cards`, `carousel`
- [x] `[core]` `src/components/marketing/Pricing.astro` — props: `plans[]` with `name`, `price`, `period`, `features[]`, `cta`, `highlighted`; gated by `features.pricing`
- [x] `[core]` `src/components/marketing/FAQ.astro` — accordion; props: `items[]` with `question`, `answer` (MDX-renderable string)
- [x] `[core]` `src/components/marketing/CTA.astro` — full-width call-to-action band; props: `headline`, `subtext`, `cta`
- [x] `[core]` `src/components/marketing/LogoBar.astro` — props: `logos[]` with `src`, `alt`, `href` (optional); renders a horizontal strip
- [x] `[demo]` Add `/demo/components` page showing every marketing component with all variants side-by-side
- [x] Verify: all variants render; all props accept tokens/utilities (no hardcoded brand colors)

---

## Milestone 7 — Blog System

> Implement the full blog using the Astro 5 Content Layer API.

- [ ] `[config]` Define `blog`, `authors`, and `pages` collections in `src/content/config.ts` using Astro 5 `defineCollection` with `glob` loader and Zod schemas (SPEC §6)
- [ ] `[config]` Add `src/types/` entry to tsconfig paths if needed; run `astro sync` after defining collections to generate `.astro/types.d.ts`; add `astro sync` to `postinstall` script in `package.json`
- [ ] `[demo]` Add 4–6 example blog posts in `src/content/blog/` — different tag combos, one `featured: true`, one `draft: true`, one with `canonicalUrl` set. These live in `src/content/` (not `src/demo/`) so the glob loader picks them up. Mark them with a `demo: true` frontmatter field so they can be filtered or identified.
- [ ] `[demo]` Add 2 example authors in `src/content/authors/` as JSON files
- [ ] `[core]` Create `src/utils/blog.ts` — `getPublishedPosts()`, `getFeaturedPosts()`, `getPostsByTag()`, `getAllTags()`, `getReadingTime(body: string)` using Astro 5 `getCollection()` API; `getPublishedPosts()` filters `draft: true` in production (SPEC §6, §11)
- [ ] `[core]` Create `src/components/blog/PostCard.astro` — title, date, author name, tag pills, excerpt, cover image (SPEC §11)
- [ ] `[core]` Create `src/components/blog/PostList.astro` — renders a list of `PostCard`; accepts `featured` slot for hero treatment of the first featured post
- [ ] `[core]` Create `src/components/blog/TagFilter.astro` — renders all tags as pills; current tag highlighted; links to `/blog/tag/[tag]`
- [ ] `[core]` Create `src/components/blog/AuthorBio.astro` — avatar, name, bio, social links; degrades gracefully if author not found
- [ ] `[core]` Create `src/layouts/BlogPost.astro` — post header (title, date, author, reading time, tags), reading progress indicator, prose content via `<slot />`, previous/next navigation (SPEC §12)
- [ ] `[core]` Create `src/pages/blog/index.astro` — paginated post list using `paginate()`; returns empty `getStaticPaths()` when `features.blog` is false (SPEC §11)
- [ ] `[core]` Create `src/pages/blog/[...slug].astro` — dynamic post route; `getStaticPaths()` from collection; returns empty paths when `features.blog` is false (SPEC §11)
- [ ] `[core]` Create `src/pages/blog/tag/[tag].astro` — filtered post list; `getStaticPaths()` from all tags (SPEC §11)
- [ ] `[core]` Create `src/pages/rss.xml.ts` — RSS feed endpoint; returns 404 when `features.rss` is false; returns empty feed when `features.blog` is false (SPEC §5, §11)
- [ ] `[core]` Add MDX enrichment components: `src/components/mdx/Callout.astro`, `CodeBlock.astro`, `ImageCaption.astro`, `VideoEmbed.astro` (SPEC §11)
- [ ] Verify: blog index paginates; tag filter routes work; RSS XML validates; draft post absent from production `getStaticPaths()`; reading time renders on posts

---

## Milestone 8 — SEO & Sitemap

> Wire JSON-LD structured data per layout type and finalize the sitemap integration.

- [ ] `[core]` Add JSON-LD per layout: `WebSite` + `Organization` on homepage (from `site.ts`), `WebPage` on standard pages, `BlogPosting` on blog posts (SPEC §8)
- [ ] `[core]` Add `BreadcrumbList` JSON-LD to blog post (`/blog/[...slug]`) and tag pages (`/blog/tag/[tag]`) (SPEC §8)
- [ ] `[core]` Configure `@astrojs/sitemap` integration in `astro.config.mjs` with a `filter` function excluding `/demo/` routes, `noIndex` pages, and `/thank-you`; **no `src/pages/sitemap.xml.ts` file** — the integration generates `sitemap.xml` automatically (SPEC §8)
- [ ] `[core]` Create `src/pages/robots.txt.ts` — allow all in production, `Disallow: /` when `PUBLIC_NOINDEX=true` env var is set (SPEC §8)
- [ ] `[ci]` Confirm Lighthouse SEO threshold = 100 is set in `lighthouserc.cjs` (added in Milestone 11)
- [ ] Verify: `sitemap.xml` present in `dist/` after build; lists all non-demo public pages; `robots.txt` correct; JSON-LD valid via Google Rich Results Test; blog post breadcrumb renders correctly

---

## Milestone 9 — Homepage, Contact & Thank-You Pages

> Build the three fork-editable pages using the completed component library.

- [ ] `[core]` Create the final `src/pages/index.astro` — a reference composition using Hero, LogoBar, Features, Testimonials, FAQ, CTA; all content data defined inline in the file (SPEC §12)
- [ ] `[core]` Create `src/pages/contact.astro` — uses `Page` layout; renders `ContactForm` and `LeadCaptureForm` side-by-side with explanatory copy; content data inline (SPEC §12)
- [ ] `[core]` Create `src/pages/thank-you.astro` — post-form-submission confirmation; fork-editable (branded message, optional countdown redirect); uses `Page` layout
- [ ] `[demo]` Add `src/pages/demo/content-page.astro` — an example route that renders an MDX file from `src/content/pages/` via `getEntry()`; demonstrates the content-collection-powered static page pattern
- [ ] `[demo]` Add `src/content/pages/about.mdx` as a demo content page
- [ ] Verify: homepage renders all sections; form submits and lands on thank-you; thank-you page copy is easy to identify as fork-editable

---

## Milestone 10 — Demo Site Completion

> Finish the demo as a coherent, complete reference site.

- [ ] `[demo]` Create `src/demo/README.md` — explains demo purpose, how to use it as reference, how to delete it (remove `src/demo/` and `src/pages/demo/`)
- [ ] `[demo]` Create `src/pages/demo/index.astro` — index page listing all demo routes with descriptions
- [ ] `[demo]` Verify all `src/pages/demo/*` routes are excluded from sitemap filter in `astro.config.mjs`
- [ ] `[config]` Confirm `features.demo` flag is wired: when `false`, all pages in `src/pages/demo/` return empty `getStaticPaths()` or 404; demo nav links hidden
- [ ] `[demo]` Verify the demo functions as a standalone reference: each page has a visible heading explaining what it demonstrates

---

## Milestone 11 — CI/CD Completion & Quality Gates

> Finalize all workflows and add the Playwright smoke test suite.

- [ ] `[ci]` Install and configure `@lhci/cli` (Lighthouse CI); add `lighthouserc.cjs` with thresholds from SPEC §15
- [ ] `[ci]` Install Playwright; add `@playwright/test`
- [ ] `[ci]` Write smoke tests (`tests/e2e/`): homepage loads, nav links work, contact form renders, blog index loads, blog post loads, 404 page renders, RSS feed is valid XML, GTM script tag present in production HTML
- [ ] `[ci]` Write unit tests (`tests/unit/`): `getReadingTime()`, `getPublishedPosts()` draft filtering, `trackEvent()` no-ops when `dataLayer` absent, `submitForm()` resolves backend correctly with and without prop overrides
- [ ] `[ci]` Finalize `ci.yml` — all pre-flight steps active: lint → `astro check` → build → Playwright → Lighthouse CI; confirm no deploy logic present
- [ ] `[ci]` Verify branch protection on `main` requires `ci.yml` to pass before merge
- [ ] `[docs]` Finalize `DEPLOYMENT.md` — Cloudflare GitHub App setup steps, branch/preview config, Netlify/Vercel dashboard-connect instructions for forks
- [ ] Verify: CI passes clean; all Lighthouse thresholds met; Playwright tests green; Cloudflare GitHub App triggers a separate build after CI on the same commit

---

## Milestone 12 — Documentation Completion & v1 Tag

- [ ] `[docs]` Write `src/demo/README.md` — comprehensive guide to the demo site
- [ ] `[docs]` Update `CONTRIBUTING.md` with finalized adapter contracts and tested local dev workflow
- [ ] `[docs]` Update `SPEC.md` — mark all sections as implemented; add any decisions made during implementation
- [ ] `[docs]` Update `README.md` — add live Cloudflare Pages demo URL
- [ ] `[docs]` Add inline JSDoc to all config types in `src/types/config.ts` — every field documented
- [ ] `[docs]` Add a `CHANGELOG.md` with v1.0.0 entry
- [ ] Review: walk through the fork setup steps in `SPEC.md §16` on a clean clone; document any gaps found
- [ ] Tag `v1.0.0`

---

## Post-v1 Backlog (not tracked here)

- Dark mode toggle UI + persistence
- Headless CMS adapter layer (Sanity first)
- i18n routing support
- Sitemap image extension for blog posts
- Dynamic OG image generation via edge function
- GitHub template repository configuration (`.github/template.yml`)
