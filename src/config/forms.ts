import type { FormsConfig } from '../types/config';

/**
 * Global forms configuration.
 * This config controls which form backend is used by default, API keys, and endpoint URLs.
 *
 * Individual form components can override this backend with a `backend` prop:
 * ```astro
 * <ContactForm backend="api" apiUrl="https://api.mysite.com/submit" />
 * ```
 *
 * Supported backends:
 * - `web3forms` — Free, no backend required. Requires `web3formsKey` from https://web3forms.com
 * - `netlify` — Netlify form handling (detection-based, works on Netlify deploys only)
 * - `api` — Custom API endpoint. Requires `apiUrl`
 * - `formspree` — Community addon. Requires `formspreeEndpoint` from https://formspree.io
 * - `formspark` — Community addon. Requires `formsparProjectId` from https://formspark.io
 */
export const forms: FormsConfig = {
  /**
   * Default form backend for all forms on the site.
   * Can be overridden per-form instance via the `backend` prop.
   */
  defaultBackend: 'web3forms',

  /**
   * Web3Forms API access key.
   * Only used when `defaultBackend` is 'web3forms' or a form overrides to backend='web3forms'.
   * Get from: https://web3forms.com → Dashboard → Copy your Access Key
   * Leave undefined if not using Web3Forms.
   */
  web3formsKey: undefined,

  /**
   * Custom API endpoint URL for the 'api' backend.
   * Only used when `defaultBackend` is 'api' or a form overrides to backend='api'.
   * The API should accept a POST request with JSON body:
   * { name, email, message, ... } and return { ok: true } or { ok: false, error: string }
   * Leave undefined if not using the api backend.
   */
  apiUrl: undefined,

  /**
   * Formspree form endpoint URL.
   * Only used when `defaultBackend` is 'formspree' or a form overrides to backend='formspree'.
   * Get from: https://formspree.io → Create New Form → Copy endpoint
   * Example: https://formspree.io/f/xyzabc123
   * Community-maintained. Leave undefined if not using Formspree.
   */
  formspreeEndpoint: undefined,

  /**
   * Formspark project ID.
   * Only used when `defaultBackend` is 'formspark' or a form overrides to backend='formspark'.
   * Get from: https://formspark.io → Project Settings → Copy Project ID
   * Community-maintained. Leave undefined if not using Formspark.
   */
  formsparProjectId: undefined,

  /**
   * Enable reCAPTCHA v3 spam protection.
   * Adds an invisible reCAPTCHA token to form submissions.
   * Requires `recaptchaSiteKey` (v3).
   * Get reCAPTCHA credentials from: https://www.google.com/recaptcha/admin
   */
  recaptchaEnabled: false,

  /**
   * reCAPTCHA site key (v3, public).
   * Only used when `recaptchaEnabled` is true.
   * Get from: https://www.google.com/recaptcha/admin → your site → copy Site Key
   */
  recaptchaSiteKey: undefined,
};
