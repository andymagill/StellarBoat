# StellarBoat Deployment Guide

This document covers deployment for both the canonical StellarBoat demo (Cloudflare Workers with Static Assets) and community forks (Vercel or custom hosts).

---

## Canonical Demo — Cloudflare Workers (Static Assets)

The official StellarBoat demo is deployed to **Cloudflare Workers**, using Workers' native static assets support (the modern replacement for Cloudflare Pages). A `wrangler.jsonc` file in the repo root tells Cloudflare's build system to serve `dist/` as static assets — everything else is handled by Cloudflare's dashboard Git integration, the same low-effort flow Pages used to provide.

### Initial Setup (One Time)

1. **Sign in to Cloudflare Dashboard** — https://dash.cloudflare.com
2. **Navigate to Workers & Pages** — Left sidebar → "Workers & Pages" → "Create" → "Workers" → "Import a repository" (this is "Workers Builds," the Git-integration successor to Pages)
3. **Connect Git**
   - Authorize GitHub
   - Grant access to your repository
4. **Create a project**
   - Repository: select your StellarBoat fork
   - Production branch: `main`
   - Cloudflare reads `wrangler.jsonc` from the repo to know the build output is static assets in `./dist` — no manual build-output configuration needed
5. **Build settings**
   - Build command: `npm run build`
   - Leave all other settings as auto-detected
6. **Environment variables** (if using secrets)
   - Add `PUBLIC_GTM_ID`, `PUBLIC_SITE_URL`, etc. as needed
   - See `.env.example` for all variables
7. **Deploy** — Save settings; Cloudflare builds and deploys automatically from here on

### Deployments

- **Production:** every push to `main` deploys to your main Workers URL
- **Previews:** every PR creates an automatic preview deployment (URL shown in PR)
- **No local CLI deploy step needed** — Cloudflare's dashboard Git integration handles build and deploy directly, same as Pages did

### Adding Your First API Route (SSR)

Today the site is fully static (`output: 'static'` in `astro.config.mjs`, no adapter) — `wrangler.jsonc` is configured as assets-only. When you add a server-rendered route (e.g. a contact/newsletter form submission endpoint under `src/pages/api/`):

1. Mark the route `export const prerender = false;`
2. Install and wire the adapter in `astro.config.mjs`:
   ```js
   import cloudflare from '@astrojs/cloudflare';
   // ...
   export default defineConfig({
     // ...
     adapter: cloudflare(),
   });
   ```
   (`@astrojs/cloudflare` is already listed in `devDependencies`.)
3. Add a `main` entry to `wrangler.jsonc` pointing at the generated Worker:
   ```jsonc
   "main": "./dist/_worker.js/index.js"
   ```
4. Push — Cloudflare's dashboard build picks up the new config automatically.

### Custom Domain (Optional)

1. Go to your Worker's settings
2. **Domains & Routes** → Add your domain
3. Follow Cloudflare's DNS setup instructions

### Branch Protection (Recommended)

To prevent merging pull requests that fail CI checks:

1. Go to your repository on GitHub
2. Settings → Branches
3. Under "Branch protection rules", click "Add rule"
4. Pattern: `main`
5. Enable:
   - ✓ Require a pull request before merging
   - ✓ Dismiss stale pull request approvals when new commits are pushed
   - ✓ Require status checks to pass before merging
6. Select required status checks:
   - `Lint & Format`
   - `Type Check`
   - `Build`
   - `Playwright Tests`
   - `Lighthouse CI`
7. Click "Create"

Now, any PR that fails lint, type-check, build, tests, or Lighthouse will be blocked from merging.

---

## Forks — Vercel

If you choose to deploy to **Vercel** instead:

### Initial Setup

1. **Sign in to Vercel** — https://vercel.com
2. **New project** → Import Git repo → Select your StellarBoat fork
3. **Framework preset** — Select "Astro"
4. **Build & Output settings**
   - Build command: `npm run build`
   - Output directory: `dist`
5. **Environment variables** — Add via Vercel project settings
6. **Deploy** — Vercel automatically deploys on push to production branch, with preview URLs per PR — same dashboard-driven flow as the Cloudflare setup above

### Using vercel.json (Optional)

For custom redirects or edge middleware:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

---

## Local Testing Before Deployment

Before pushing to production:

```bash
# Install dependencies
npm install

# Copy example env file and fill in your values
cp .env.example .env.local

# Run dev server locally
npm run dev
# Visit http://localhost:4321

# Test production build locally
npm run build
npm run preview
# Visit http://localhost:3000 (or as shown)

# Lint and type-check before commit
npm run lint
npm run check
```

For an occasional sanity check of the exact Workers static-assets config (not required day to day — the dashboard's PR preview URL covers this):

```bash
npm run build
npx wrangler dev
```

---

## Environment Variables

All environment variables are documented in `.env.example`. Here's a quick reference:

| Variable               | Purpose                            | Required |
| ---------------------- | ---------------------------------- | -------- |
| `PUBLIC_SITE_URL`      | Full site URL (meta tags, sitemap) | ✅       |
| `PUBLIC_GTM_ID`        | Google Tag Manager container ID    | ❌       |
| `PUBLIC_CONSENT_MODE`  | Enable GTM consent mode v2         | ❌       |
| `PUBLIC_NOINDEX`       | Set robots: noindex for staging    | ❌       |
| `PUBLIC_DEMO_ENABLED`  | Show /demo/\* routes               | ❌       |
| `WEB3FORMS_ACCESS_KEY` | Web3Forms contact form key         | ❌       |

**Note:** Variables prefixed `PUBLIC_` are visible in browser code; others are private (build-time only).

---

## Preview Deployments

Both platforms support automatic preview deployments on pull requests:

- **Cloudflare Workers** — Creates a preview URL automatically via Workers Builds
- **Vercel** — Creates preview URL

No additional configuration needed — push a PR and the platform's GitHub App automatically builds and deploys.

---

## Troubleshooting

### Build Fails on Deploy

Check:

1. Local `npm run build` succeeds
2. All required environment variables are set in platform dashboard
3. Node version is 20+ (check platform's Node version setting)
4. No Git LFS files (StellarBoat doesn't use any, but custom additions might)
5. `wrangler.jsonc` is present and valid (Cloudflare only) — validate locally with `npx wrangler deploy --dry-run`

### Preview Deployment Missing

Ensure:

1. GitHub App is authorized to access your repo
2. Branch protection rules don't block CI status checks
3. Check platform logs (Cloudflare → Workers & Pages → your project → Deployments, Vercel → Deployments)

### Domain Configuration Issues

- **Cloudflare:** Use Cloudflare's DNS or point CNAME to your Worker's default domain
- **Vercel:** Use Vercel's nameservers or point CNAME to `cname.vercel.com`

---

## Next Steps

1. Configure your site in `src/config/site.ts` (copy from `site.example.ts`)
2. Set brand tokens in `src/styles/tokens.css`
3. Add content to `src/content/blog/` and `src/pages/`
4. Push to `main` and watch your site build live!

For more details, see [README.md](README.md) and [SPEC.md](SPEC.md).
