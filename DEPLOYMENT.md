# StellarBoat Deployment Guide

This document covers deployment for both the canonical StellarBoat demo (Cloudflare Pages) and community forks (Netlify, Vercel, or custom hosts).

---

## Canonical Demo — Cloudflare Pages

The official StellarBoat demo is deployed to **Cloudflare Pages**. This is the reference deployment.

### Initial Setup (One Time)

1. **Sign in to Cloudflare Dashboard** — https://dash.cloudflare.com
2. **Navigate to Pages** — Left sidebar → "Pages"
3. **Connect Git**
   - Click "Connect a Git account"
   - Authorize GitHub
   - Grant access to your repository
4. **Create a project**
   - Name: `stellarboat` (or your project name)
   - Repository: select your StellarBoat fork
   - Production branch: `main`
   - Framework preset: `Astro`
5. **Build settings**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`
   - Leave all other settings as auto-detected
6. **Environment variables** (if using secrets)
   - Add `PUBLIC_GTM_ID`, `PUBLIC_SITE_URL`, etc. as needed
   - See `.env.example` for all variables
7. **Deploy** — Save settings; Cloudflare Pages automatically builds and deploys

### Deployments

- **Production:** every push to `main` deploys to your main Pages URL
- **Previews:** every PR creates an automatic preview deployment (URL shown in PR)
- **No CI/build files needed** — Cloudflare Pages handles Git integration directly

### Custom Domain (Optional)

1. Go to your Pages project settings
2. **Custom domains** → Add your domain
3. Follow Cloudflare's DNS setup instructions

---

## Forks — Netlify

If you choose to deploy to **Netlify** instead:

### Initial Setup

1. **Sign in to Netlify** — https://app.netlify.com
2. **New site from Git** → Select GitHub → Select your repo
3. **Build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Environment variables** — Add any `PUBLIC_*` or private keys via Netlify dashboard
5. **Deploy** — Netlify automatically deploys on push to main

### Using netlify.toml (Optional)

If you need fine-grained control, create `netlify.toml` in the repo root:

```toml
[build]
command = "npm run build"
publish = "dist"

[build.environment]
NODE_VERSION = "20"

[[redirects]]
from = "/api/*"
to = "/.netlify/functions/:splat"
status = 200
```

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
6. **Deploy** — Vercel automatically deploys on push to production branch

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

---

## Environment Variables

All environment variables are documented in `.env.example`. Here's a quick reference:

| Variable | Purpose | Required |
|---|---|---|
| `PUBLIC_SITE_URL` | Full site URL (meta tags, sitemap) | ✅ |
| `PUBLIC_GTM_ID` | Google Tag Manager container ID | ❌ |
| `PUBLIC_CONSENT_MODE` | Enable GTM consent mode v2 | ❌ |
| `PUBLIC_NOINDEX` | Set robots: noindex for staging | ❌ |
| `PUBLIC_DEMO_ENABLED` | Show /demo/* routes | ❌ |
| `WEB3FORMS_ACCESS_KEY` | Web3Forms contact form key | ❌ |

**Note:** Variables prefixed `PUBLIC_` are visible in browser code; others are private (build-time only).

---

## Preview Deployments

All platforms support automatic preview deployments on pull requests:

- **Cloudflare Pages** — Creates a preview URL automatically
- **Netlify** — Creates preview deploy URL
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

### Preview Deployment Missing

Ensure:
1. GitHub App is authorized to access your repo
2. Branch protection rules don't block CI status checks
3. Check platform logs (Cloudflare → Pages → Deployments, Netlify → Deploys, Vercel → Deployments)

### Domain Configuration Issues

- **Cloudflare:** Use Cloudflare's DNS or point CNAME to Cloudflare Pages
- **Netlify:** Follow DNS setup in Netlify dashboard
- **Vercel:** Use Vercel's nameservers or point CNAME to `cname.vercel.com`

---

## Next Steps

1. Configure your site in `src/config/site.ts` (copy from `site.example.ts`)
2. Set brand tokens in `src/styles/tokens.css`
3. Add content to `src/content/blog/` and `src/pages/`
4. Push to `main` and watch your site build live!

For more details, see [README.md](README.md) and [SPEC.md](SPEC.md).
