# Demo Site Architecture

This directory contains architectural guidance, design specifications, and example patterns for building marketing sites with StellarBoat.

## Contents

- **`DESIGN.md`** — Complete visual design specification for the Deep Space theme, including color system, typography, spacing, component specs, and interaction patterns. Use this as a reference when customizing the brand tokens in `src/styles/tokens.css`.
- **`edge/`** — Example edge middleware for Cloudflare Pages (redirects, OG image generation, A/B testing). These are optional reference implementations.

## Public Demo Pages

The public-facing demo pages live outside this directory:

- `src/pages/showcase.astro` — Marketing component gallery
- `src/pages/ui.astro` — UI primitives and design tokens
- `src/pages/forms.astro` — Form components showcase

On the upstream StellarBoat site (stellarboat.magill.dev), these are production marketing pages, indexed in the sitemap, and part of the product narrative.

## Deleting the Demo

Forks are safe to delete:

- **This entire `src/demo/` directory** — only needed if the architecture guidance is useful
- **The three public demo pages** — see [SPEC.md §14](../SPEC.md#14-demo-site) for cleanup instructions

If you delete the demo pages, also update `src/config/site.example.ts` to set `demo: false`.

## Using as Reference

Before deleting, browse:

1. `DESIGN.md` for the visual language and component specs
2. The public demo pages (when running locally) to see how each component family works
3. `edge/resend-worker.ts` if you need serverless email or image processing on Cloudflare Workers

Then customize `src/styles/tokens.css` with your own brand colors and typography, and delete what you don't need.

---

**More:** See [SPEC.md §14. Demo Site](../SPEC.md#14-demo-site) for the full context on the upstream vs. fork strategy.
