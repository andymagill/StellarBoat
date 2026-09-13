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
- **Deployment**: Cloudflare Workers (configured; alternatives available)
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
│  │ ├─ Forms config (Web3Forms key, backends)              │   │
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
│  │ ├─ index.ts: submitForm() → resolves config + adapter   │   │
│  │ └─ adapters/                                            │   │
│  │    ├─ web3forms.ts (implemented)                        │   │
│  │    ├─ netlify.ts (stub)                                 │   │
│  │    ├─ api.ts (stub)                                     │   │
│  │    ├─ formspree.ts (stub)                               │   │
│  │    └─ formspark.ts (stub)                               │   │
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
All forms work as **native HTML POST submissions** (no JavaScript required). When JavaScript loads, they upgrade to **AJAX with client-side validation** for better UX.

This means:
- If JS fails to load, forms still work (server-side error handling by Web3Forms)
- Users with JavaScript disabled are not blocked
- Validation errors appear inline (if JS loaded)

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

| File | Purpose | Edit to Customise |
|------|---------|-------------------|
| `src/config/site.ts` (fork) | Site identity, analytics, features | Name, URL, analytics ID, feature flags |
| `src/config/nav.ts` | Header navigation | Menu items, links, demo flag |
| `src/config/footer.ts` | Footer content | Copyright year, nav columns, social links |
| `src/config/analytics.ts` | Google Tag Manager + consent | GTM ID, consent mode, custom attributes |
| `src/config/forms.ts` | Form backends | Web3Forms key, alternative backends, reCAPTCHA |

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
used by utilities (src/utils/analytics.ts, src/utils/blog.ts, src/utils/forms/index.ts)
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
   <BlogPost layout props={{title, author, tags, readingTime, ...}}>
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
tags: ["astro", "beginner", "tutorial"]
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

| Component | Props | Variants | Usage |
|-----------|-------|----------|-------|
| **Button** | href, variant, size, disabled | primary / secondary / ghost; sm / md / lg | CTAs, form submit, navigation |
| **Card** | variant | default / raised | Content containers with optional shadow |
| **Badge** | variant | primary / secondary / success / warning / error / info | Labels, tags, status indicators |
| **Alert** | variant, icon | info / success / warning / error | Contextual messages (role="alert" for errors) |
| **Icon** | name, class, aria-label, aria-hidden | (Iconify name, e.g., "heroicons:rocket") | Decorative or meaningful icons |
| **Divider** | (none) | Horizontal line | Visual separation |

### Marketing Components (Data-Driven Sections)

| Component | Props | Variants |
|-----------|-------|----------|
| **Hero** | headline, subheadline, ctaButtons, variant | centered / split-left / split-right |
| **Features** | title, items, variant | grid-3 / grid-2 / list |
| **Testimonials** | items, variant | cards / carousel |
| **Pricing** | plans, highlightPlanId | Pricing table with featured plan |
| **FAQ** | items | Accordion with expand/collapse |
| **CTA** | headline, subtext, buttons | Full-width call-to-action band |
| **LogoBar** | logos, links | Logo grid with optional hover effects |

### Form Components

| Component | Props | Purpose |
|-----------|-------|---------|
| **FormField** | id, label, type, required, placeholder, error, aria-describedby | Reusable input/textarea/select wrapper |
| **ContactForm** | submitButtonText, onSuccess, web3formsKey | 3-field contact form (name, email, message) |
| **LeadCaptureForm** | submitButtonText, onSuccess | 4-field lead form (name, email, company, phone) |
| **NewsletterForm** | submitButtonText, onSuccess, inline | Email-only newsletter signup |

All forms include:
- **HTML5 validation** (required, email, tel attributes)
- **Client-side JS validation** (min/max length, email regex, phone format)
- **Error display** via FormField error containers
- **Progressive enhancement** (forms work without JS)

### Blog Components

| Component | Props | Purpose |
|-----------|-------|---------|
| **PostCard** | post | Renders post title, date, author, tags, reading time, image |
| **PostList** | posts, featured | Grid of PostCards with optional featured slot |
| **AuthorBio** | authorName | Avatar, bio, social links (async) |
| **TagFilter** | tags, activeTags | Interactive tag pills with active state |

### MDX Enhancement Components

| Component | Props | Purpose |
|-----------|-------|---------|
| **Callout** | type, title | info / warning / tip / danger boxes with icons |
| **CodeBlock** | filename, code, language | Syntax highlighting + copy button |
| **ImageCaption** | src, alt, caption | `<figure>` + `<figcaption>` with lazy loading |
| **VideoEmbed** | src, title | Responsive iframe (aspect-video) for YouTube/Vimeo |

### SEO Components

| Component | Props | Purpose |
|-----------|-------|---------|
| **SEO** | title, description, canonicalUrl, robots, noIndex | Meta tags (title, description, canonical, robots) |
| **OpenGraph** | title, description, image, type, url, twitterHandle | OG tags + Twitter Card |
| **JsonLd** | schemas | Inlines JSON-LD structured data (WebPage, BlogPosting, etc.) |

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
    .filter(post => includeDrafts || !post.data.draft)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
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

### Form Submission Utility

**File**: `src/utils/forms/index.ts`

