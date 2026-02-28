/* eslint-disable no-undef */
import type { FormAdapter, ResolvedFormConfig } from '../../../types/forms';

/**
 * Generic API adapter.
 *
 * Sends form data as JSON to a custom endpoint (Cloudflare Worker, Vercel Function, etc.)
 * Configure the endpoint URL in your forms config:
 *
 * ```typescript
 * // In src/config/forms.ts or via component prop override:
 * apiUrl: 'https://api.mysite.com/submit'
 * // or site-wide:
 * defaultBackend: 'api'
 * apiUrl: 'https://api.mysite.com/submit'
 * ```
 *
 * Your endpoint should accept POST with JSON body and return:
 * ```json
 * { "ok": true }  // success
 * { "ok": false, "error": "message" }  // failure
 * ```
 */
export const apiAdapter: FormAdapter = {
  async submit(
    data: Record<string, string>,
    config: ResolvedFormConfig
  ): Promise<{ ok: boolean; error?: string }> {
    if (!config.apiUrl) {
      return {
        ok: false,
        error: 'API endpoint URL is required. Set apiUrl in your forms config.',
      };
    }

    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (response.ok && result.ok) {
        return { ok: true };
      }

      return {
        ok: false,
        error:
          result.error || `API request failed with status ${response.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
};
