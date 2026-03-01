/**
 * Global type augmentations for browser APIs used in the application.
 */

/**
 * Google Tag Manager dataLayer and gtag function.
 * Used for analytics and consent mode tracking.
 */
declare global {
  interface Window {
    /**
     * Google Tag Manager data layer.
     * Referenced by Analytics.astro and CookieBanner.astro.
     */
    dataLayer: Record<string, unknown>[];

    /**
     * Google Tag Manager gtag function.
     * Used for pushing events and consent updates to GTM.
     */
    gtag: (...args: unknown[]) => void;
  }
}

export {};
