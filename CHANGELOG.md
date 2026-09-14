# Changelog

All notable changes to StellarBoat are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ⚠ Breaking

- **Removed Web3Forms** in favor of a Worker-gated pipeline to Google Sheets. `FormsConfig` no longer has `defaultBackend`, `web3formsKey`, `apiUrl`, `formspreeEndpoint`, `formsparProjectId`, `recaptchaEnabled`, or `recaptchaSiteKey` — it's now just `{ endpoint, turnstileSiteKey }`. Form components' `backend` and `web3formsKey` props are gone; use `endpoint` instead. Forks on the previous forms system need to: set up a Turnstile widget, deploy `apps-script/` to a Google Sheet, and set three Worker secrets — see `DEPLOYMENT.md#form-worker` and `apps-script/README.md`.

### Added

- **Worker-gated form pipeline** — `worker/index.ts` (new, `main` in `wrangler.jsonc`) handles `POST /api/forms`: a honeypot field, a Cloudflare Workers `FORM_RATE_LIMITER` rate-limit binding, and Cloudflare Turnstile verification all run before a submission is forwarded anywhere.
- **Google Apps Script bridge** (`apps-script/`) — receives an HMAC-signed, replay-protected envelope from the Worker and appends a row to a per-form-type Google Sheet tab, with a best-effort email notification. See `apps-script/README.md` for setup.
- **Shared validation schema** (`src/utils/forms/schema.ts`) — the same `validateSubmission()` runs client-side (`src/utils/forms/client.ts`) and Worker-side (`worker/forms/handler.ts`), so the two can never disagree about what's a valid submission.
- **`/form-error` page** — no-JS submissions (Turnstile requires a browser) are redirected here with a reason code, rather than silently failing or silently succeeding.
- Separate Worker type-checking (`npm run check:worker`, `worker/tsconfig.json`) and test suite (`npm run test:worker`, `worker/vitest.config.ts`) — the Worker targets the Workers runtime, not Node/DOM, so it's checked and tested independently of the app.

### Fixed

- Form components previously shared DOM ids (`#name`, `#email`, ...) and a `document.querySelector('form')` that always grabbed the _first_ form on the page — broken whenever two form components rendered on the same page (e.g. `/contact`, `/forms`). Each form now scopes its fields with an `idPrefix` and is wired independently via `data-stellar-form`.
- Form components' inline `<script define:vars>` blocks called `import('../../utils/forms')`, which cannot resolve from an inline (non-module-bundled) script and silently failed at runtime. Submission logic now lives in a proper bundled module (`src/utils/forms/client.ts`).

### Changed

- **Canonical demo migrated from Cloudflare Pages to Cloudflare Workers with Static Assets** — added `wrangler.jsonc` (assets-only, pointing at `./dist`); deployment remains dashboard-driven via Cloudflare's "Workers Builds" Git integration (no CLI deploy step required), matching the previous Pages workflow. `astro.config.mjs` stayed unchanged (`output: 'static'`, no adapter) at the time, since no server-side routes existed yet — see the form pipeline above for the Worker entrypoint that now uses this `wrangler.jsonc`.
- Removed stray `'netlify'` backend literal from `ResolvedFormConfig` (leftover from the earlier Netlify-support removal) and updated remaining Cloudflare Pages/Netlify references in docs and the showcase FAQ.

### Removed

- `src/utils/forms/index.ts` and `src/utils/forms/adapters/` (`web3forms.ts`, `api.ts`, `formspree.ts`, `formspark.ts`) — collapsed into the single Worker endpoint above.
- `src/types/forms.ts` (`FormAdapter`, `ResolvedFormConfig`) — superseded by `FormType`/`FieldErrors` in `src/utils/forms/schema.ts`.
- `src/demo/edge/resend-worker.ts` — the `api`-backend example adapter it documented no longer exists; extra destinations are now added server-side in `worker/forms/handler.ts`.

## [1.0.0] - 2026-03-10

### Added

#### Core Framework

- **Astro 5 foundation** — Static-first (`output: 'static'`) with optional edge function enhancements on Cloudflare Pages and Vercel
- **TypeScript strict mode** — Full type safety across the codebase; Astro type checking via `astro check`
- **Tailwind CSS v4** — CSS-native `@theme` block replaces JavaScript configuration; unified design tokens in `src/styles/tokens.css`

#### Configuration & Types

- **Fully typed configuration system** — `SiteConfig`, `NavConfig`, `FooterConfig`, `AnalyticsConfig`, `FormsConfig` with 100% JSDoc coverage
- **Fork-friendly config pattern** — `src/config/site.example.ts` as source of truth; support for local environment-specific overrides via `site.local.ts`
- **Feature flags system** — Toggle `blog`, `rss`, `demo`, `pricing`, `testimonials` without code changes

#### Content & SEO

- **Astro 5 Content Layer API** — Type-safe content collections with Zod schema validation for blog posts, authors, and static pages
- **MDX blog support** — Full-featured blog with:
  - Draft post support
  - Reading time estimation
  - Author metadata and bio integration
  - Tag-based filtering and archive
  - RSS feed generation (v1 supports RSS; Atom/JSONFeed deferred)
  - SEO-optimized `<title>`, meta description, canonical URL, Open Graph tags per post
