/**
 * robots.txt endpoint
 *
 * Allows all crawlers in production.
 * Set PUBLIC_NOINDEX=true in environment variables to block all indexing
 * (e.g., for staging / preview environments).
 *
 * SPEC §8
 */

import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site';

export const GET: APIRoute = () => {
  const noIndex = import.meta.env.PUBLIC_NOINDEX === 'true';

  const content = noIndex
    ? `# This site is not intended for public indexing.
User-agent: *
Disallow: /
`
    : `User-agent: *
Allow: /

# Exclude demo and utility paths from crawling
Disallow: /demo/
Disallow: /thank-you

Sitemap: ${siteConfig.url}/sitemap-index.xml
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
