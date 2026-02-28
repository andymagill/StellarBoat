import type { SiteConfig } from '../types/config.ts';

/**
 * StellarBoat Site Configuration
 *
 * To customize your fork:
 * 1. Copy this file to src/config/site.ts
 * 2. Replace all example values with your own
 * 3. Delete src/config/site.example.ts
 * 4. Update astro.config.mjs to import from 'site.ts'
 *
 * All fields are required unless marked [optional].
 */

export const siteConfig: SiteConfig = {
  // ============================================================================
  // SITE IDENTITY
  // ============================================================================

  /**
   * Display name used in:
   * - <title> tags ("Page Title — Site Name")
   * - JSON-LD schema
   * - meta tags
   */
  name: 'StellarBoat Demo',

  /**
   * Brand name displayed in the header logo and footer.
   * Often the same as `name` but can be shorter.
   */
  brandName: 'StellarBoat',

  /**
   * BCP-47 language tag for the HTML lang attribute.
   * Examples: 'en', 'en-US', 'fr', 'de'
   */
  locale: 'en',

  /**
   * Short tagline (1-2 lines).
   * Used in:
   * - og:description meta tag
   * - homepage hero subtext
   * - footer copy
   */
  tagline:
    'A production-ready Astro.js starter for marketing mini-sites and landing pages.',

  /**
   * Full site URL including protocol.
   * IMPORTANT: Must end without a trailing slash.
   * Used for:
   * - meta tags (og:url, canonical)
   * - sitemap generation
   * - RSS feed baseUrl
   */
  url: 'https://stellarboat.example.com',

  /**
   * Author/owner name (for meta tags, copyright, JSON-LD schema)
   */
  author: 'Your Name or Company',

  /**
   * Contact email (displayed in footer, used in form fallback, meta tags)
   */
  contactEmail: 'hello@example.com',

  /**
   * [OPTIONAL] Social media links
   * Used to generate social meta tags and footer links
   */
  social: {
    twitter: 'https://twitter.com/yourhandle',
    github: 'https://github.com/yourname',
    linkedin: 'https://linkedin.com/company/yourcompany',
    // Add more: instagram, youtube, etc.
  },

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Google Tag Manager configuration.
   * Set gtmId to null to disable GTM entirely.
   */
  analytics: {
    /**
     * Your GTM Container ID.
     * Get this from: https://tagmanager.google.com → your account → container ID
     * Format: "GTM-XXXXXX"
     * Set to null to disable GTM.
     */
    gtmId: null, // Change to your GTM ID, e.g. 'GTM-XXXXXX'

    /**
     * Enable GDPR consent mode v2.
     * When true:
     * - GTM waits for consent before firing tags
     * - A consent banner is shown to users
     * - Users can accept/decline analytics and marketing tags
     * Set to false to load GTM immediately.
     */
    consentMode: false,

    /**
     * [OPTIONAL] Custom tag attributes for GTM dataLayer
     * Example: { environment: 'production', cmsVersion: '1.0' }
     */
    customAttributes: {},
  },

  // ============================================================================
  // FORMS
  // ============================================================================

  /**
   * Forms configuration (default backend, Web3Forms key, etc.)
   */
  forms: {
    /**
     * Default form backend.
     * Options:
     * - 'web3forms' — free, no backend required (sign up at https://web3forms.com)
     * - 'netlify' — Netlify form handling (deployed on netlify.com)
     * - 'api' — custom API endpoint (set apiUrl below)
     * - 'formspree' — community adapter (set formspreeEndpoint below)
     * - 'formspark' — community adapter (set formsparProjectId below)
     *
     * Individual form components can override this with a `backend` prop.
     */
    defaultBackend: 'web3forms',

    /**
     * Web3Forms access key (required if defaultBackend is 'web3forms').
     * Get from: https://web3forms.com → dashboard → API key
     * [OPTIONAL if using different backend]
     */
    web3formsKey: undefined, // Change to your API key

    /**
     * API endpoint for 'api' backend.
     * [OPTIONAL if using different backend]
     * Example: 'https://your-api.com/forms/submit'
     */
    apiUrl: undefined,

    /**
     * Formspree endpoint URL for 'formspree' backend.
     * [OPTIONAL if using different backend]
     * Get from: https://formspree.io → new form
     */
    formspreeEndpoint: undefined,

    /**
     * Formspark project ID for 'formspark' backend.
     * [OPTIONAL if using different backend]
     * Get from: https://formspark.io → project settings
     */
    formsparProjectId: undefined,

    /**
     * [OPTIONAL] Enable reCAPTCHA spam protection on forms
     * Requires reCAPTCHA v3 site key from https://www.google.com/recaptcha/admin
     */
    recaptchaEnabled: false,
    recaptchaSiteKey: undefined,
  },

  // ============================================================================
  // FEATURES
  // ============================================================================

  /**
   * Feature flags for conditional rendering.
   * Set to false to disable entire subsystems (pages won't be generated).
   */
  features: {
    /**
     * Enable blog system (blog index, individual posts, tags, RSS, etc.)
     */
    blog: true,

    /**
     * Enable RSS/Atom feed generation at /rss.xml
     * (requires blog: true)
     */
    rss: true,

    /**
     * Enable demo site pages (/demo/*, design tokens, component showcase)
     * Safe to disable in forks.
     */
    demo: false,

    /**
     * Enable pricing page component
     * (Pricing section component still renders if explicitly included)
     */
    pricing: false,

    /**
     * Enable testimonials section
     * (still optional per component usage)
     */
    testimonials: true,
  },
};
