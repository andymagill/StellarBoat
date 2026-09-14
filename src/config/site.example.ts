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
   * Forms configuration.
   *
   * Forms POST as JSON to a Cloudflare Worker endpoint (`worker/`), which
   * gates submissions (honeypot, rate limit, Turnstile) and forwards
   * valid ones to a Google Apps Script web app that appends a row to a
   * Google Sheet and emails a notification. See DEPLOYMENT.md#form-worker.
   */
  forms: {
    /**
     * Form submission endpoint. '/api/forms' is handled by the Worker
     * in this repo; individual form components can override this with
     * an `endpoint` prop.
     */
    endpoint: '/api/forms',

    /**
     * Cloudflare Turnstile site key (public — safe to commit).
     * Get from: https://dash.cloudflare.com → Turnstile → your site.
     * [OPTIONAL in local dev — falls back to Turnstile's test sitekey]
     */
    turnstileSiteKey: undefined, // Change to your Turnstile site key
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
     * Enable demo/showcase pages (showcase, ui, forms, blog).
     * On the upstream site, these are production marketing pages and are indexed in the sitemap.
     * In forks, set to false and delete src/pages/showcase.astro, src/pages/ui.astro,
     * and src/pages/forms.astro. Also restore the sitemap filter in astro.config.mjs.
     */
    demo: true,

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
