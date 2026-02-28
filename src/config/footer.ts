import type { FooterConfig } from '../types/config.ts';

/**
 * Footer configuration
 *
 * Used by Footer.astro to render the footer section.
 * Update this object to customize footer content and links.
 */
export const footerConfig: FooterConfig = {
  copyrightYear: '2024',
  description: 'Built with StellarBoat',
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Design Tokens', href: '/demo/tokens' },
  ],
};
