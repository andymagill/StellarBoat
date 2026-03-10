# 🚀 StellarBoat

> A production-ready Astro.js starter for marketing mini-sites and landing pages. Engineered to be forked, customized, and deployed — by humans and AI coding agents alike.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-FF5D01)](https://astro.build)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**[Live Demo](https://stellarboat.magill.dev)** — See StellarBoat in action on Cloudflare Pages

---

## What is StellarBoat?

StellarBoat is an open-source Astro.js template for marketing mini-sites — product landing pages, campaign microsites, agency client sites, and side-project showcases. It's built around a clear separation between **core framework code** and **your project's content, config, and styles**, so you can pull upstream improvements without merge conflicts in your customized fork.

**Built for:**

- Developers and agencies shipping client mini-sites
- AI coding agents that need a predictable, well-documented architecture
- Open source contributors who want a real-world Astro reference project

---

## Key Features

- **Static-first, edge-enhanced** — `output: 'static'` always; Cloudflare Workers for optional edge enhancements (geo redirects, A/B cookies, dynamic OG images)
- **Content-first architecture** — all site content lives in `src/content/` and `src/config/`; zero content in core components, zero merge conflicts in forks
- **Astro 5 + MDX blog** — Content Layer API, full-featured blog with tags, authors, reading time, RSS, and draft post support
- **SEO out of the box** — meta tags, Open Graph, Twitter cards, canonical URLs, sitemap, robots.txt, JSON-LD structured data — automatic per page type
- **Google Tag Manager** — one GTM snippet load; GA4, pixels, and other tags configured in GTM dashboard, not in code; optional consent mode v2 hooks
- **Web3Forms by default** — free, host-agnostic form submissions with email notifications; per-component backend override allows different services on the same site (e.g., Web3Forms for contact, custom API for newsletter)
- **Tailwind CSS v4 + design tokens** — CSS-native `@theme` replaces `tailwind.config.js`; rebrand by editing one CSS file
- **Cloudflare Pages live demo** — canonical demo deployed to Cloudflare Pages; Netlify and Vercel compatibility documented for forks
- **Fully typed** — TypeScript strict mode throughout, including content collection Zod schemas
- **Demo site included** — `src/demo/` exercises every feature; doubles as architecture reference and Playwright test surface

---

## Getting Started

```bash
# 1. Fork or use as template on GitHub, then clone
git clone https://github.com/YOUR_USERNAME/stellarboat.git my-site
cd my-site

# 2. Install dependencies
npm install

# 3. Configure your site
cp src/config/site.example.ts src/config/site.ts
# Edit src/config/site.ts with your details

# 4. Set your brand tokens
# Edit src/styles/tokens.css

# 5. Start developing
npm run dev
```

That's it. Visit `http://localhost:4321`.

> **Fork cleanup:** After customizing your site, you can delete the demo pages. Delete `src/pages/showcase.astro`, `src/pages/ui.astro`, and `src/pages/forms.astro`. Update `src/config/site.example.ts` to set `demo: false`. See **[SPEC.md §14](SPEC.md#14-demo-site)** for details. You can also delete `src/demo/` if you don't need the architecture reference.

---

## Project Structure

```
stellarboat/
├── src/
│   ├── config/          ← YOUR site config (name, nav, analytics, forms)
│   ├── content/         ← YOUR content (blog posts, authors, pages)
│   ├── styles/
│   │   ├── tokens.css   ← YOUR brand colors, fonts, spacing
│   │   └── global.css   ← core resets and component styles
│   ├── components/      ← core reusable components (don't edit for brand)
│   ├── layouts/         ← core page layouts
│   ├── pages/           ← Astro page routes
│   └── demo/            ← demo content (safe to delete in forks)
├── public/              ← static assets
├── SPEC.md              ← full architecture specification
└── CONTRIBUTING.md      ← contribution guide
```

> **Fork workflow:** customize `src/config/`, `src/content/`, and `src/styles/tokens.css`. Leave `src/components/` and `src/layouts/` unchanged where possible to stay merge-friendly with upstream.

---

## Documentation

| Document                                 | Description                                               |
| ---------------------------------------- | --------------------------------------------------------- |
| [SPEC.md](SPEC.md)                       | Full architecture specification and design decisions      |
| [TASKS.md](TASKS.md)                     | Ordered implementation task list (milestones 0–12)        |
| [CONTRIBUTING.md](CONTRIBUTING.md)       | How to contribute to StellarBoat core                     |
| [DEPLOYMENT.md](DEPLOYMENT.md)           | Cloudflare Pages setup + Netlify/Vercel fork instructions |
| [src/demo/README.md](src/demo/README.md) | Guide to the included demo site                           |

---

## License

MIT — free to use, fork, and commercialize. Attribution appreciated but not required.
