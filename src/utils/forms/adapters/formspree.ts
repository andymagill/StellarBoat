/* eslint-disable no-undef */
import type { FormAdapter, ResolvedFormConfig } from '../../../types/forms';

/**
 * Formspree adapter (community-maintained).
 * @see https://formspree.io
 *
 * Sends form data to Formspree endpoint.
 * Free tier: 50 submissions/month
 * Requires formspreeEndpoint in your forms config.
 *
 * @example
 * ```typescript
 * // In src/config/forms.ts:
 * {
 *   defaultBackend: 'formspree',
 *   formspreeEndpoint: 'https://formspree.io/f/your-form-id'
 * }
 * // or per-form:
 * <ContactForm backend="formspree" formspreeEndpoint="https://formspree.io/f/xyz123" />
 * ```
 *
 * @note This adapter is maintained by the community. For support, check Formspree docs.
 */
export const formspreeAdapter: FormAdapter = {
  async submit(
    data: Record<string, string>,
    config: ResolvedFormConfig
  ): Promise<{ ok: boolean; error?: string }> {
    if (!config.formspreeEndpoint) {
      return {
        ok: false,
        error:
          'Formspree endpoint is required. Set formspreeEndpoint in your forms config. ' +
          'Get it from https://formspree.io → your form → API endpoint',
      };
    }

    try {
      const response = await fetch(config.formspreeEndpoint, {
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
          result.error ||
          `Formspree submission failed with status ${response.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
};
