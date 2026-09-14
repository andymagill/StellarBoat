/**
 * Worker environment bindings used by the forms pipeline.
 *
 * `Env` (from the generated `worker/worker-configuration.d.ts`) only
 * covers bindings declared in `wrangler.jsonc` — the secrets below are
 * set out-of-band with `wrangler secret put` (or the Dashboard) and
 * never appear in that file, so they're declared here by hand.
 * Keep this in sync with `wrangler.jsonc`'s secrets comment and
 * `.dev.vars.example`.
 */
export interface FormsEnv extends Env {
  /** Turnstile secret key — from Cloudflare dashboard → Turnstile → your site. */
  TURNSTILE_SECRET_KEY: string;

  /** The Apps Script web app's /exec URL. */
  APPS_SCRIPT_URL: string;

  /** Shared HMAC secret; must match the Apps Script's HMAC_SECRET Script Property. */
  APPS_SCRIPT_HMAC_SECRET: string;

  /**
   * When 'true', the Worker runs every gate and validation step but skips
   * the Apps Script call, returning success without writing anywhere.
   * Leave unset in production.
   */
  FORMS_DRY_RUN?: string;
}