- **JSON-LD structured data** — Automatic schema generation for blog posts (BlogPosting) and organization
- **Sitemap with filtering** — `@astrojs/sitemap` integration with `noIndex` support for demo pages
- **Robots.txt generation** — Dynamic based on environment (disallow `/demo/*` on production)
- **Fully accessible form components** — `<label>` + `for` attributes, `role="alert"` error messaging, keyboard navigation, `aria-required` + `required` attributes, submit button `aria-busy` state

#### Analytics & Privacy

- **Google Tag Manager integration** — Single GTM snippet load via `Analytics.astro`
- **Consent Mode v2 support** — Optional GDPR consent banner (`CookieBanner.astro`) with dataLayer consent defaults
- **Custom tracking utility** — `trackEvent()` function for pushing custom events to GTM dataLayer
- **Global type augmentations** — `Window.dataLayer` and `Window.gtag` typed in `src/types/globals.d.ts`

#### Forms & Lead Generation

- **Web3Forms default adapter** — Zero-config form submissions with email notifications
- **Per-component backend override** — Different forms can use different backends on the same site (e.g., contact → Web3Forms, newsletter → custom API)
- **Accessible form components** — Three primary forms: `ContactForm`, `LeadCaptureForm`, `NewsletterForm`; all support native HTML5 validation and AJAX submission with JS available
- **FormAdapter interface** — Simple, extensible contract for adding new form backends (post-v1)

#### Components & Design System

- **Marketing section components** — `Hero`, `Features`, `Testimonials`, `Pricing`, `FAQ`, `CTA`, `LogoBar`
- **UI primitives** — `Button`, `Card`, `Badge`, `Alert`, `Divider`, `Icon` (via astro-icon + Iconify)
- **MDX enrichment components** — `Callout`, `CodeBlock`, `ImageCaption`, `VideoEmbed` for use inside blog posts
- **Responsive image optimization** — Astro `<Image />` component with AVIF/WebP output and lazy loading
- **Dark mode support** — Automatic OS-level dark mode via `@media (prefers-color-scheme: dark)`; user toggle deferred to post-v1

#### Layouts

- **Base.astro** — HTML shell with `<head>`, SEO, Analytics, fonts, global CSS; no header/footer
- **Page.astro** — Base + Header + Footer for content pages
- **BlogPost.astro** — Page + post header with metadata, reading time, previous/next navigation

#### Demo Site

- **Comprehensive demo site** — `src/pages/showcase.astro`, `src/pages/ui.astro`, `src/pages/forms.astro`, `/demo/` sub-routes demonstrating all features
- **Demo content** — Example blog posts, authors, and static pages with draft/demo post support
- **Design specification** — `src/demo/DESIGN.md` documents the Deep Space visual theme, color system, typography, and component spec
- **Edge function examples** — `src/demo/edge/resend-worker.ts` reference Cloudflare Worker for serverless email

#### Development Quality

- **CI/CD pipeline** — GitHub Actions workflow for lint, type-check, build, Lighthouse CI
- **Playwright e2e tests** — Test surface against the demo site for SEO, accessibility, form submission
- **Vitest unit tests** — Unit test examples for utilities (analytics, blog, forms)
- **Husky + lint-staged** — Pre-commit hooks for ESLint auto-fix and Prettier formatting
- **ESLint + Prettier** — Consistent code style with `eslint-plugin-astro`

#### Deployment

- **Multi-platform support** — Documented setup for:
  - **Canonical:** Cloudflare Pages (static build + optional edge functions)
  - **Alternatives:** Vercel with detailed fork setup instructions
- **Preview deployments** — PR previews via platform native GitHub Apps
- **Environment variables** — `.env.example` with all expected variables documented

#### Documentation

- **Full architecture specification** — `SPEC.md` with 17 sections covering all decisions, patterns, and trade-offs
- **Contribution guide** — `CONTRIBUTING.md` with local setup, Git hooks, code standards, and adapter contract
- **Deployment guide** — `DEPLOYMENT.md` covering Cloudflare Pages setup and fork instructions for Vercel
- **Task list** — `TASKS.md` with 12 implementation milestones tracking progress through v1
- **Demo guide** — `src/demo/README.md` comprehensive walkthrough of how to run, use, and customize the demo

### Implementation Notes

- **v1 scope locked:** Landing.astro layout, additional form adapters (Formspree, Formspark), multiple CMS integrations, and dark mode toggle are explicitly deferred to post-v1
- **Simplifications from spec:** Features flag is part of `SiteConfig` rather than a separate file; only Web3Forms adapter shipped (others are contribution targets)
- **Public API:** All type exports have JSDoc comments; no `any` types; strictly typed component props

---

## Future Milestones (Post-v1)

- [ ] Dark mode user toggle (`data-theme="dark"` with localStorage persistence)
- [ ] Headless CMS adapter layer (Sanity, Contentful, or similar)
- [ ] i18n / multi-locale routing
- [ ] Interactive component primitives (modals, comboboxes, accordions with animation)
- [ ] A/B testing framework
- [ ] Additional form backends (Netlify Forms, Formspree, Formspark, custom API fully documented)
- [ ] Community-maintained sidecars (shadcn/ui integration, Radix Primitives examples, etc.)

---

[1.0.0]: https://github.com/stellarboat/stellarboat/releases/tag/v1.0.0
