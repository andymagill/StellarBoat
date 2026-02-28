# Contributing to StellarBoat

Thanks for your interest in contributing! StellarBoat is a community project and we welcome improvements to the core framework — bug fixes, new features, documentation, and new analytics or form backend adapters.

---

## What to Contribute

**Welcome contributions:**
- Bug fixes in core components, layouts, and utilities
- New form backend adapters (`src/utils/forms/adapters/` + documentation)
- New marketing section component variants
- Accessibility improvements
- Performance improvements
- Documentation improvements and corrections
- Demo site improvements

**Out of scope for core:**
- Project-specific content, branding, or config — those belong in forks
- Adding large new dependencies without prior discussion
- Opinionated design changes that would conflict with fork customizations

---

## Local Setup

```bash
git clone https://github.com/stellarboat/stellarboat.git
cd stellarboat
npm install
npm run dev
```

The demo site at `http://localhost:4321/demo` shows all components.

---

## Development Workflow

1. **Open an issue first** for significant changes — discuss the approach before writing code
2. Fork the repo and create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run `npm run lint` — ESLint + Prettier must pass
5. Run `npm run check` — `astro check` (TypeScript + Astro type errors) must pass
6. Run `npm run build` — production build must succeed
7. Run `npm run test` — all tests must pass
8. Add or update tests if your change affects behavior
9. Update `SPEC.md` if your change affects the architecture
10. Open a pull request against `main`

---

## Code Standards

- **TypeScript** — all new code in `.ts` / `.astro` with proper types; no `any`
- **Accessibility** — all interactive components must pass WCAG 2.1 AA; test with a screen reader or `axe`
- **No content in components** — components accept props; they never hardcode text, URLs, or brand values
- **Token-based styling** — use CSS custom properties from `tokens.css` and the corresponding Tailwind utilities; never hardcode color hex values in components
- **JSDoc** — all component props interfaces should have JSDoc comments

---

## Analytics

StellarBoat loads a single GTM container — there are no swappable analytics provider components. What runs inside GTM (GA4, pixels, Hotjar, etc.) is configured in the GTM dashboard, not in code.

If you want to document a GTM setup pattern (e.g., "here's how to configure Hotjar in your GTM container for use with StellarBoat"), that belongs in `src/demo/README.md` or a new `docs/analytics-recipes.md` — not as a code component.

The only code-level analytics contribution that makes sense is improving `Analytics.astro` itself (consent behavior, dataLayer events, performance) or `src/utils/analytics.ts` (`trackEvent` utility).

---

## Adding a Form Backend Adapter

1. Create `src/utils/forms/adapters/yourbackend.ts` — implement the `FormAdapter` interface from `src/types/forms.ts`: a single `submit(data, config)` method that returns `Promise<{ ok: boolean; error?: string }>`
2. Register the new adapter in the switch statement in `src/utils/forms/index.ts`
3. Add the new backend key to the `FormsConfig` union type in `src/types/config.ts` and add any backend-specific config fields
4. Add a demo example in `src/pages/demo/forms.astro`
5. Update the adapter comparison table in `SPEC.md` Section 10

**Constraint:** All form adapters must work from the browser via HTTP POST — no server-side Node.js code. StellarBoat is a static site; SSR API routes (`src/pages/api/`) are out of scope for core. If a backend requires server-side processing, the recommended pattern is a separate Cloudflare Worker or Netlify/Vercel Function that the `api` adapter POSTs to — document this with an example in `src/demo/edge/`.

---

## Pull Request Checklist

- [ ] `npm run lint` passes (ESLint + Prettier)
- [ ] `npm run check` passes (`astro check` — TypeScript + Astro types)
- [ ] `npm run build` passes (production build succeeds)
- [ ] `npm run test` passes
- [ ] Lighthouse CI passes (run locally with `npm run lighthouse`)
- [ ] No hardcoded content or brand values in components
- [ ] New components have typed `Props` interfaces with JSDoc
- [ ] `SPEC.md` updated if architecture changed
- [ ] Demo updated if new feature added

---

## Questions?

Open a GitHub Discussion for questions, ideas, or anything that doesn't fit in an issue.
