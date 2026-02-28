import type { NavConfig } from '../types/config.ts';

/**
 * Main navigation configuration
 *
 * Used by Header.astro to render the main navigation menu.
 * Update this object to customize site navigation.
 */
export const navConfig: NavConfig = {
  items: [
    { label: 'Home', href: '/' },
    { label: 'Design Tokens', href: '/tokens' },
    { label: 'UI Primitives', href: '/ui' },
    { label: 'Forms', href: '/forms' },
  ],
  includeDemo: true,
};
