import type { FormsConfig } from '../types/config';

/**
 * Global forms configuration.
 *
 * Forms POST as JSON to `endpoint`, a Cloudflare Worker route (see
 * `worker/forms/`) that gates submissions (honeypot, rate limit,
 * Turnstile) and forwards valid ones to a Google Apps Script web app,
 * which appends a row to a Google Sheet and emails a notification.
 *
 * See DEPLOYMENT.md#form-worker for setup and required secrets.
 */
export const forms: FormsConfig = {
  /**
   * Form submission endpoint. The default `/api/forms` is handled by
   * the Worker in this repo; per-component `endpoint` prop overrides
   * this for a single form instance.
   */
  endpoint: '/api/forms',

  /**
   * Cloudflare Turnstile site key (public — safe to commit).
   * Get from: https://dash.cloudflare.com → Turnstile → your site → Site Key.
   * Leave undefined in local dev to fall back to Turnstile's test sitekey
   * documented in `.dev.vars.example`.
   */
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY,
};