```typescript
export async function submitForm(
  data: Record<string, any>,
  overrides?: Partial<ResolvedFormConfig>
): Promise<{ ok: boolean; message?: string; error?: string }> {
  const config = resolveFormConfig(overrides);
  const adapter = getAdapter(config.backend);
  
  try {
    return await adapter.submit(data, config);
  } catch (error) {
    return {
      ok: false,
      error: `Form submission failed: ${error.message}`,
    };
  }
}
```

**Flow**:
1. Receive form data from component
2. Merge with config (Web3Forms key, backend type, etc.)
3. Select adapter based on `config.backend`
4. Call adapter's `submit()` method
5. Return `{ ok: boolean, message?, error? }`

### Form Adapters

**File**: `src/utils/forms/adapters/`

Each adapter implements the `FormAdapter` interface:

```typescript
interface FormAdapter {
  submit(data: Record<string, any>, config: ResolvedFormConfig): Promise<{
    ok: boolean;
    message?: string;
  }>;
}
```

#### **web3forms.ts** (Implemented)
- Posts to `https://api.web3forms.com/submit`
- Requires `web3formsKey` in config
- Handles: name, email, message, phone, etc.
- Error handling: network errors return `{ ok: false, error: "..." }`

#### **netlify.ts**, **api.ts**, **formspree.ts**, **formspark.ts** (Stubs)
Each throws `NotImplementedError` with clear documentation:
```typescript
export const netlifyAdapter: FormAdapter = {
  async submit() {
    throw new Error(
      'Netlify Forms adapter is not yet implemented. ' +
      'See docs/forms.md for alternatives.'
    );
  },
};
```

---

## Feature Flags

All optional features are controlled via `siteConfig.features`:

```typescript
const { blog, rss, demo, pricing, testimonials } = siteConfig.features;
```

| Flag | Controls | Default | Notes |
|------|----------|---------|-------|
| `blog` | Blog routes + RSS feed | `true` | Disables `/blog/*` pages entirely (no static paths generated) |
| `rss` | RSS XML feed | `true` | Requires `blog: true`; independent of Pricing.astro rendering |
| `demo` | Demo pages (showcase, ui, forms) | `true` | Disables `/demo/*` routes and demo hub |
| `pricing` | (Unused) | `false` | Defined but not checked in code; Pricing.astro always renders if imported |
| `testimonials` | (Unused) | `true` | Defined but not checked in code; Testimonials.astro always renders if imported |

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

**HTML** (`src/components/forms/ContactForm.astro`):
```astro
<form id="contact-form" method="POST" action="/thank-you">
  <FormField id="name" label="Full Name" type="text" required />
  <FormField id="email" label="Email" type="email" required />
  <FormField id="message" label="Message" type="textarea" required />
  <button type="submit">Send</button>
</form>
```

**Progressive Enhancement** (`<script>` in ContactForm.astro`):
1. On page load, attach event listener to form
2. On submit:
   - Validate client-side (name length, email regex, message length)
   - If invalid: show error message inline; prevent submission
   - If valid: call `submitForm()` via AJAX
3. On success:
   - Show success message
   - Clear form fields
   - Redirect to `/thank-you` (optional)
4. On error:
   - Display error message from API response
   - Allow user to retry

**Server-Side** (Web3Forms):
1. Web3Forms receives FormData POST
2. Validates & sends email to configured address
3. Returns `{ success: true }` or `{ success: false, message: "..." }`

**Fallback** (No JavaScript):
If JavaScript fails to load:
1. Form submits as native HTML POST to Web3Forms
2. Web3Forms redirects to `/thank-you` (or error page)
3. User sees native browser validation only (HTML5)

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
const posts = await getPublishedPosts(
  includeDrafts = !import.meta.env.PROD
);
// Dev: [draft1, post1, post2]
// Prod: [post1, post2]
```

### 5. Missing Web3Forms Key
If `config.forms.web3formsKey` is not set:
```typescript
const result = await submitForm(data);
// Returns: { ok: false, error: "Web3Forms key not configured" }
```

The form component displays the error message to the user.

### 6. Network Failure on Form Submit
The adapter's try/catch returns:
```typescript
catch (error) {
  return { ok: false, error: `Network error: ${error.message}` };
}
```

User sees the error message and can retry.

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
const site = import.meta.env.PUBLIC_SITE_URL || 'https://stellarboat.example.com';
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
# PUBLIC_WEB3FORMS_KEY=your-web3forms-key
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

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Build static site for production |
| `npm run preview` | Preview production build locally |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run check` | Type check with astro check |
| `npm run lint` | Check ESLint violations |
| `npm run format` | Auto-format code with Prettier |

---

## Deployment

The site is configured for **Cloudflare Workers** (in `astro.config.mjs`). To deploy:

```bash
# Install Wrangler (Cloudflare CLI)
npm install -g wrangler

# Authenticate
wrangler auth login

# Deploy
npm run build
wrangler deploy
```

**Alternative Hosts**:
- Vercel: Uncomment Vercel adapter in `astro.config.mjs`
- Netlify: Uncomment Netlify adapter in `astro.config.mjs`
- Any static host (GitHub Pages, Netlify, Surge, AWS S3, etc.): Deploy `dist/` directory

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
tags: ["astro", "tutorial"]
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

### Q: How do I add a new form backend?
**A**: 
1. Create `src/utils/forms/adapters/my-backend.ts`
2. Implement the `FormAdapter` interface
3. Wire it into `src/utils/forms/index.ts` switch statement
4. Add the backend to `src/config/forms.ts`

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
