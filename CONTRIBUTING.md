# Contributing to StellarBoat

Thanks for your interest in contributing! StellarBoat is a community project and we welcome improvements to the core framework — bug fixes, new features, documentation, and improvements to the analytics or form submission pipeline.

---

## What to Contribute

**Welcome contributions:**

- Bug fixes in core components, layouts, and utilities
- Improvements to the form pipeline (`src/utils/forms/`, `worker/forms/`, `apps-script/`)
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

## Git Hooks & Code Quality

On first `npm install`, Husky automatically sets up Git hooks to lint and format your code before each commit—ensuring code quality and consistency across the codebase.

### How It Works

**On `npm install`:**

- The `prepare` script runs `npx husky`, which installs pre-commit hooks from `.husky/`

**On `git commit`:**

1. The pre-commit hook runs `npx lint-staged --no-stash` on only your staged files (more efficient than checking the entire codebase)
2. **ESLint with auto-fix** runs on `*.{js,mjs,cjs,ts}` files
3. **Prettier formatting** runs on `*.{astro,js,mjs,cjs,ts,json,md}` files
4. Fixed files are automatically re-staged
5. If unfixable ESLint errors remain, the commit is blocked

### Manual Commands

You can also run linting and formatting manually at any time:

```bash
npm run lint      # Run ESLint with auto-fix
npm run format    # Run Prettier
```

### Troubleshooting

**Commit blocked by ESLint errors:**

```bash
# Review the ESLint error messages, fix them manually, then:
npm run lint
git add .
git commit -m "your message"
```

**Bypass the hook (not recommended):**

```bash
git commit --no-verify -m "your message"
```

**Husky hook didn't run:**

- Verify Husky is installed: `npm list husky`
- Ensure `.husky/pre-commit` exists and is executable
- Run `npm install` again to reinitialize hooks

---

## Development Workflow

1. **Open an issue first** for significant changes — discuss the approach before writing code
2. Fork the repo and create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. When you commit (`git commit`), linting and formatting will run automatically (see [Git Hooks & Code Quality](#git-hooks--code-quality) above)
5. Run `npm run check` — `astro check` (TypeScript + Astro type errors) must pass
6. If you touched `worker/`, run `npm run check:worker` — the Worker has its own tsconfig (Workers runtime types, not DOM)
7. Run `npm run build` — production build must succeed
8. Run `npm run test` — all unit tests must pass; run `npm run test:worker` too if you touched `worker/`
9. Run `npm run test:e2e` — all Playwright e2e tests must pass
10. Add or update tests if your change affects behavior
11. Update `SPEC.md` if your change affects the architecture
12. Open a pull request against `main`

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

## Contributing to the Form Pipeline

Forms don't have a swappable per-component backend — every form component POSTs JSON to one endpoint (`forms.endpoint` in `src/config/forms.ts`, default `/api/forms`), handled by the Cloudflare Worker in `worker/`. See SPEC.md §10 and ARCHITECTURE.md#form-submission-flow for the full pipeline before contributing here.

**Where a change belongs:**

- **Shared validation** (field rules, lengths, formats) → `src/utils/forms/schema.ts`. This module is imported by both `src/utils/forms/client.ts` (browser) and `worker/forms/handler.ts` (Worker) — it must stay free of Astro, DOM, and Workers-runtime imports so it works in both.
- **Client-side behavior** (Turnstile loading, submit handling, error rendering) → `src/utils/forms/client.ts`.
- **A new gate or destination** (e.g. forwarding to a second service after Apps Script, or replacing Apps Script entirely) → `worker/forms/handler.ts` and its neighboring modules (`turnstile.ts`, `sign.ts`, `apps-script.ts`).
- **Sheet-side logic** (columns, notification format) → `apps-script/Code.gs`. If you change the envelope shape, keep `worker/forms/sign.ts`'s test vector and `Code.gs`'s `selfTest()` in agreement — see `worker/forms/sign.test.ts`.
- **A new form type** (beyond contact/lead/newsletter) → add it to `FORM_SCHEMAS` in `schema.ts`, `FORM_COLUMNS` in `Code.gs`, and a new Astro component following the pattern in `ContactForm.astro`.

**Testing:** the Worker has its own Vitest suite and tsconfig, separate from the app's — see `worker/vitest.config.ts` and run `npm run test:worker` / `npm run check:worker`. Mock `fetch` and the `FORM_RATE_LIMITER` binding rather than hitting real Turnstile/Apps Script endpoints in tests (see `worker/forms/handler.test.ts` for the pattern).

---

## Pull Request Checklist

- [ ] All commits passed Husky pre-commit hooks (lint-staged ran ESLint and Prettier)
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
