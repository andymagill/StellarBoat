import type { FooterConfig } from '../types/config.ts';

/**
 * Footer configuration
 *
 * Used by Footer.astro to render the footer section.
 * Update this object to customize footer content and links.
 */
export const footerConfig: FooterConfig = {
  copyrightYear: new Date().getFullYear().toString(),
  description: 'Built with StellarBoat',
  tagline: 'Built with care · Deep Space theme',
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Design Tokens', href: '/tokens' },
    { label: 'UI Primitives', href: '/ui' },
    { label: 'Forms', href: '/forms' },
  ],
  columns: [
    {
      title: 'Tech Stack',
      links: [
        { label: 'Astro', href: 'https://astro.build' },
        { label: 'Tailwind CSS', href: 'https://tailwindcss.com' },
        { label: 'TypeScript', href: 'https://www.typescriptlang.org' },
        { label: 'Prettier', href: 'https://prettier.io' },
        { label: 'ESLint', href: 'https://eslint.org' },
        { label: 'Iconify', href: 'https://iconify.design' },
      ],
    },
  ],
};
