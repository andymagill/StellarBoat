# StellarBoat — Architecture Specification

> Version: 1.0.0  
> Status: **v1.0.0 — all architectural decisions implemented**  
> Last updated: 2026-03-10

---

### Decision Log

| Decision | Choice | Status |
|---|---|---|
| Framework version | Astro 5.x | ✅ Implemented |
| Rendering mode | Static (SSG) + Edge functions | ✅ Implemented |
| Styling | Tailwind CSS v4 + `@theme` CSS-native tokens | ✅ Implemented |
| Analytics | Google Tag Manager (may load GA4 or any tag) | ✅ Implemented |
| Form backend | Worker-gated pipeline → Google Sheets (via Apps Script) | ✅ Implemented |
| Content authoring | MDX/Markdown in-repo (Astro 5 Content Layer API) | ✅ Implemented |
| Live demo host | See DEPLOYMENT.md for canonical platform | ✅ Implemented |
| Deployment compatibility | Fork-ready; see DEPLOYMENT.md for supported platforms | ✅ Implemented |

---

## Table of Contents

1. [Goals & Non-Goals](#1-goals--non-goals)
2. [Architecture Principles](#2-architecture-principles)
3. [Technology Stack](#3-technology-stack)
4. [Directory Structure](#4-directory-structure)
5. [Configuration Layer](#5-configuration-layer)
6. [Content System](#6-content-system)
7. [Theming & Design Tokens](#7-theming--design-tokens)
8. [SEO System](#8-seo-system)
9. [Analytics System](#9-analytics-system)
10. [Forms & Lead Generation](#10-forms--lead-generation)
11. [Blog System](#11-blog-system)
12. [Page Architecture](#12-page-architecture)
13. [Component System](#13-component-system)
14. [Demo Site](#14-demo-site)
15. [Deployment & CI/CD](#15-deployment--cicd)
16. [Fork Workflow & Upstream Merging](#16-fork-workflow--upstream-merging)
17. [Open Questions](#17-open-questions)

---

## 1. Goals & Non-Goals

### Goals

- Provide a production-ready starting point for marketing mini-sites that can be deployed in under an hour
- Maintain a clean separation between **core framework** and **project-specific content, config, and styles** to minimize merge conflicts in forks
- Be fully navigable by AI coding agents — all architecture decisions are documented and the codebase is structured predictably
- Include a demo site that serves as living documentation, architecture reference, and test surface
- Ship with sensible defaults for SEO, accessibility, performance, and analytics so forked projects start from a strong baseline
- Support multiple deployment targets without requiring changes to core code (see DEPLOYMENT.md)

### Non-Goals

- StellarBoat is not a full CMS or website builder — it's an engineering starting point
- StellarBoat does not include e-commerce functionality (though it shouldn't actively prevent forks from adding it)
- StellarBoat does not abstract away Astro — forks should feel like Astro projects, not a framework-on-top-of-a-framework
- StellarBoat does not aim to support every possible use case — it targets marketing mini-sites specifically

---

## 2. Architecture Principles

### Principle 1: Content-Core Separation

The most important invariant in StellarBoat is that **project-specific content never lives in core framework files**. This enables forked projects to pull upstream improvements to components and layouts with zero or minimal merge conflicts.

The boundary is:

| Layer | Location | Who edits it | Merge-safe? |
|---|---|---|---|
| Core components & layouts | `src/components/`, `src/layouts/` | Core contributors | Yes — only upstream |
| Configuration | `src/config/` | Fork owners | No conflicts expected |
| Content | `src/content/blog/`, `src/content/authors/`, `src/content/pages/` | Fork owners | No conflicts expected |
| Collection schemas | `src/content/config.ts` | Fork owners (additive only) | Low risk — forks may add fields, not remove required ones |
| Brand tokens | `src/styles/tokens.css` | Fork owners | No conflicts expected |
| Demo content | `src/demo/` | Core contributors | Deletable in forks |

> **`src/content/config.ts` caution:** This file defines the Zod schemas that core components depend on. Forks may add optional fields to any schema, but removing or renaming fields that core components reference (`title`, `description`, `publishedAt`, `author`, `tags`) will break those components. Treat required fields as a stable contract.

### Principle 2: Progressive Disclosure

Every feature should have a minimal surface area. The minimum viable fork requires editing only `src/config/site.ts` (site name, URL, social handles), `src/styles/tokens.css` (brand colors and fonts), and replacing `public/favicon.svg`. Everything else — blog, analytics, forms, pricing — is opt-in and pre-wired. A fork can go live in under an hour; deeper customization is available without architectural surgery.

### Principle 3: Agent-Friendly Architecture

StellarBoat is designed to be modified by AI coding agents. This means:
- File responsibilities are explicit and non-overlapping
- Configuration uses TypeScript types with JSDoc comments so agents understand the schema
- All significant decisions are documented in this SPEC
- `src/demo/` demonstrates every pattern so agents can read-before-write

### Principle 4: Static-First, Edge-Enhanced

StellarBoat is built on `output: 'static'` as the canonical rendering mode. Every page must be buildable as a static HTML file. Edge functions are an additive enhancement layer — used for things like geo-based redirects, A/B test cookie assignment, or dynamic OG image generation — but the site must degrade gracefully to the static build if edge functions are unavailable. See DEPLOYMENT.md for platform-specific edge runtime details.

This means:
- No page route requires an adapter to build successfully
- Form submission uses external services or static-compatible backends (not local SSR API routes) by default
- SSR/hybrid mode is explicitly out of scope for core StellarBoat; forks may opt in but receive no first-class support

### Principle 5: Accessibility and Performance First

Core components target WCAG 2.1 AA. Lighthouse scores of 95+ across all categories are a quality gate, enforced in CI.

---

## 3. Technology Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Astro 5.x** | Content Layer API for collections, improved build performance, stable |
| Rendering mode | Static (SSG) + Edge functions | Pure static build; edge layer for dynamic enhancements (see §15) |
| Styling | **Tailwind CSS v4** | CSS-native `@theme` replaces JS config; tokens and utilities unified in one stylesheet |
| Content | **Astro 5 Content Layer API** (MDX) | `defineCollection` now requires a `loader`; `glob()` replaces implicit file scanning; query API unchanged |
| TypeScript | Strict mode | Catches schema mismatches early, improves agent reliability |
| Icons | `astro-icon` + Iconify | Zero runtime, tree-shaken, large icon library |
| Image optimization | Astro `<Image />` | Built-in, AVIF/WebP output, lazy loading |
| Sitemap | `@astrojs/sitemap` | Official integration, zero config |
| RSS | `@astrojs/rss` | Official integration |
| Analytics | **Google Tag Manager** | Single script load; GA4/pixels/etc. configured in GTM dashboard, not in code |
| Forms | Worker-gated pipeline → Google Sheets, per-component endpoint override | See Section 10 |
| Edge runtime | See DEPLOYMENT.md for platform options | See §15 |
| Linting | ESLint + Prettier + `eslint-plugin-astro` | Consistency for contributors and agents |
| Testing | Playwright (e2e) + Vitest (unit) | Tests run in CI against the demo site |
| CI/CD | GitHub Actions (`ci.yml` only) + platform GitHub App | CI for pre-flight checks; platform app for deploy/preview — no workflow overlap |

**Rendering mode:** `output: 'static'` — **locked decision**. The entire site builds to flat HTML/CSS/JS files. Edge functions are deployed alongside static output using the platform's native mechanism and are optional enhancements — the site must function fully without them. SSR/hybrid output is explicitly out of scope for core StellarBoat. See DEPLOYMENT.md for specific platform instructions.

**Astro 5 note:** The Content Layer API changes how collections are *defined*, not how they are *queried*. `getCollection()` and `getEntry()` are unchanged. What changes is that `defineCollection()` now requires a `loader` property — the `glob()` loader replaces the implicit file-system scanning from Astro 4. This means CMS adapters can be added as alternative loaders without changing any component props or page queries. Astro 4's collection definitions (without `loader`) are not forward-compatible; this project requires Astro 5.

---

## 4. Directory Structure

```
stellarboat/
├── .github/
│   └── workflows/
│       └── ci.yml              # pre-flight checks only: lint, type-check, build, Lighthouse
│                               # no deploy step — Cloudflare GitHub App handles all publishing
│
├── public/
│   └── images/                 # static assets (SVG placeholders, hero images, etc.)
│
├── src/
│   │
│   ├── config/                 ← FORK CUSTOMIZATION ZONE
│   │   ├── site.example.ts     # source of truth; edit directly or copy to site.local.ts
│   │   ├── site.ts             # re-exports site.example.ts; alternatively import from site.local.ts
│   │   ├── nav.ts              # navigation structure
│   │   ├── footer.ts           # footer links and legal text
│   │   ├── analytics.ts        # GTM container ID and consent mode flag
│   │   └── forms.ts            # form submission endpoint + Turnstile site key
│   │
│   ├── content/                ← FORK CUSTOMIZATION ZONE
│   │   ├── config.ts           # Astro 5 Content Layer collection definitions
│   │   ├── blog/               # .mdx files for blog posts
│   │   ├── authors/            # .json files for blog authors
│   │   └── pages/              # .mdx files for static pages (about, privacy, etc.)
│   │
│   ├── styles/                 ← FORK CUSTOMIZATION ZONE (tokens.css only)
│   │   ├── tokens.css          # @theme tokens + Tailwind import — FORK EDITS THIS
│   │   ├── global.css          # resets, base element styles — core
│   │   └── prose.css           # MDX content typography — core
│   │
│   ├── components/             ← CORE (don't edit in forks)
│   │   ├── seo/
│   │   │   ├── SEO.astro       # <title>, meta, canonical, robots
│   │   │   ├── JsonLd.astro    # JSON-LD structured data
│   │   │   └── OpenGraph.astro # OG and Twitter card tags
│   │   ├── analytics/
│   │   │   ├── Analytics.astro # GTM snippet + consent defaults; no-op in dev
│   │   │   └── CookieBanner.astro # GDPR consent banner; included when consentMode: true
│   │   ├── forms/
│   │   │   ├── ContactForm.astro       # name, email, message; accepts endpoint prop
│   │   │   ├── LeadCaptureForm.astro   # name, email, company, phone; accepts endpoint prop
│   │   │   ├── NewsletterForm.astro    # email only; accepts endpoint prop
│   │   │   └── FormField.astro         # accessible label + input + error wrapper
│   │   ├── blog/
│   │   │   ├── PostCard.astro
│   │   │   ├── PostList.astro
│   │   │   ├── TagFilter.astro
│   │   │   └── AuthorBio.astro
│   │   ├── layout/
│   │   │   ├── Header.astro    # responsive nav; reads src/config/nav.ts
│   │   │   └── Footer.astro    # reads src/config/footer.ts
│   │   ├── marketing/
│   │   │   ├── Hero.astro
│   │   │   ├── Features.astro
│   │   │   ├── Testimonials.astro
│   │   │   ├── Pricing.astro
│   │   │   ├── FAQ.astro
│   │   │   ├── CTA.astro
│   │   │   └── LogoBar.astro
│   │   ├── mdx/                # enrichment components usable inside MDX posts
│   │   │   ├── Callout.astro
│   │   │   ├── CodeBlock.astro
│   │   │   ├── ImageCaption.astro
│   │   │   └── VideoEmbed.astro
│   │   └── ui/
│   │       ├── Button.astro
│   │       ├── Card.astro
│   │       ├── Badge.astro
│   │       ├── Alert.astro
│   │       ├── Divider.astro
│   │       └── Icon.astro
│   │
│   ├── layouts/                ← CORE
│   │   ├── Base.astro          # HTML shell: <head>, SEO, Analytics, fonts, global CSS
│   │   ├── Page.astro          # Base + Header + Footer
│   │   └── BlogPost.astro      # Page + post header, reading progress, prev/next
│   │
│   ├── pages/                  ← MIXED
│   │   ├── index.astro         # homepage — FORK EDITS THIS
│   │   ├── contact.astro       # contact page — FORK EDITS THIS
│   │   ├── thank-you.astro     # post-form confirmation — FORK EDITS THIS
│   │   ├── 404.astro           # error page — core
│   │   ├── blog/
│   │   │   ├── index.astro     # paginated blog index — core
│   │   │   ├── [...slug].astro # single post (Astro 5 catch-all) — core
│   │   │   └── tag/[tag].astro # tag-filtered list — core
│   │   ├── demo/               # demo routes at /demo/* — gated by features.demo
│   │   │   └── ...             # these files live in src/pages/demo/ (Astro routing requirement)
│   │   ├── robots.txt.ts       # generated robots.txt — core
│   │   └── rss.xml.ts          # RSS feed — core
│   │                           # sitemap.xml is generated by @astrojs/sitemap integration
│   │                           # (configured in astro.config.mjs) — no page file needed
│   │
│   ├── types/                  ← CORE
│   │   ├── config.ts           # SiteConfig, NavConfig, FooterConfig, AnalyticsConfig, FormsConfig
│   │   └── globals.d.ts        # Global type augmentations (Window.dataLayer, Window.gtag)
│   │
│   ├── utils/                  ← CORE
│   │   ├── analytics.ts        # trackEvent() — pushes to window.dataLayer
│   │   ├── blog.ts             # getPublishedPosts(), getReadingTime(), etc.
│   │   └── forms/
│   │       ├── schema.ts       # FormType, FORM_SCHEMAS, validateSubmission() —
│   │       │                   # shared with worker/forms/handler.ts, see below
│   │       └── client.ts       # enhanceForms() — progressive enhancement, Turnstile
│   │
│   └── demo/                   ← DEMO ONLY (safe to delete in production forks)
│       ├── README.md
│       └── DESIGN.md           # visual design spec for Deep Space theme
│                                # (demo pages live in src/pages/demo/ and src/pages/showcase.astro, etc.)
│
├── worker/                     ← CORE — the form submission API (see §10, §15)
│   ├── index.ts                 # entry point; routes /api/forms, falls back to ASSETS
│   ├── tsconfig.json             # separate project: Workers runtime types, not DOM
│   ├── worker-configuration.d.ts # generated by `npm run cf-typegen`
│   └── forms/
│       ├── handler.ts            # the gate pipeline: honeypot → rate limit → schema →
│       │                         # Turnstile → sign → forward to Apps Script
│       │                         # (imports src/utils/forms/schema.ts directly)
│       ├── turnstile.ts          # siteverify call
│       ├── sign.ts               # HMAC-SHA256 envelope signing
│       ├── apps-script.ts        # builds + POSTs the signed envelope
│       ├── respond.ts            # JSON vs. redirect response negotiation
│       └── types.ts              # FormsEnv (Worker bindings + secrets)
│
├── apps-script/                ← CORE — deployed separately, see apps-script/README.md
│   ├── Code.gs                  # doPost(): verify signature, append row, notify
│   ├── appsscript.json          # manifest (web app access, runtime)
│   └── README.md                # setup + redeploy instructions
│
├── tests/
│   ├── e2e/                    # Playwright tests
│   └── unit/                   # Vitest unit tests (app + schema; Worker tests live in worker/)
│
├── astro.config.mjs
├── wrangler.jsonc               # Worker + static assets config (bindings, run_worker_first)
├── tsconfig.json
├── .env.example
├── .dev.vars.example            # Worker secrets template for local `wrangler dev`
├── README.md
├── SPEC.md
├── TASKS.md
├── CONTRIBUTING.md
├── CHANGELOG.md
└── DEPLOYMENT.md               # one-time Cloudflare GitHub App setup + Vercel guide
```

> **Fork configuration pattern:** Edit `src/config/site.example.ts` directly (recommended for simple forks), or copy it to `src/config/site.local.ts`, include it in `.gitignore`, and update `src/config/site.ts` to import from `site.local.ts` instead. All values in `site.example.ts` are safe to commit — API keys and secrets belong in `.env.local`.

---

## 5. Configuration Layer

All site-level configuration is centralized in `src/config/`. Every file exports a typed object. Components import from config — never from hardcoded strings.

### `src/config/site.ts`

```typescript
// src/config/site.ts
// Re-exports from site.example.ts (recommended pattern)
export { siteConfig } from './site.example';

// Alternative pattern for environment-specific config:
// export { siteConfig } from './site.local'; // add to .gitignore
```

All configuration lives in `site.example.ts`. Fork owners may either:
1. **Direct edit (recommended):** Edit `src/config/site.example.ts` directly and commit it
2. **Local override:** Copy `site.example.ts` → `site.local.ts`, add `site.local.ts` to `.gitignore`, and import from `site.local.ts` in `site.ts`

### `src/config/site.example.ts`

```typescript
// src/config/site.example.ts
export const siteConfig = {
  // Site identity
  name: 'My Site',                    // used in <title> and OG tags
  brandName: 'My Brand',              // used in header/footer
  tagline: 'Short tagline',           // used in default meta description
  url: 'https://mysite.com',          // canonical base URL, no trailing slash
  locale: 'en_US',                    // optional; defaults to 'en_US'
  author: 'Author Name',              // blog post metadata
  contactEmail: 'hello@mysite.com',   // contact form destination
  social: {                           // optional social links in footer
    twitter: '@mysite',
    github: null,
  },
  
  // Analytics
  analytics: {
    gtmId: null,                      // set to 'GTM-XXXXXXX'; null disables
    consentMode: false,               // set true for GDPR cookie banner
    customAttributes: {},             // optional GTM custom attributes
  },
  
  // Forms
  forms: {
    endpoint: '/api/forms',           // handled by worker/ in this repo
    turnstileSiteKey: undefined,      // from https://dash.cloudflare.com → Turnstile
  },
  
  // Features
  features: {
    blog: true,                       // enable /blog/ routes and RSS
    rss: true,                        // enable /rss.xml (only meaningful when blog: true)
    demo: true,                       // enable /demo/* demo pages
    pricing: false,                   // enable /pricing page
    testimonials: true,               // enable Testimonials component
  },
} satisfies SiteConfig;
```

### `src/config/nav.ts`

```typescript
export const nav: NavConfig = {
  items: [
    { label: 'Features', href: '/#features' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  cta: { label: 'Get Started', href: '/contact' },
};
```

### Type Definitions

All config types are defined in `src/types/config.ts` and exported for use by components and by forks that extend the config.

---

## 6. Content System

**Confirmed: Astro 5 Content Layer API with MDX/Markdown files in-repo.** All content is co-located with the codebase, type-safe at build time, and requires no external services. A headless CMS integration is deferred to post-v1; the `loader` pattern in Astro 5's Content Layer API makes this a non-breaking future addition — a CMS loader can replace the default glob loader without touching component props or page queries.

### Astro 5 Content Layer API

The Content Layer API changes how collections are *defined*. `defineCollection()` and `getCollection()` still exist — what changes is that `defineCollection()` now requires a `loader` property. Collections are defined in `src/content/config.ts` using `defineCollection` with a `loader` and a `schema`:

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    // ...
  }),
});

export const collections = { blog, authors, pages };
```

Pages query collections using `getCollection()` and `getEntry()`, which are unchanged from Astro 4. The query API is backward-compatible. What requires updating when migrating from Astro 4 is the *definition* in `src/content/config.ts` — each collection must add a `loader`. Run `astro sync` after updating to regenerate types.

**Astro 4 is not supported.** The `loader` property is required; Astro 4 collection definitions will cause a build error.

### Blog Posts (`src/content/blog/`)

MDX files. Frontmatter schema:

```typescript
const blogSchema = z.object({
  title: z.string(),
  description: z.string().max(160),          // for meta description
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  author: z.string(),                         // references authors collection
  tags: z.array(z.string()).default([]),
  image: z.object({
    src: z.string(),
    alt: z.string(),
  }).optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  canonicalUrl: z.string().url().optional(),  // for cross-posts
});
```

Draft posts are excluded from production builds. Featured posts surface in the blog index hero.

### Authors (`src/content/authors/`)

JSON files. One file per author:

```json
{
  "name": "Jane Smith",
  "bio": "Short bio under 200 characters.",
  "avatar": "/authors/jane.jpg",
  "twitter": "janesmith",
  "website": "https://janesmith.com"
}
```

### Static Pages (`src/content/pages/`)

MDX files for content-heavy pages like About, Privacy Policy, Terms. Frontmatter:

```typescript
const pageSchema = z.object({
  title: z.string(),
  description: z.string().max(160),
  noIndex: z.boolean().default(false),  // set true for legal pages
  updatedAt: z.coerce.date().optional(),
});
```

---

## 7. Theming & Design Tokens

**Tailwind CSS v4 changes the token model fundamentally.** There is no `tailwind.config.js` for theme customization in v4. Instead, design tokens are declared directly in CSS using the `@theme` directive, and Tailwind generates utility classes from them automatically. This means the token file and the Tailwind configuration are **the same file** — `src/styles/tokens.css`.

This simplifies the fork customization surface: edit one CSS file to rebrand the entire site.

### Token File Structure (`src/styles/tokens.css`)

Tailwind v4's `@theme` requires **static values only** — CSS `var()` references inside `@theme` do not generate working utility classes. The correct pattern is:

- Define the **primitive scale** (raw hex values) inside `@theme` — this generates all scale utilities like `bg-primary-500`
- Define **semantic aliases** in `@layer base` as regular CSS custom properties that reference the scale — these are available as CSS variables at runtime but don't generate their own utilities

Components use scale utilities directly (e.g., `bg-primary-500`) or reference semantic variables in `@apply` and inline styles. This is the idiomatic Tailwind v4 approach.

```css
/* src/styles/tokens.css */

@import "tailwindcss";

@theme {
  /* ─── Primitive color scale — generates bg-*, text-*, border-* utilities ── */
  --color-primary-50:  #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-900: #1e3a8a;

  --color-neutral-50:  #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-500: #6b7280;
  --color-neutral-900: #111827;

  /* ─── Typography ─────────────────────────────────────────────────────────── */
  --font-sans:    'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* ─── Radius ─────────────────────────────────────────────────────────────── */
  --radius-sm:   0.25rem;
  --radius-md:   0.5rem;
  --radius-lg:   1rem;
  --radius-full: 9999px;

  /* ─── Shadows ────────────────────────────────────────────────────────────── */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* ─── Semantic aliases — CSS variables only, not Tailwind utilities ───────── */
/* Components reference these via inline styles or var() in @apply blocks.    */
/* These are the fork's primary brand customization surface.                  */
@layer base {
  :root {
    --color-bg:          #f9fafb;   /* neutral-50 */
    --color-surface:     #ffffff;
    --color-text:        #111827;   /* neutral-900 */
    --color-text-muted:  #6b7280;   /* neutral-500 */
    --color-border:      #e5e7eb;   /* neutral-200 */
    --color-accent:      #3b82f6;   /* primary-500 */
    --color-accent-dark: #2563eb;   /* primary-600 — hover/active */

    --spacing-section:   5rem;
    --spacing-container: 1.5rem;
    --width-container:   72rem;
  }

  /* OS-level dark mode — automatic, no JS required */
  @media (prefers-color-scheme: dark) {
    :root {
      --color-bg:         #0f172a;
      --color-surface:    #1e293b;
      --color-text:       #f1f5f9;
      --color-text-muted: #94a3b8;
      --color-border:     #334155;
      --color-accent:     #60a5fa;   /* primary-400 — lighter on dark backgrounds */
      --color-accent-dark: #3b82f6;
    }
  }
}
```

> **Dark mode toggle (deferred to post-v1):** The `[data-theme="dark"]` selector approach for a user-controlled toggle is intentionally omitted from v1. Adding a JS-driven toggle on top of a `prefers-color-scheme` media query requires careful specificity management to avoid conflicts. The infrastructure is in place; the toggle component is a post-v1 addition.

### How Tailwind Utilities Map to Tokens

Scale values declared in `@theme` generate standard Tailwind utilities:

| Token | Generated utilities |
|---|---|
| `--color-primary-500` | `bg-primary-500`, `text-primary-500`, `border-primary-500`, `ring-primary-500` |
| `--color-neutral-900` | `bg-neutral-900`, `text-neutral-900`, etc. |
| `--font-sans` | `font-sans` |
| `--radius-lg` | `rounded-lg` |
| `--shadow-md` | `shadow-md` |

Semantic aliases (`--color-accent`, `--color-bg`, etc.) are available as CSS variables for use in component `style` attributes and `@apply` expressions, but do not independently generate utility classes. When a fork changes `--color-accent`, every component referencing it via `var(--color-accent)` updates automatically.

### Fork Rebrand Checklist

To fully rebrand, edit only `src/styles/tokens.css`:

1. Replace the `--color-primary-*` scale values in `@theme` with the brand's color scale
2. Update semantic aliases in `@layer base` — point `--color-accent` and `--color-accent-dark` to the new scale values
3. Replace `--font-sans` and `--font-heading` in `@theme` with the brand's typefaces (install via `@fontsource` if self-hosting)
4. Update dark mode overrides in the `@media (prefers-color-scheme: dark)` block

---

## 8. SEO System

The SEO system is handled entirely by core components and requires zero per-fork code. Forked projects control SEO through content frontmatter and `src/config/site.ts`.

### `<SEO>` Component (`src/components/seo/SEO.astro`)

Included in `Base.astro`. Accepts props that override site defaults:

```astro
<SEO
  title="Post title"
  description="Post description"
  image="/blog/post-og.png"
  canonicalUrl="https://mysite.com/blog/post"
  noIndex={false}
/>
```

Outputs: `<title>`, `<meta name="description">`, `<link rel="canonical">`, all OG tags, all Twitter card tags, and `<meta name="robots">`.

### `<JsonLd>` Component (`src/components/seo/JsonLd.astro`)

Injects JSON-LD structured data. Supports types: `WebSite`, `WebPage`, `BlogPosting`, `Organization`, `BreadcrumbList`. Each layout injects the appropriate type automatically.

### Sitemap

`@astrojs/sitemap` is configured as an Astro integration in `astro.config.mjs` — it generates `sitemap.xml` automatically at build time without a page endpoint file. Feature-flagged routes and demo routes are excluded via the integration's `filter` option. There is no `src/pages/sitemap.xml.ts` file.

```javascript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/demo/') &&
        !page.includes('/thank-you'), // exclude utility pages as needed
    }),
  ],
});
```

### Robots.txt

Generated from `src/pages/robots.txt.ts` using site config. Allows indexing by default; can be set to `Disallow: /` for staging environments via environment variable.

---

## 9. Analytics System

**Google Tag Manager is the single analytics integration point.** StellarBoat loads one GTM container snippet; everything else — GA4, conversion pixels, Hotjar, LinkedIn Insight, consent mode — is configured inside the GTM dashboard by the fork owner. This is a deliberate separation of concerns: the codebase is not responsible for what tags run, only for loading the container reliably and exposing a consent hook.

This replaces the previous multi-provider adapter pattern. The analytics component tree simplifies to two files.

### Architecture

```
src/components/analytics/
├── Analytics.astro      ← renders GTM snippet + optional dataLayer consent init
└── CookieBanner.astro   ← optional consent banner; calls gtag('consent', 'update', ...)
```

`Analytics.astro` is included once in `Base.astro` and renders nothing in non-production builds (`import.meta.env.PROD === false`).

### GTM Implementation

`Analytics.astro` is included in `Base.astro` in two places: the `<head>` (for the GTM script and optional consent init), and a named slot at the start of `<body>` (for the GTM `<noscript>` fallback, which Google requires immediately after `<body>`).

```jsx
---
// src/components/analytics/Analytics.astro
import { analytics } from '../../config/analytics';
const { gtmId, consentMode } = analytics;
---

{gtmId && import.meta.env.PROD && (
  <>
    {/* Consent mode defaults — must fire before GTM script loads */}
    {consentMode && (
      <script>
        window.dataLayer = window.dataLayer || [];
        var payload = {};
        payload.event = 'consent';
        payload.analytics_storage = 'denied';
        payload.ad_storage = 'denied';
        payload.ad_user_data = 'denied';
        payload.ad_personalization = 'denied';
        window.dataLayer.push(payload);
      </script>
    )}
    {/* GTM script — async load from Google CDN */}
    <script async define:vars={{ gtmId }} src={`https://www.googletagmanager.com/gtag/js?id=${gtmId}`}></script>
    <script define:vars={{ gtmId }}>
      window.dataLayer = window.dataLayer || [];
      var config = {};
      config.gtmId = gtmId;
      window.dataLayer.push(config);
    </script>
  </>
)}
```

The `<noscript>` iframe is rendered separately in `Base.astro`'s body slot:

```jsx
<!-- In Base.astro, immediately after <body> -->
{analytics.gtmId && import.meta.env.PROD && (
  <noscript>
    <iframe src={`https://www.googletagmanager.com/ns.html?id=${analytics.gtmId}`}
      height="0" width="0" style="display:none;visibility:hidden"></iframe>
  </noscript>
)}
```

`Analytics.astro` renders nothing in dev (`import.meta.env.PROD === false`). If `gtmId` is null or empty, both render blocks are skipped.

### Config Schema

See `src/config/analytics.ts` in §5. The only two fields are `gtmId` and `consentMode`.

### Consent Mode

When `consentMode: true`, `Analytics.astro` injects a consent defaults block before the GTM script (as shown above), initializing all storage types to `'denied'`. The `CookieBanner.astro` component, when accepted, calls `gtag('consent', 'update', { analytics_storage: 'granted', ... })`. GTM's built-in consent mode settings then control how GA4 and other tags respond.

`CookieBanner.astro` is included in `Base.astro` when `consentMode: true`. It is opt-in because many US-focused B2B deployments operate legally without a consent wall.

### dataLayer Events

A `trackEvent()` utility pushes to `window.dataLayer` rather than calling `gtag()` directly — this keeps the utility GTM-agnostic and means events work whether or not GA4 is configured in the GTM container.

```typescript
// src/utils/analytics.ts
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...params });
  }
}
```

Form submission, CTA clicks, and outbound links push events via this utility. GTM triggers pick them up and route them to whatever tags are configured.

### What Lives in GTM (not in code)

The following are configured entirely in the GTM dashboard — StellarBoat has no knowledge of them:
- GA4 configuration tag and measurement ID
- Conversion pixels (Meta, Google Ads, LinkedIn)
- Session recording tools (Hotjar, FullStory)
- A/B test platforms that require a script tag
- Any other third-party tags

---

## 10. Forms & Lead Generation

### Backend Decision & Rationale

**Shipped in v1.1: a Worker-gated pipeline to Google Sheets**, replacing the original Web3Forms integration. Rationale:

- **Own the data** — submissions land in a Google Sheet you control, not a third party's inbox/dashboard
- **Real spam gating** — a honeypot field, Cloudflare Turnstile, and Worker-side rate limiting all run before anything is written, none of which a third-party form backend can offer for free
- **Zero additional hosting** — the gate is a Cloudflare Worker (already the deploy target — see §15), and the write-side is a free Google Apps Script web app; no new paid service
- **Still swap-friendly** — every form POSTs JSON to one configurable `endpoint`; changing where submissions go is a Worker-side change, not a per-component one

**Trade-off:** unlike Web3Forms, this requires the fork owner to do a one-time setup (a Turnstile widget, an Apps Script deployment, three Worker secrets) rather than pasting a single API key. See DEPLOYMENT.md#form-worker and `apps-script/README.md`.

### Form Components

Three form components cover the primary use cases:

- **`ContactForm.astro`** — name, email, message; general contact
- **`LeadCaptureForm.astro`** — name, email, optional company and phone; lead generation
- **`NewsletterForm.astro`** — email only; newsletter signup

All forms render a native HTML `<form>` that POSTs to the same endpoint with or without JavaScript. **Spam verification (Turnstile) requires JavaScript**, so a no-JS submission is redirected to a plain "please enable JavaScript" page rather than silently accepted — see "No-JS Behavior" below. When JS is available, forms upgrade to JSON submission with inline validation, a loading state, and accessible success/error messaging — without a page reload.

### Submission Pipeline

Every form shares one client module (`src/utils/forms/client.ts`, `enhanceForms()`) and one shared validation schema (`src/utils/forms/schema.ts`) — the same schema the Worker re-validates against, so client and server can never disagree about what's a valid submission. Multiple form instances on one page (e.g. `/forms`) are each wired independently by a `data-stellar-form` attribute, so field IDs never collide and no submit handler double-fires.

```
Browser → POST /api/forms (JSON) → Worker (worker/forms/handler.ts)
  1. Honeypot check          → fake success, nothing written, if filled
  2. Rate limit (per IP)      → 429 if exceeded
  3. Schema validation        → 400 + field errors if invalid
  4. Turnstile verification   → 403 if missing/invalid/wrong hostname
  5. HMAC-signed envelope     → forwarded to the Apps Script web app
Apps Script → verifies signature + replay window → appends a row → emails a notification
```

See ARCHITECTURE.md#form-submission-flow for the full pipeline including status codes, and `apps-script/README.md` for the Sheet side.

### Endpoint Configuration & Per-Component Override

The global `forms.endpoint` in `src/config/forms.ts` sets the site-wide submission endpoint (default `/api/forms`, handled by the Worker in this repo). **Each form component accepts an optional `endpoint` prop that overrides the global config for that instance** — the mechanism for pointing one form at a different Worker deployment (e.g. staging):

```astro
<!-- Uses the global endpoint -->
<ContactForm />

<!-- Override for this instance only -->
<LeadCaptureForm endpoint="https://staging.example.com/api/forms" />

<!-- Prefix field ids to avoid collisions when rendering two of the
     same form type on one page -->
<ContactForm idPrefix="footer-contact" />
```

```typescript
// src/config/forms.ts
export const forms: FormsConfig = {
  endpoint: '/api/forms',
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY,
};
```

### No-JS Behavior

Turnstile cannot run without a browser executing JavaScript, so a submission with no token is treated as "JavaScript is required," not silently accepted or silently dropped:

- **JS client** (`Accept: application/json`) gets `{ ok: false, error: '...' }` — the enhanced form never reaches this state in practice, since it always waits for a token before submitting.
- **Native POST** (no `Accept: application/json`) gets a `303` redirect to `/form-error?reason=js`, which explains that JavaScript is required and links back to the form.

### Extending the Pipeline

The Worker is the single place a fork adds another destination (e.g. also posting to a CRM webhook) — see `worker/forms/handler.ts`. Client components never talk to anything but the one `endpoint`; there is no per-component backend/adapter selection to extend.

### Accessibility

All form fields use `<label>` with `for` attributes. Error messages are injected into `role="alert"` / `aria-live="polite"` containers. Required fields have both `aria-required="true"` and the native `required` attribute. The submit button sets `aria-busy="true"` and is disabled during async submission to prevent double-submits. All error states are keyboard-navigable. The honeypot field is visually and programmatically hidden (`aria-hidden`, off-screen positioning, `tabindex="-1"`) so it's invisible to assistive technology and never trips accidental submission by a sighted keyboard user.

---

## 11. Blog System

### Routing

| Route | Description |
|---|---|
| `/blog` | Paginated blog index |
| `/blog/[...slug]` | Single post (Astro 5 catch-all route) |
| `/blog/tag/[tag]` | Posts filtered by tag |
| `/rss.xml` | RSS feed |

### Features

- Reading time estimate (calculated at build time from word count)
- Previous/next post navigation
- Tag system — tags are derived from frontmatter; no manual tag registry needed
- Author bio with avatar (optional — degrades gracefully if no author frontmatter)
- Draft posts — excluded from build in production, accessible in dev
- Featured posts — surfaced at top of blog index

### MDX Support

Blog posts support full MDX — import and use any component within a post. A set of enhanced typography components is available for authors: `<Callout>`, `<CodeBlock>`, `<ImageCaption>`, `<VideoEmbed>`.

---

## 12. Page Architecture

### Layouts

**`Base.astro`** — The HTML shell. Includes `<head>` with SEO, fonts, analytics, and global CSS. All other layouts extend Base.

**`Page.astro`** — Extends Base. Adds `<Header>` (nav) and `<Footer>`. Used for standard pages.

**`BlogPost.astro`** — Extends Page. Adds post header (title, date, author, tags), progress indicator, and previous/next navigation.

**`Landing.astro`** — Extends Base. Full-width, no nav padding. For landing pages where the hero should touch the viewport edge.

### Pages Under Fork Control

`src/pages/index.astro` (homepage) and `src/pages/contact.astro` are intentionally left as thin composition pages that forks edit freely. All other pages in `src/pages/` are core routes that forks should leave unchanged.

### Homepage Composition Pattern

The homepage is built by composing marketing section components:

```astro
---
// src/pages/index.astro — edit freely in your fork
import Page from '../layouts/Page.astro';
import Hero from '../components/marketing/Hero.astro';
import LogoBar from '../components/marketing/LogoBar.astro';
import Features from '../components/marketing/Features.astro';
import Testimonials from '../components/marketing/Testimonials.astro';
import CTA from '../components/marketing/CTA.astro';

// All content comes from config or inline data in this file
const features = [
  { icon: 'rocket', title: 'Fast', description: '...' },
  // ...
];
---

<Page>
  <Hero headline="Your headline" subheadline="..." cta={{ label: 'Start', href: '/contact' }} />
  <LogoBar logos={[...]} />
  <Features items={features} />
  <Testimonials items={[...]} />
  <CTA headline="Ready?" cta={{ label: 'Get started', href: '/contact' }} />
</Page>
```

The content data for these sections lives inline in `index.astro` or is imported from `src/config/`. It does not live inside component files.

---

## 13. Component System

### Component API Conventions

All components:
- Accept a `class` prop for additional Tailwind utilities (spread onto the root element)
- Use `interface Props` (TypeScript) with JSDoc on each prop
- Provide sensible defaults for all optional props
- Are documented with a usage example in their JSDoc block

### Marketing Components

Each marketing section component accepts a `variant` prop for layout variations (e.g., `Hero` supports `centered`, `split-left`, `split-right`). Variant defaults are set at the component level; forks can override per-instance.

### UI Primitives

`src/components/ui/` contains atomic components: `Button`, `Card`, `Badge`, `Alert`, `Divider`, `Icon`. These are styled via tokens and form the building blocks of all other components.

---

## 14. Demo Site

The demo site lives in `src/demo/` (with the architecture spec in `src/demo/DESIGN.md`) and is always present in the main repo. **Forks are encouraged to delete the demo pages** after using them as a reference.

### Purpose

- Living documentation of every component and pattern
- Architecture reference for AI coding agents working on forks
- Test surface for CI (Playwright tests run against demo pages)
- Upstream demo deployed to stellarboat.magill.dev; demo pages are production-quality marketing content

### What the Demo Includes

- `/showcase` — interactive gallery of all marketing section components with all variants
- `/ui` — atomic UI primitives (Button, Card, Badge, Alert, Divider, Icon) and the complete Deep Space design system
- `/forms` — production form components with multiple backend options
- `/blog` — example blog posts (in `src/content/blog/` and `src/content/authors/`)
- `src/demo/DESIGN.md` — full visual design specification for the Deep Space theme

### Demo Pages on the Upstream Site

The upstream StellarBoat demo is the product showcase. Showcase pages are intentionally indexed in the sitemap and meant to be marketing content. The `/showcase`, `/ui`, and `/forms` routes are part of the minimal marketing narrative.

### Deleting Demo Pages in Forks

To remove demo pages from a fork:

1. Delete `src/pages/showcase.astro`
2. Delete `src/pages/ui.astro`
3. Delete `src/pages/forms.astro`
4. Optionally delete `src/demo/` and `src/content/blog/` example posts
5. Update `src/config/site.example.ts`: change `features.demo: true` to `features.demo: false`
6. Update `astro.config.mjs` sitemap filter if desired (restore the excluded routes list)

The `src/demo/` directory (with `DESIGN.md` and edge worker examples) is separate from the pages and can be deleted independently if its architecture guidance is not needed.

---

## 15. Deployment & CI/CD

### Deployment Model

**Deployment and preview publishing are handled by the deployment platform's GitHub App** — no deploy workflow file is needed or used. The GitHub App is configured in the platform dashboard, monitors the connected repository, and triggers builds on push to `main` (production) and on every PR branch (preview). See DEPLOYMENT.md for platform-specific setup.

The only GitHub Actions workflow in the core repo is `ci.yml`, which runs pre-flight quality checks on every pull request. Its job is to catch problems fast and cheaply — before the deployment platform's build picks them up. CI and deployment are fully independent: CI failing does not block the platform build, but a branch protection rule on `main` can enforce that CI passes before merging.

```
.github/workflows/
  ci.yml         ← pre-flight: lint, type-check, build, Lighthouse (PRs only)
                    no deploy step — Cloudflare GitHub App handles all publishing

Cloudflare dashboard (configured once):
  production     ← builds + deploys on push to main
  preview        ← builds + deploys on every PR branch, posts URL to PR
```

### Astro Config & the Worker

Astro itself has **no adapter** — `output: 'static'` in `astro.config.mjs` is the only rendering-mode setting, and `npm run build` always produces a plain `dist/` of static HTML/CSS/JS regardless of target platform.

The form submission API is not generated by Astro at all: `worker/index.ts` is a hand-written Cloudflare Worker, wired directly into `wrangler.jsonc` (`main`, plus an `assets` block serving `dist/`). `assets.run_worker_first: ["/api/*"]` scopes the Worker to API requests only — every other request is served as a static asset without the Worker running. See §10 and DEPLOYMENT.md#form-worker for the pipeline this Worker implements.

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: import.meta.env.PUBLIC_SITE_URL,
  // vite.server.proxy forwards /api/* to `wrangler dev` during `astro dev`
});
```

```jsonc
// wrangler.jsonc
{
  "main": "./worker/index.ts",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "run_worker_first": ["/api/*"],
  },
  "ratelimits": [
    /* FORM_RATE_LIMITER — see §10 */
  ],
}
```

Forks deploying to a platform without a Workers-equivalent runtime (e.g. plain static hosting with no server-side capability) can still ship the static site — only the form endpoint needs a Worker/Function; see DEPLOYMENT.md's "Porting the Form Worker" for Vercel.

### Environment Variables

```bash
# .env.example — copy to .env.local, never commit .env.local
PUBLIC_SITE_URL=https://mysite.com          # canonical base URL, no trailing slash
PUBLIC_GTM_ID=GTM-XXXXXXX                  # GTM container ID — or set in config/analytics.ts
PUBLIC_TURNSTILE_SITE_KEY=your-site-key    # Turnstile site key (public)
```

```bash
# .dev.vars.example — copy to .dev.vars for local `wrangler dev`, never commit .dev.vars
TURNSTILE_SECRET_KEY=...       # Worker secret in production — wrangler secret put
APPS_SCRIPT_URL=...            # Worker secret in production — wrangler secret put
APPS_SCRIPT_HMAC_SECRET=...    # Worker secret in production — wrangler secret put
```

Public/build-time config lives in `.env.example` and is read via `import.meta.env` with fallbacks in the config TypeScript files (safe to commit — these are non-secret public IDs). The Worker's three secrets are request-time, not build-time — they're never bundled into client code and are set with `wrangler secret put` (or `.dev.vars` locally), never as plain `vars` in the committed `wrangler.jsonc`.

### CI Pre-flight (`ci.yml`)

Runs on every pull request. Its purpose is to surface errors before the PR is merged and before Cloudflare's build runs — not to deploy anything.

1. `npm run lint` — ESLint + Prettier check
2. `npm run check` — `astro check` (TypeScript + Astro-specific type errors)
3. `npm run check:worker` — `tsc -p worker` (the Worker has its own tsconfig — Workers runtime types, not DOM)
4. `npm run test:unit` and `npm run test:worker` — Vitest, app and Worker suites (kept separate; see §10 and the Worker's own `vitest.config.ts`)
5. `npm run build` — full production build (static; no adapter)
6. Lighthouse CI against the built `dist/` — `lighthouserc.cjs` uses `@lhci/cli`'s own static server (`staticDistDir`) directly against the built output; use `npm run build && npx wrangler dev` locally instead when testing Cloudflare-specific routing or header behavior

Lighthouse thresholds (hard fail):

| Category | Threshold | Notes |
|---|---|---|
| Performance | ≥ 75 | v0.1 baseline; target 95 after optimization |
| Accessibility | ≥ 90 | v0.1 baseline; target 95 after fixes |
| Best Practices | ≥ 75 | v0.1 baseline; target 90 after optimization |
| SEO | ≥ 65 | v0.1 baseline; target 90 after completeness audit |
| First Contentful Paint | ≤ 1500ms | v0.1 baseline; target 1200ms |
| Largest Contentful Paint | ≤ 14000ms | v0.1 baseline; target 2500ms (requires hero image optimization) |
| Cumulative Layout Shift | ≤ 0.1 | Stable |

**Baseline rationale:** v0.1 ships with these realistic baseline thresholds to allow deployment. Future milestones will include performance optimization to meet the original SPEC §15 targets (perf 95, a11y 95, bp 90, seo 90). Main bottleneck: hero background image LCP (13s → 2.5s target).

**Branch protection:** Set `main` to require `ci.yml` passing before merge. Cloudflare's build then runs automatically once the PR lands — it's the authoritative deploy, not a duplicate of CI.

**No deploy step in `ci.yml`.** Platform-specific CLI tools and deploy logic have no place here. See DEPLOYMENT.md for local testing instructions.

### Rendering Architecture at Deploy Time

```
npm run build
  └── dist/            ← static HTML/CSS/JS — served from Cloudflare's CDN

worker/index.ts         ← deployed separately by Wrangler (main in wrangler.jsonc),
                           not part of the Astro build output; handles /api/* only
```

The static build is complete and functional on its own for every page except form submission — a fork that doesn't need forms can ignore `worker/` and `wrangler.jsonc`'s `main`/`ratelimits` entries entirely and deploy `dist/` to any static host.

### Platform Feature Reference

See DEPLOYMENT.md for a detailed comparison of supported deployment platforms, including static hosting, edge runtime, deployment triggers, preview functionality, and feature parity.

### Edge Function Use Cases (Optional, Beyond Forms)

The only Worker route the core repo implements is `/api/forms` (§10). Everything else stays fully static without any Worker involvement. Forks wanting more server-side behavior extend `worker/index.ts`'s routing rather than introducing a second Worker:

- **Geo-based redirects** — route `/pricing` to locale variants based on `request.cf.country`
- **A/B test cookie assignment** — set a variant cookie at the edge; client JS reads it
- **Dynamic OG images** — generate per-post social card images via Satori
- **Auth-gated pages** — verify a JWT cookie and redirect unauthenticated users
- **Bot detection** — simplified response to known scrapers

Each would add a new route branch in `worker/index.ts` (following the pattern already used for `/api/forms`) and its own `run_worker_first` pattern in `wrangler.jsonc` if it needs to run on paths beyond `/api/*`.

---

## 16. Fork Workflow & Upstream Merging

### Initial Fork Setup

1. Fork or use as GitHub template; clone locally
2. `npm install`
3. Edit `src/config/site.example.ts` — fill in your site name, URL, and contact email; **commit this file** (no secrets)
   - *Alternative:* Copy `site.example.ts` → `site.local.ts`, add `site.local.ts` to `.gitignore`, and update `src/config/site.ts` to import from `site.local.ts` instead
4. Edit `src/styles/tokens.css` — replace the `--color-primary-*` scale and update semantic aliases
5. Add your brand assets: replace `public/images/hero-spacecraft.png`, `public/images/hero-background.png`, and other images with your own
6. Set your GTM container ID in `src/config/analytics.ts` (or leave `gtmId: null` to disable analytics)
7. Set up the form pipeline: create a Turnstile widget and set `PUBLIC_TURNSTILE_SITE_KEY`; deploy `apps-script/` to a Google Sheet (`apps-script/README.md`); set the Worker's three secrets (`DEPLOYMENT.md#form-worker`). Or point `forms.endpoint` in `src/config/forms.ts` at a different backend entirely.
8. Edit `src/pages/index.astro`, `src/pages/contact.astro`, and `src/pages/thank-you.astro` with your content
9. Add content to `src/content/blog/`, `src/content/authors/`, and `src/content/pages/` — or set `features.blog = false` in `site.example.ts`
10. Follow `DEPLOYMENT.md` to connect the repo to Cloudflare Workers (or Vercel) via GitHub App
11. **Optional: Clean up demo pages** — Delete `src/pages/showcase.astro`, `src/pages/ui.astro`, and `src/pages/demo/`. Update `src/config/site.example.ts` to change `features.demo: true` to `features.demo: false`. See **§14. Demo Site** for details.

### Pulling Upstream Updates

```bash
# Add the upstream remote once
git remote add upstream https://github.com/stellarboat/stellarboat.git

# Pull updates
git fetch upstream
git merge upstream/main
```

Because fork-specific content lives in `src/config/`, `src/content/`, `src/styles/tokens.css`, and `src/pages/index.astro` / `src/pages/contact.astro` — and core components never contain content — merge conflicts should be rare or absent on the core component files.

If a fork has modified a core component (e.g., added a new section to `Hero.astro`), the recommended approach is to create a new component (e.g., `src/components/marketing/HeroExtended.astro`) that wraps and extends the core component, rather than editing the core component directly.

---

## 17. Deferred Decisions (Post-v1)

All v1 architectural decisions are now locked (see Decision Log at top of document). The following items are explicitly deferred to a future version and documented here so contributors don't design against them.

**Dark mode toggle** — v1 ships with automatic OS-level dark mode via `@media (prefers-color-scheme: dark)` in `tokens.css`. A user-controlled toggle (setting `data-theme="dark"` on `<html>` and persisting via `localStorage`) is deferred to post-v1. The `@layer base` variables in `tokens.css` are already structured to support a `[data-theme="dark"]` override block when the toggle ships — no token architecture changes will be needed.

**Headless CMS integration** — MDX-in-repo is locked for v1. A CMS adapter layer (Sanity, Contentful, or similar) is the most-requested post-v1 feature. The content collection schemas in `src/content/config.ts` are intentionally designed to be CMS-agnostic — field names and types should mirror what a CMS would export — so the adapter can be a drop-in data source without changing component props.

**i18n / multi-locale** — Not planned for v1. Architecture constraints to avoid i18n lock-out: no hardcoded locale path prefixes, no locale assumptions in URL generation utilities, `site.locale` in config is a single string for now but typed as `string` not a literal union.

**Interactive component primitives** — Core UI components (`Button`, `Card`, etc.) use no JavaScript. For more complex interactive patterns (modals, comboboxes, disclosure/accordions with animation), the recommendation for forks is to layer in shadcn/ui or Radix Primitives independently. Core will not take a dependency on a component library in v1.

**A/B testing framework** — No first-class support. The edge middleware pattern (Section 15) is the right architectural path; a documented example in `src/demo/` is sufficient for v1.

---

*This specification is a living document. It should be updated whenever architectural decisions are made or changed. PR authors adding significant new features should update the relevant section here.*
