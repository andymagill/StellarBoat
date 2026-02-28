/**
 * Core configuration types for StellarBoat.
 *
 * These types define the shape of all fork-editable configuration.
 * Create a `src/config/site.ts` by copying `src/config/site.example.ts`
 * and filling in your project values.
 */

/**
 * Main site configuration.
 * All properties are required unless marked optional.
 */
export interface SiteConfig {
  /** Display name of the site (used in meta tags, header, footer) */
  name: string;

  /** Short tagline or description (used in meta og:description, footer) */
  tagline: string;

  /** Full site URL including protocol (e.g., https://example.com) */
  url: string;

  /** Site author/owner name */
  author: string;

  /** Contact email (used in footer, forms, etc.) */
  contactEmail: string;

  /** Social links (optional) */
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    [key: string]: string | undefined;
  };

  /** Navigation configuration */
  nav: NavConfig;

  /** Footer configuration */
  footer: FooterConfig;

  /** Analytics configuration (GTM, consent mode, etc.) */
  analytics: AnalyticsConfig;

  /** Forms configuration (default backend, Web3Forms key, etc.) */
  forms: FormsConfig;

  /** Feature flags for conditional rendering */
  features: FeaturesConfig;
}

/**
 * Navigation menu configuration
 */
export interface NavConfig {
  /** Array of nav links to display in header */
  items: NavItem[];

  /** Optional: show demo navigation stub (for demo site only) */
  includeDemo?: boolean;
}

/**
 * Single navigation item
 */
export interface NavItem {
  /** Display text */
  label: string;

  /** URL or path (relative or absolute) */
  href: string;

  /** Optional: mark as current/active */
  active?: boolean;
}

/**
 * Footer configuration
 */
export interface FooterConfig {
  /** Copyright year or range (e.g., "2024" or "2024-2025") */
  copyrightYear: string;

  /** Footer nav items (same shape as NavItem) */
  nav?: NavItem[];

  /** Footer description (optional tagline or blurb) */
  description?: string;
}

/**
 * Analytics configuration (Google Tag Manager)
 */
export interface AnalyticsConfig {
  /** GTM Container ID (e.g., "GTM-XXXX") or null to disable GTM */
  gtmId: string | null;

  /** Enable GDPR consent mode v2 */
  consentMode: boolean;

  /** Custom data attributes for GTM events (optional) */
  customAttributes?: Record<string, string | number | boolean>;
}

/**
 * Forms configuration (default backend, Web3Forms, etc.)
 */
export interface FormsConfig {
  /**
   * Default form backend: 'web3forms', 'netlify', 'api', or custom name
   * Individual form components can override this with a `backend` prop
   */
  defaultBackend: 'web3forms' | 'netlify' | 'api' | string;

  /** Web3Forms access key (required if defaultBackend is 'web3forms') */
  web3formsKey?: string;

  /** Default form action URL for 'api' backend */
  apiUrl?: string;

  /** Enable reCAPTCHA integration (optional) */
  recaptchaEnabled?: boolean;
  recaptchaSiteKey?: string;
}

/**
 * Feature flags for conditional component/page rendering
 */
export interface FeaturesConfig {
  /** Enable/disable blog system (affects pages, routes, RSS) */
  blog: boolean;

  /** Enable/disable RSS/Atom feed generation */
  rss: boolean;

  /** Enable/disable demo site pages (/demo/*, /demo-content, etc.) */
  demo: boolean;

  /** Enable/disable pricing page component */
  pricing: boolean;

  /** Enable/disable testimonials section */
  testimonials: boolean;
}
