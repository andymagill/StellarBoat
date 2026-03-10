# Demo Site Architecture & Guide

This directory contains architectural guidance, design specifications, and example patterns for building marketing sites with StellarBoat.

## Quick Start: Running the Demo Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:4321` in your browser. The demo pages are immediately visible:

| Demo Page           | URL                  | Purpose                                                                                                           |
| ------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Demo Home           | `/demo`              | Index of all demo routes and patterns                                                                             |
| Showcase            | `/showcase`          | Gallery of all marketing components (Hero, Features, Testimonials, Pricing, CTA, etc.)                            |
| UI Primitives       | `/ui`                | Reference for design tokens, typography, color system, and basic UI components (Button, Card, Badge, Alert, etc.) |
| Forms               | `/forms`             | Form component showcase with contact, lead capture, and newsletter examples                                       |
| Static Page Example | `/demo/content-page` | Example of a content-collection-driven static page with MDX components                                            |

---

## Contents of This Directory

- **`DESIGN.md`** — Complete visual design specification for the Deep Space theme, including:
  - Color palette and semantic color aliases
  - Typography system (sans-serif, monospace, scales)
  - Spacing, shadows, borders, and corner radius specifications
  - Component interaction patterns
  - Accessibility standards (WCAG 2.1 AA)
  - Dark mode strategy (`@media prefers-color-scheme`)

- **`edge/`** — Example edge middleware for Cloudflare Pages:
  - `resend-worker.ts` — Reference Cloudflare Worker for serverless email via Resend
  - Additional examples for redirects, OG image generation, A/B testing (documented in DESIGN.md)
  - These are optional enhancements; the site works fully without edge functions

---

## Using the Demo as a Learning Resource

Before deleting or customizing the demo, use it to understand StellarBoat:

1. **Visual design reference:** Browse `/ui` to see the color system, typography scale, and component styling
2. **Component patterns:** Visit `/showcase` to see marketing sections in action (how Hero, Features, Testimonials, Pricing, CTA work)
3. **Form patterns:** Check `/forms` to see form submission, validation, and success states
4. **Content patterns:** Explore `/demo/content-page` to understand how content-collection pages with MDX components work

---

## Demo Content Structure

Demo pages are listed in the filesystem but gated by the `features.demo` flag:

```
src/pages/
├── showcase.astro           # Marketing component gallery
├── ui.astro                 # UI primitives and design tokens
├── forms.astro              # Form components showcase
└── demo/
    ├── index.astro          # Demo index and feature list
    └── content-page.astro   # Content-collection static page example
```

Demo blog posts and authors live in `src/content/`:

```
src/content/
├── blog/
│   ├── accessible-components.mdx
│   ├── astro-component-patterns.mdx
│   ├── getting-started-astro-5.mdx
│   └── ...                   # demo posts have draft: true frontmatter
└── authors/
    ├── marcus-rodriguez.json
    └── sarah-chen.json
```

---

## Deleting the Demo

Forks are safe to delete all demo pages:

1. **Delete demo page files:**

   ```bash
   rm src/pages/showcase.astro src/pages/ui.astro src/pages/forms.astro
   rm -r src/pages/demo/
   ```

2. **Disable the demo in config:**

   ```typescript
   // src/config/site.example.ts
   export const siteConfig = {
     // ...
     features: {
       demo: false, // disable demo routes
       // ...
     },
   };
   ```

3. **Optionally delete this directory:**
   ```bash
   rm -r src/demo/  # only needed if DESIGN.md reference is not useful
   ```

The sitemap will automatically exclude demo routes once `features.demo: false` is set.

---

## Using as Test Surface

The demo pages serve as the test surface for Playwright end-to-end tests. When running:

```bash
npm run test:e2e
```

Playwright tests navigate the demo routes to verify:

- SEO (meta tags, canonical URLs, OG images generated correctly)
- Form submission (Web3Forms integration works)
- Navigation and page routing
- Accessibility (WCAG 2.1 AA compliance via axe)
- Performance (Lighthouse scores)

Before deleting the demo, ensure all tests pass. After deletion, remove the corresponding test assertions from `tests/e2e/`.

---

## Customization Checklist

**Before going live with your fork:**

1. ✅ Browse `DESIGN.md` to understand the visual language
2. ✅ Run `npm run dev` and visit all demo pages locally
3. ✅ Customize `src/styles/tokens.css` with your brand colors and typography
4. ✅ Review the component showcase at `/ui` to see how tokens are applied
5. ✅ Delete demo content files and disable `features.demo: false`
6. ✅ Run `npm run build` and verify the production build succeeds
7. ✅ Run `npm run test` to ensure all tests pass
8. ✅ Deploy via `DEPLOYMENT.md` to Cloudflare Pages (or Netlify/Vercel)

---

## Architecture Notes

The demo site is **never content** in the sense of SPEC.md §2 (Content-Core Separation). It's a self-contained reference implementation that:

- Uses the same components, types, and utilities as production forks
- Does not hardcode data or styles that would conflict with fork customization
- Can be deleted entirely without breaking the core framework
- Serves as executable documentation of how each component family works

For the full fork workflow and upstream merging strategy, see [SPEC.md §16. Fork Workflow & Upstream Merging](../SPEC.md#16-fork-workflow--upstream-merging).
