import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindPlugin from '@tailwindcss/vite';

// Uncomment to use Netlify instead of Cloudflare:
// import netlify from '@astrojs/netlify';

// Uncomment to use Vercel instead of Cloudflare:
// import vercel from '@astrojs/vercel';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://stellarboat.example.com',
  output: 'static',
  trailingSlash: 'never',
  adapter: cloudflare(),
  // To use Netlify, change the adapter to:
  // adapter: netlify(),
  //
  // To use Vercel, change the adapter to:
  // adapter: vercel(),
  integrations: [
    mdx(),
    sitemap({
      // Exclude demo routes, the thank-you page, and any noIndex utility pages.
      // Note: pages with noIndex prop must be added here manually — the integration
      // only receives URL strings at build time, not Astro component props.
      filter: (page) =>
        !page.includes('/demo/') &&
        !page.endsWith('/thank-you') &&
        !page.endsWith('/thank-you/'),
    }),
    icon(),
  ],
  vite: {
    // Tailwind v4: tokens.css is the entry point containing @import "tailwindcss"
    // and the @theme block. The plugin auto-discovers it; no explicit path needed.
    plugins: [tailwindPlugin()],
  },
});
