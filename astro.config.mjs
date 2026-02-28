import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import rss from '@astrojs/rss';
import icon from 'astro-icon';
import tailwindPlugin from '@tailwindcss/vite';

// Uncomment to use Netlify instead of Cloudflare:
// import netlify from '@astrojs/netlify';

// Uncomment to use Vercel instead of Cloudflare:
// import vercel from '@astrojs/vercel';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://stellarboat.example.com',
  output: 'static',
  adapter: cloudflare(),
  // To use Netlify, change the adapter to:
  // adapter: netlify(),
  // 
  // To use Vercel, change the adapter to:
  // adapter: vercel(),
  integrations: [
    sitemap({
      // Filter to exclude demo routes and no-index pages
      // Finalized in Milestone 8
      filter: () => true,
    }),
    icon(),
  ],
  vite: {
    plugins: [tailwindPlugin()],
  },
});
