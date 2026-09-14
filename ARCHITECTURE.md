# StellarBoat Architecture Guide

This document describes the system architecture, data flow, core modules, and key patterns used in StellarBoat—a modern marketing website built on **Astro 5** with TypeScript, Tailwind CSS, and a zero-runtime-JavaScript approach.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Core Concepts](#core-concepts)
4. [Configuration & Customisation](#configuration--customisation)
5. [Data Flow](#data-flow)
6. [Content Collections](#content-collections)
7. [Component Hierarchy](#component-hierarchy)
8. [Utilities & Adapters](#utilities--adapters)
9. [Feature Flags](#feature-flags)
10. [Analytics Pipeline](#analytics-pipeline)
11. [Form Submission Flow](#form-submission-flow)
12. [Non-Obvious Edge Cases](#non-obvious-edge-cases)
13. [Setup & Development](#setup--development)

---

## System Overview

### Technology Stack

- **Framework**: Astro 5 (static site generator)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with `@theme` block
- **Content**: Astro Content Collections (MDX + JSON)
- **Deployment**: See DEPLOYMENT.md for supported platforms (configured; alternatives available)
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Icons**: Iconify (Heroicons via astro-icon)
- **Fonts**: @fontsource (Inter, JetBrains Mono subsets)

### Key Principles

- **Zero Runtime JavaScript by default** — Pages are pure HTML/CSS until a user interacts (progressive enhancement)
- **Static Generation** — All routes pre-built at deploy time (`output: 'static'`)
- **Type Safety** — Strict TypeScript + comprehensive interfaces for all configs
- **Dark Theme First** — Deep Space theme (neon cyan `#00d9ff`, neon purple `#c000ff` on dark backgrounds)
- **Accessibility First** — Semantic HTML, ARIA labels, skip-to-main links, focus management
- **Content-Driven** — Blog posts, pages, and authors managed as Astro Content Collections with schema validation
- **Fork-Friendly** — Easy to customise via `src/config/site.ts`; all demo/showcase pages can be disabled via feature flags

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ASTRO BUILD PIPELINE                        │
│  (Static generation; all routes pre-built at deploy time)       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SITE CONFIGURATION                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ src/config/site.ts (fork-editable)                       │   │
│  │ ├─ Site metadata (name, url, author, contactEmail)      │   │
│  │ ├─ Analytics config (GTM ID, consent mode)              │   │
│  │ ├─ Forms config (submission endpoint, Turnstile key)   │   │
│  │ └─ Feature flags (blog, rss, demo, pricing, ...)        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT COLLECTIONS                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ src/content/blog/*.mdx      (blog posts with metadata)   │   │
│  │ src/content/authors/*.json  (author profiles)            │   │
│  │ src/content/pages/*.mdx     (static pages)               │   │
│  │                                                          │   │
│  │ → Validated against schema in src/content/config.ts     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    UTILITIES & ADAPTERS                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ src/utils/analytics.ts                                  │   │
│  │ └─ trackEvent() → dataLayer.push() for GTM              │   │
│  │                                                          │   │
│  │ src/utils/blog.ts                                       │   │
│  │ ├─ getPublishedPosts() / getFeaturedPosts()             │   │
│  │ ├─ getPostsByTag() / getAllTags()                       │   │
│  │ ├─ getReadingTime() / getAuthor()                       │   │
│  │ └─ getPrevNextPosts() (navigation)                      │   │
│  │                                                          │   │
│  │ src/utils/forms/                                        │   │
│  │ ├─ schema.ts: validateSubmission() (shared w/ Worker)   │   │
│  │ └─ client.ts: enhanceForms() → JSON POST + Turnstile    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              FORM WORKER (worker/) — /api/* only                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ index.ts → forms/handler.ts                              │   │
│  │ honeypot → rate limit → schema → Turnstile → sign         │   │
│  │      ↓                                                    │   │
│  │ Google Apps Script (apps-script/) → Sheet + email         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        LAYOUTS                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Base.astro                                              │   │
│  │ ├─ HTML skeleton (<!DOCTYPE>, <head>, <body>)           │   │
│  │ ├─ Imports: SEO, OpenGraph, JsonLd, Analytics, Fonts    │   │
│  │ └─ Receives: title, description, image, canonicalUrl    │   │
│  │      ↓                                                   │   │
│  │ Page.astro (extends Base)                               │   │
│  │ ├─ Wraps with: Header + Footer                          │   │
│  │ └─ Auto-generates WebPage JSON-LD schema                │   │
│  │      ↓                                                   │   │
│  │ BlogPost.astro (extends Page)                           │   │
│  │ ├─ Article-specific layout                              │   │
│  │ ├─ AuthorBio, tags, reading time, prev/next nav         │   │
│  │ └─ BlogPosting + BreadcrumbList JSON-LD schemas         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENTS (35 total)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Layout       Header, Footer                             │   │
│  │ Analytics    Analytics (GTM), CookieBanner              │   │
│  │ SEO          SEO, OpenGraph, JsonLd                      │   │
│  │ Forms        ContactForm, LeadCaptureForm, Newsletter    │   │
│  │              FormField (reusable wrapper)                │   │
│  │ UI Primitives Button, Card, Badge, Alert, Divider, Icon │   │
│  │ Marketing    Hero, Features, Testimonials, Pricing, FAQ │   │
│  │              CTA, LogoBar                                │   │
│  │ MDX          Callout, CodeBlock, ImageCaption, VideoEmbed
│  │ Blog         PostCard, PostList, AuthorBio, TagFilter    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        PAGES & ROUTES                           │
│  ├─ index.astro                  (Homepage)                    │
│  ├─ blog/index.astro             (Blog listing)                │
│  ├─ blog/[...slug].astro          (Individual post)            │
│  ├─ blog/tag/[tag].astro          (Tag filter)                 │
│  ├─ contact.astro                (Contact form demo)           │
│  ├─ forms.astro, showcase.astro   (Component showcase)         │
│  ├─ ui.astro                     (Design tokens demo)          │
│  ├─ 404.astro, thank-you.astro    (Utility pages)              │
│  ├─ robots.txt.ts, rss.xml.ts     (Feeds/SEO)                  │
│  └─ demo/* (if features.demo)    (Demo hub + examples)        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   STATIC HTML OUTPUT                            │
│  (Deployed to Cloudflare Workers or any static host)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### 1. Layout Hierarchy

- **Base.astro** → `<html>`, `<head>`, `<body>` skeleton with global utilities (SEO, Analytics)
- **Page.astro** → Wraps Base with `<Header>` + `<Footer>` + optional WebPage schema
- **BlogPost.astro** → Extends Page with article-specific metadata (author, date, tags, reading time, nav)

Each layout is **composable**: you only include the features you need.

### 2. Progressive Enhancement

Every form renders a **native HTML `<form>`** that POSTs to the same Worker endpoint with or without JavaScript. When JavaScript loads, it upgrades to **JSON submission with client-side validation** for better UX.

This means:

- Spam verification (Cloudflare Turnstile) requires JavaScript to run, so a no-JS submission is redirected to a "please enable JavaScript" page rather than silently accepted or silently dropped — see "Non-Obvious Edge Cases" below
- Users with JavaScript disabled see a clear, actionable message instead of a form that appears to work but never delivers
- Validation errors appear inline (when JS loaded); the Worker re-validates every field server-side regardless

### 3. Zero Runtime JavaScript by Default

Astro ships **zero client-side JavaScript by default**. Only interactive components (like the mobile menu hamburger, form validation, analytics tracking) include `<script>` blocks or use `client:*` directives.

### 4. Theme System

The Deep Space theme is defined in `src/styles/tokens.css` via a Tailwind `@theme` block:

- **Primary** (cyan): 9-step scale (#00d9ff, #00c9e0, etc.)
- **Secondary** (purple): 9-step scale (#c000ff, #b000e8, etc.)
- **Neutral** (dark blues): for backgrounds, borders, text
- **Semantic**: success (#22c55e), warning (#f59e0b), error (#ef4444), info (#3b82f6)
- **Typography**: Inter (body), JetBrains Mono (code)

All components use Tailwind utility classes; no CSS-in-JS or scoped styles.

---

## Configuration & Customisation

### Fork Pattern: `src/config/site.ts`

The `site.ts` file is your **fork point**. It re-exports from `site.example.ts`:

```typescript
// src/config/site.ts
export { siteConfig } from './site.example';

// To customise for your fork:
// Copy src/config/site.example.ts → src/config/site.ts
// Edit the copy; commit to version control
```

**All configs import from `siteConfig`**:

```typescript
import { siteConfig } from '@/config/site';

const { name, url, author } = siteConfig;
const { blog, rss, demo } = siteConfig.features;
const { gtmId } = siteConfig.analytics;
```

### Configuration Files

| File                        | Purpose                            | Edit to Customise                         |
| --------------------------- | ---------------------------------- | ----------------------------------------- |
| `src/config/site.ts` (fork) | Site identity, analytics, features | Name, URL, analytics ID, feature flags    |
| `src/config/nav.ts`         | Header navigation                  | Menu items, links, demo flag              |
| `src/config/footer.ts`      | Footer content                     | Copyright year, nav columns, social links |
| `src/config/analytics.ts`   | Google Tag Manager + consent       | GTM ID, consent mode, custom attributes   |
| `src/config/forms.ts`       | Form submission                    | Endpoint URL, Turnstile site key          |

### Type Definitions

All configs are **strongly typed** in `src/types/config.ts`:

```typescript
interface SiteConfig {
  name: string;
  url: string;
  author: string;
  contactEmail: string;
  analytics: AnalyticsConfig;
  forms: FormsConfig;
  features: {
    blog: boolean;
    rss: boolean;
    demo: boolean;
    pricing: boolean;
    testimonials: boolean;
  };
}
```

TypeScript will error at build time if you provide an invalid config value.

---

## Data Flow

### 1. Configuration → Utils → Components → Pages

```
siteConfig (src/config/site.ts)
    ↓
used by utilities (src/utils/analytics.ts, src/utils/blog.ts, src/utils/forms/client.ts)
    ↓
components receive data (postCard.astro receives post + author)
    ↓
pages compose components (blog/[...slug].astro uses BlogPost layout + components)
```

### 2. Blog Post Rendering (End-to-End Example)

**User navigates to `/blog/getting-started-astro-5`:**

1. **Route**: `src/pages/blog/[...slug].astro` matches the URL
2. **Get Post Data**:
   ```typescript
   const { slug } = Astro.params;
   const post = await getEntryBySlug('blog', slug);
   ```
   This reads from `src/content/blog/getting-started-astro-5.mdx`
3. **Render Author Bio**:
   ```typescript
   const author = await getAuthor(post.data.author);
   ```
   Dynamically imports `src/content/authors/{author-name}.json`
4. **Build Navigation**:
   ```typescript
   const [prevPost, nextPost] = await getPrevNextPosts(post);
   ```
   Queries all published posts to find adjacent ones
5. **Compute Reading Time**:
   ```typescript
   const readingTime = getReadingTime(post.body);
   ```
   Word count ÷ 200 words/minute
6. **Render Layout**:
   ```astro
   <BlogPost layout props={{ title, author, tags, readingTime }}>
     {/* MDX content auto-enhances with Callout, CodeBlock, etc. */}
   </BlogPost>
   ```
7. **Output**: Static HTML file `dist/blog/getting-started-astro-5/index.html`

---

## Content Collections

### Schema Definition

All collections are defined in `src/content/config.ts` with **Astro Content Collections** schema validation:

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.date(),
    author: z.string(), // File name of author JSON
    tags: z.array(z.string()),
    image: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    canonicalUrl: z.string().optional(),
    updatedAt: z.date().optional(),
  }),
});
```

### Collections

#### **blog** (`src/content/blog/*.mdx`)

- **Format**: MDX (Markdown + JSX)
- **Frontmatter**: YAML-style metadata (title, description, publishedAt, author, tags, etc.)
- **Content**: Markdown with embedded JSX components (Callout, CodeBlock, VideoEmbed, etc.)
- **Usage**: Blog posts with author bios, tags, reading time, RSS feed

**Example**:

```mdx
---
title: Getting Started with Astro 5
description: A comprehensive guide to building with Astro.
publishedAt: 2025-01-15
author: sarah-chen
tags: ['astro', 'beginner', 'tutorial']
draft: false
---

# Getting Started

Your markdown content here...
```

#### **authors** (`src/content/authors/*.json`)

- **Format**: JSON
- **Fields**: name, bio, avatar (URL), twitter, website
- **Usage**: Dynamically loaded by `getAuthor()` utility; rendered in AuthorBio component

**Example**:

```json
{
  "name": "Sarah Chen",
  "bio": "Full-stack engineer and Astro enthusiast.",
  "avatar": "https://example.com/sarah.jpg",
  "twitter": "https://twitter.com/sarahchen",
  "website": "https://sarahchen.com"
}
```

#### **pages** (`src/content/pages/*.mdx`)

- **Format**: MDX (Markdown + JSX)
- **Fields**: title, description, noIndex (optional), updatedAt (optional)
- **Usage**: Static pages like About, Privacy Policy, etc.
- **Example**: `src/content/pages/about.mdx` rendered on `demo/content-page.astro`

### Building Queries

Query utilities in `src/utils/blog.ts`:

```typescript
// Get all published posts (excludes drafts)
const posts = await getPublishedPosts();

// Get featured posts only
const featured = await getFeaturedPosts();

// Get posts by tag
const tagPosts = await getPostsByTag('astro');

// Get unique tags across all posts
const tags = await getAllTags();

// Calculate reading time (minutes)
const minutes = getReadingTime(postBody);

// Get author profile
const author = await getAuthor('sarah-chen');

// Get prev/next post for navigation
const [prev, next] = await getPrevNextPosts(currentPost);
```

All queries are **static** — they run at build time, not on every page load.

---

## Component Hierarchy

### UI Primitives (Layout Building Blocks)

| Component   | Props                                | Variants                                               | Usage                                         |
| ----------- | ------------------------------------ | ------------------------------------------------------ | --------------------------------------------- |
| **Button**  | href, variant, size, disabled        | primary / secondary / ghost; sm / md / lg              | CTAs, form submit, navigation                 |
| **Card**    | variant                              | default / raised                                       | Content containers with optional shadow       |
| **Badge**   | variant                              | primary / secondary / success / warning / error / info | Labels, tags, status indicators               |
| **Alert**   | variant, icon                        | info / success / warning / error                       | Contextual messages (role="alert" for errors) |
| **Icon**    | name, class, aria-label, aria-hidden | (Iconify name, e.g., "heroicons:rocket")               | Decorative or meaningful icons                |
| **Divider** | (none)                               | Horizontal line                                        | Visual separation                             |

### Marketing Components (Data-Driven Sections)

| Component        | Props                                      | Variants                              |
| ---------------- | ------------------------------------------ | ------------------------------------- |
| **Hero**         | headline, subheadline, ctaButtons, variant | centered / split-left / split-right   |
| **Features**     | title, items, variant                      | grid-3 / grid-2 / list                |
| **Testimonials** | items, variant                             | cards / carousel                      |
| **Pricing**      | plans, highlightPlanId                     | Pricing table with featured plan      |
| **FAQ**          | items                                      | Accordion with expand/collapse        |
| **CTA**          | headline, subtext, buttons                 | Full-width call-to-action band        |
| **LogoBar**      | logos, links                               | Logo grid with optional hover effects |

### Form Components

| Component           | Props                                                                            | Purpose                                                      |
| ------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **FormField**       | id, name?, label, type, required?, placeholder?, autocomplete?, pattern?, class? | Reusable input/textarea/select wrapper (name defaults to id) |
| **ContactForm**     | endpoint?, turnstileSiteKey?, idPrefix?, class?                                  | 3-field contact form (name, email, message)                  |
| **LeadCaptureForm** | endpoint?, turnstileSiteKey?, idPrefix?, class?                                  | 4-field lead form (name, email, company, phone)              |
| **NewsletterForm**  | endpoint?, turnstileSiteKey?, idPrefix?, class?, compact?                        | Email-only newsletter signup                                 |

All three form components share `src/utils/forms/client.ts`'s `enhanceForms()` for their behavior:

- **HTML5 validation** (required, email, tel attributes) plus a shared TypeScript schema (`src/utils/forms/schema.ts`) re-run before every submit
- **Cloudflare Turnstile** verification, lazy-loaded on first interaction with the form
- **Error display** via FormField error containers, matched to the server's field-level errors
- **Progressive enhancement** — the native `<form>` POSTs to the same endpoint either way; see "Progressive Enhancement" above for the no-JS behavior
- **`idPrefix`** (defaults to the form type, e.g. `"contact"`) keeps field ids collision-free when two form instances share a page

### Blog Components

| Component     | Props            | Purpose                                                     |
| ------------- | ---------------- | ----------------------------------------------------------- |
| **PostCard**  | post             | Renders post title, date, author, tags, reading time, image |
| **PostList**  | posts, featured  | Grid of PostCards with optional featured slot               |
| **AuthorBio** | authorName       | Avatar, bio, social links (async)                           |
| **TagFilter** | tags, activeTags | Interactive tag pills with active state                     |

### MDX Enhancement Components

| Component        | Props                    | Purpose                                            |
| ---------------- | ------------------------ | -------------------------------------------------- |
| **Callout**      | type, title              | info / warning / tip / danger boxes with icons     |
| **CodeBlock**    | filename, code, language | Syntax highlighting + copy button                  |
| **ImageCaption** | src, alt, caption        | `<figure>` + `<figcaption>` with lazy loading      |
| **VideoEmbed**   | src, title               | Responsive iframe (aspect-video) for YouTube/Vimeo |

### SEO Components

| Component     | Props                                               | Purpose                                                      |
| ------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| **SEO**       | title, description, canonicalUrl, robots, noIndex   | Meta tags (title, description, canonical, robots)            |
| **OpenGraph** | title, description, image, type, url, twitterHandle | OG tags + Twitter Card                                       |
| **JsonLd**    | schemas                                             | Inlines JSON-LD structured data (WebPage, BlogPosting, etc.) |

---

## Utilities & Adapters

### Analytics Utility

**File**: `src/utils/analytics.ts`

```typescript
export function trackEvent(name: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') return; // SSR safe
  if (!Array.isArray(window.dataLayer)) return; // No GTM loaded

  window.dataLayer.push({
    event: name,
    ...params,
  });
}
```

**Usage**:

```astro
<script>
  import { trackEvent } from '@/utils/analytics';

  trackEvent('contact_form_submit', {
    form_type: 'contact',
    timestamp: new Date().toISOString(),
  });
</script>
```

**Only active in production** (`import.meta.env.PROD`). Consent mode defaults respect GDPR/CCPA.

### Blog Utility

**File**: `src/utils/blog.ts`

All queries run at **build time** (static generation):

```typescript
// Get published posts (excludes drafts in production)
export async function getPublishedPosts(
  includeDrafts = !import.meta.env.PROD
): Promise<BlogPost[]> {
  const allPosts = await getCollection('blog');
  return allPosts
    .filter((post) => includeDrafts || !post.data.draft)
    .sort(
      (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
    );
}

// Calculate reading time (200 words/minute)
export function getReadingTime(body: string): number {
  const WORDS_PER_MINUTE = 200;
  const words = body.split(/\s+/).length;
  return Math.ceil(words / WORDS_PER_MINUTE);
}

// Dynamically import author JSON
export async function getAuthor(authorId: string): Promise<Author | null> {
  try {
    const author = await import(`../content/authors/${authorId}.json`);
    return author.default;
  } catch {
    return null; // Author not found
  }
}
```

### Form Submission Schema (shared client/Worker)

**File**: `src/utils/forms/schema.ts` — pure TypeScript, no Astro/DOM/Worker imports, so it can be imported by both the browser bundle and `worker/forms/handler.ts` without either side pulling in the other's runtime.

```typescript
export type FormType = 'contact' | 'lead' | 'newsletter';

export function validateSubmission(
  formType: unknown,
  raw: Record<string, unknown>
):
  | { ok: true; data: Record<string, string> }
  | { ok: false; fieldErrors: Record<string, string> };
```

`FORM_SCHEMAS` defines required/optional fields, min/max lengths, and per-kind checks (email, phone) for each `FormType`. Client and Worker call the exact same function, so they can never disagree about what's valid.

### Client Enhancement

**File**: `src/utils/forms/client.ts`

```typescript
export function enhanceForms(): void;
```

Each form component's own `<script>` block calls `enhanceForms()`, which finds every `form[data-stellar-form]` on the page and wires each independently (a `data-stellar-enhanced` flag makes repeated calls — one per form component instance on a page like `/forms` — a no-op past the first). Per form, it:

1. Lazily loads the Cloudflare Turnstile script on first `focusin` (keeps it off the critical render path)
2. Runs `validateSubmission()` on submit; renders field-level errors inline if it fails
3. Requests a Turnstile token (`execution: 'execute'`, triggered manually — not auto-run)
4. POSTs `{ formType, fields, turnstileToken }` as JSON to the form's `action` with `Accept: application/json`
5. Renders the JSON response's success/error state into the form's `[data-form-messages]` container

### Form Worker

**File**: `worker/forms/handler.ts` — see the "Form Submission Flow" section below for the full request pipeline and status codes. In brief: honeypot → rate limit → `validateSubmission()` (same schema as above) → Turnstile `siteverify` → HMAC-sign an envelope → POST it to the Apps Script web app in `apps-script/`.

---

## Feature Flags

All optional features are controlled via `siteConfig.features`:

```typescript
const { blog, rss, demo, pricing, testimonials } = siteConfig.features;
```

| Flag           | Controls                         | Default | Notes                                                                          |
| -------------- | -------------------------------- | ------- | ------------------------------------------------------------------------------ |
| `blog`         | Blog routes + RSS feed           | `true`  | Disables `/blog/*` pages entirely (no static paths generated)                  |
| `rss`          | RSS XML feed                     | `true`  | Requires `blog: true`; independent of Pricing.astro rendering                  |
| `demo`         | Demo pages (showcase, ui, forms) | `true`  | Disables `/demo/*` routes and demo hub                                         |
| `pricing`      | (Unused)                         | `false` | Defined but not checked in code; Pricing.astro always renders if imported      |
| `testimonials` | (Unused)                         | `true`  | Defined but not checked in code; Testimonials.astro always renders if imported |

**Implementation Example** (Blog Page):

```astro
---
const { blog } = siteConfig.features;

if (!blog) {
  return new Response(null, { status: 404 });
}

const posts = await getPublishedPosts();
---
```

If `blog: false`, the `/blog/*` routes return 404 and are not generated at build time.

---

## Analytics Pipeline

### Google Tag Manager (GTM) Integration

**Config** (`src/config/analytics.ts`):

```typescript
export const analytics = {
  gtmId: 'GTM-XXXXXX', // Set via PUBLIC_GTM_ID environment variable
  consentMode: 'explicit', // GDPR/CCPA compliance
  customAttributes: {
    page_type: 'landing_page',
    // ...custom dimensions
  },
};
```

### Flow

1. **Analytics Component** (`src/components/analytics/Analytics.astro`):
   - Only loads GTM script in production (`import.meta.env.PROD`)
   - Injects Google Tag Manager script (`gtag.js`)
   - Sets consent mode defaults (all categories set to "denied" initially)

2. **Cookie Banner** (`src/components/analytics/CookieBanner.astro`):
   - Accept button: calls `gtag('consent', 'update', { analytics_storage: 'granted' })`
   - Decline button: keeps consent as "denied"
   - Stores choice in `localStorage` as `analytics-consent`

3. **Event Tracking** (`src/utils/analytics.ts`):
   ```typescript
   trackEvent('form_submit', { form_type: 'contact' });
   // Pushes to window.dataLayer[]; GTM processes and sends to GA4
   ```

### Consent Mode

GTM respects user consent:

- **Before user consents**: GTM fires but doesn't send analytics data to Google
- **After user consents**: GTM sends all tracked events to Google Analytics 4
- **User declines**: No tracking data sent (but page analytics still occur)

---

## Form Submission Flow

### End-to-End: Contact Form

**HTML** (`src/components/forms/ContactForm.astro`), simplified:

```astro
<form
  method="POST"
  action="/api/forms"
  data-stellar-form="contact"
  data-turnstile-sitekey={turnstileSiteKey}
>
  <input type="hidden" name="formType" value="contact" />
  <div aria-hidden="true"><input name="website" tabindex="-1" /></div>
  <!-- honeypot -->
  <FormField id="contact-name" name="name" label="Name" required />
  <FormField
    id="contact-email"
    name="email"
    label="Email"
    type="email"
    required
  />
  <FormField
    id="contact-message"
    name="message"
    label="Message"
    type="textarea"
    required
  />
  <div data-turnstile></div>
  <div data-form-messages class="hidden"></div>
  <button type="submit">Send</button>
</form>
<script>
  import { enhanceForms } from '../../utils/forms/client';
  enhanceForms();
</script>
```

**Client** (`enhanceForms()` in `src/utils/forms/client.ts`):

1. On submit, prevent the native POST and run `validateSubmission()` (`src/utils/forms/schema.ts`)
   - Invalid → render field errors inline via each `FormField`'s error container; stop
2. Request a Turnstile token (loading the widget on first interaction if it hasn't already); on timeout, show an error and stop
3. `fetch('/api/forms', { method: 'POST', headers: { Accept: 'application/json' }, body: JSON.stringify({ formType, fields, turnstileToken }) })`
4. On `{ ok: true }` — show a success message, reset the form
5. On `{ ok: false, fieldErrors }` — render the server's field errors (same rendering path as step 1)
6. On `{ ok: false, error }` — show the error message; the form remains filled in so the user can retry

**Worker** (`worker/forms/handler.ts`):

1. Honeypot filled → respond success immediately, nothing written anywhere
2. `env.FORM_RATE_LIMITER.limit({ key: 'forms:' + ip })` → 429 if exceeded
3. `validateSubmission()` — the same function and schema the client just ran, re-checked server-side → 400 + `fieldErrors` if invalid
4. No Turnstile token → 400 (JSON) / 303 to `/form-error?reason=js` (native POST)
5. `verifyTurnstileToken()` — calls Cloudflare's `siteverify`, checks the response hostname matches the request → 403 if either fails
6. `buildEnvelope()` + `submitToAppsScript()` — HMAC-signs `{ formType, fields, meta }` and POSTs it to the Apps Script `/exec` URL → 502 if the script is unreachable or reports failure
7. Success → `{ ok: true, id }` (JSON) or a `303` to `/thank-you?form=<type>` (native POST)

**Apps Script** (`apps-script/Code.gs`, `doPost`):

1. Recomputes the HMAC signature and rejects a mismatch or an envelope older than 300s
2. Checks `CacheService` for the envelope's `id` — a duplicate (retried) request returns `{ ok: true, duplicate: true }` without writing a second row
3. Appends a row to the sheet tab for that form type (created with a header row on first use), guarded by `LockService`
4. Emails `NOTIFY_EMAIL` (best-effort — a failure here never fails the submission, since the row is already written)

**No-JS fallback:** the same `<form>` still POSTs natively to `/api/forms` with no JavaScript at all. Since Turnstile can't produce a token without a browser running it, this always hits step 4 above and redirects to `/form-error?reason=js`, which explains that JavaScript is required rather than pretending the submission worked.

---

## Non-Obvious Edge Cases

### 1. Missing Author JSON

If a blog post references an author file that doesn't exist:

```typescript
const author = await getAuthor('nonexistent-author');
// Returns: null (doesn't throw)
```

The `AuthorBio` component gracefully renders nothing.

### 2. Empty Blog Collection

If no MDX files exist in `src/content/blog/`:

```typescript
const posts = await getPublishedPosts();
// Returns: []
```

The blog index page renders "No posts found" message (handled by PostList component).

### 3. Tag with No Posts

If a user navigates to `/blog/tag/nonexistent-tag`:

```typescript
// /blog/tag/[tag].astro
const posts = await getPostsByTag('nonexistent-tag');
// Returns: [] (no 404, renders empty state)
```

### 4. Draft Posts in Development

Drafts are excluded from production builds but **included in dev**:

```typescript
const posts = await getPublishedPosts((includeDrafts = !import.meta.env.PROD));
// Dev: [draft1, post1, post2]
// Prod: [post1, post2]
```

### 5. Turnstile Hostname Mismatch

`verifyTurnstileToken()` (`worker/forms/turnstile.ts`) checks `siteverify`'s response `hostname` against the request's own hostname, rejecting with 403 if they differ:

```typescript
if (result.hostname && result.hostname !== expectedHostname) {
  return { ok: false, errorCode: 'hostname-mismatch' };
}
```

This is a deliberate defense (a token solved on one site can't be replayed against another), but it means **every hostname the form is actually served from** — production, `*.workers.dev`, PR preview URLs — must be added to the Turnstile widget's allowed hostnames in the Cloudflare dashboard, or genuine submissions from that hostname will be rejected. See DEPLOYMENT.md#form-worker.

### 6. Apps Script Unreachable or Misconfigured

`submitToAppsScript()` (`worker/forms/apps-script.ts`) catches both a network failure and a non-2xx / malformed-JSON response, returning `{ ok: false, error }` either way — the Worker turns this into a `502` (JSON) or a `303` to `/form-error?reason=server` (native POST). The submission is **not** written anywhere in this case; the user sees an error and can retry. Common causes: `APPS_SCRIPT_URL` is wrong, the deployment isn't "Execute as: Me / Access: Anyone", or `APPS_SCRIPT_HMAC_SECRET` doesn't match the script's Script Property (`Code.gs` would then return `{ ok: false, error: 'bad-signature' }` with an HTTP 200 — Apps Script always answers 200, errors live in the body).

### 7. SSR Context (No `window`)

Utilities like `trackEvent()` are SSR-safe:

```typescript
export function trackEvent(name: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') return; // No error; just skip
  // ...
}
```

Called during static generation, the function safely no-ops.

### 8. dataLayer Not Defined

If GTM script fails to load:

```typescript
if (!Array.isArray(window.dataLayer)) return; // No error; just skip
```

### 9. Public Site URL Not Set

`astro.config.mjs` defaults if `PUBLIC_SITE_URL` is missing:

```typescript
const site =
  import.meta.env.PUBLIC_SITE_URL || 'https://stellarboat.example.com';
```

Sitemap and feeds use this URL.

### 10. Image Preload Fails

If `src/layouts/Base.astro` preloads a missing hero image:

```astro
<link rel="preload" as="image" href="/images/hero-background.png" />
```

The preload fails silently; the image is still fetched when needed (no 404, but LCP may degrade).

---

## Setup & Development

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (or yarn/pnpm)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/stellarboat.git
cd StellarBoat

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your config:
# PUBLIC_SITE_URL=https://your-domain.com
# PUBLIC_GTM_ID=GTM-XXXXXX
# PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key

# Set up Worker secrets for the form endpoint (optional — only needed to
# test form submission locally; see DEPLOYMENT.md#form-worker)
cp .dev.vars.example .dev.vars
```

### Development Server

```bash
npm run dev
# Starts Astro dev server on http://localhost:3000
# Hot reload enabled; content changes reflect instantly
```

### Building for Production

```bash
npm run build
# Generates static HTML in dist/
# Runs Astro type check and ESLint
```

### Testing

```bash
# Unit tests (Vitest)
npm run test:unit

# E2E tests (Playwright)
npm run test:e2e

# Run all tests
npm run test
```

### Type Checking

```bash
npm run check
# Runs astro check (TypeScript validation)
```

### Linting & Formatting

```bash
# ESLint (check only)
npm run lint

# Prettier (format)
npm run format
```

### Commands Summary

| Command             | Purpose                          |
| ------------------- | -------------------------------- |
| `npm run dev`       | Start dev server (hot reload)    |
| `npm run build`     | Build static site for production |
| `npm run preview`   | Preview production build locally |
| `npm run test:unit` | Run Vitest unit tests            |
| `npm run test:e2e`  | Run Playwright e2e tests         |
| `npm run check`     | Type check with astro check      |
| `npm run lint`      | Check ESLint violations          |
| `npm run format`    | Auto-format code with Prettier   |

---

## Deployment

The canonical demo is deployed to **Cloudflare Workers with Static Assets**, configured via `wrangler.jsonc` in the repo root. The site itself is a plain static build — `output: 'static'` in `astro.config.mjs`, no Astro adapter — but `wrangler.jsonc` is no longer assets-only: `main` points at the hand-written `worker/index.ts`, which handles `POST /api/forms` (see "Form Submission Flow" above) and falls through to `env.ASSETS.fetch()` for everything else. `assets.run_worker_first: ["/api/*"]` means only form requests actually invoke the Worker — every static page and asset is served without it running.

Deployment is dashboard-driven, not CLI-driven: the repo is connected to Cloudflare's "Workers Builds" Git integration, which builds and deploys automatically on every push to `main`, with preview URLs per PR — the same low-effort flow Cloudflare Pages provided. Worker secrets (`TURNSTILE_SECRET_KEY`, `APPS_SCRIPT_URL`, `APPS_SCRIPT_HMAC_SECRET`) are set separately via `wrangler secret put` or the Dashboard, not through the Git-integration build. See DEPLOYMENT.md#form-worker for setup steps.

For occasional local sanity checks (not required day to day):

```bash
npm run build
npx wrangler dev
```

For active local development of the form endpoint, run `npm run dev` and `npm run dev:worker` together — see DEPLOYMENT.md#form-worker.

**Alternative Hosts**:

- Vercel: the static site deploys the same way (see DEPLOYMENT.md); the form endpoint needs a Vercel Function ported from `worker/forms/handler.ts` — see DEPLOYMENT.md's "Porting the Form Worker"
- Any static host (GitHub Pages, Surge, AWS S3, etc.): deploy the `dist/` directory; forms need `/api/forms` reachable some other way, or point `forms.endpoint` elsewhere

---

## FAQ

### Q: How do I add a new blog post?

**A**: Create a new `.mdx` file in `src/content/blog/`:

```mdx
---
title: My New Post
description: A brief description.
publishedAt: 2025-02-01
author: sarah-chen
tags: ['astro', 'tutorial']
draft: false
---

# Content here...
```

Astro will automatically:

- Validate frontmatter against the blog schema
- Generate a route `/blog/my-new-post`
- Include it in blog listing + RSS feed

### Q: How do I disable the blog entirely?

**A**: Edit `src/config/site.ts`:

```typescript
features: {
  blog: false, // Disables all /blog/* routes
}
```

### Q: How do I change the color scheme?

**A**: Edit `src/styles/tokens.css` (the Tailwind `@theme` block):

```css
@theme {
  --color-primary-{50..900}: hsl(...);
  --color-secondary-{50..900}: hsl(...);
  /* etc. */
}
```

### Q: How do I send form submissions somewhere other than Google Sheets?

**A**: There's no per-component backend to swap — every form POSTs to one endpoint. Two options:

1. **Change what the Worker forwards to.** Edit `worker/forms/handler.ts` (or add a new module alongside `apps-script.ts`) to call a different destination after the honeypot/rate-limit/Turnstile gates run. This keeps the spam protection and stays a single code path for every form.
2. **Point at a different endpoint entirely.** Set `forms.endpoint` in `src/config/forms.ts` (or override per-component with the `endpoint` prop) to any URL that accepts `POST { formType, fields, turnstileToken }` and returns `{ ok: boolean, error?, fieldErrors? }`. You lose this repo's Worker-side gating unless your replacement implements its own.

### Q: How do I add custom fonts?

**A**: Currently using @fontsource for Inter and JetBrains Mono. To add another:

```bash
npm install @fontsource/your-font
```

Then import in `src/layouts/Base.astro`:

```astro
import '@fontsource/your-font/400.css';
```

---

## Summary

StellarBoat is a **static-first, type-safe, accessible marketing website template** built on Astro 5. Its strength lies in:

- ✅ **Zero runtime JavaScript** (progressive enhancement)
- ✅ **Strong typing** (TypeScript + Content Collections schema)
- ✅ **Clean architecture** (layout hierarchy, separation of concerns)
- ✅ **Easy customisation** (fork-friendly config, feature flags)
- ✅ **Excellent performance** (static generation, image optimization, LCP <2.5s)
- ✅ **Accessibility first** (semantic HTML, ARIA, focus management)

For further details on any subsystem, refer to the relevant source files or inline documentation.

---

**Version**: 1.0 | **Updated**: 2025-02-13
