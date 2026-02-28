/* eslint-disable no-undef */
import type { FormAdapter, ResolvedFormConfig } from '../../../types/forms';

/**
 * Formspark adapter (community-maintained).
 * @see https://formspark.io
 *
 * Sends form data to Formspark backend.
 * Free tier: 250 submissions/month
 * Requires formsparProjectId in your forms config.
 *
 * @example
 * ```typescript
 * // In src/config/forms.ts:
 * {
 *   defaultBackend: 'formspark',
 *   formsparProjectId: 'your-project-id'
 * }
 * // or per-form:
 * <ContactForm backend="formspark" formsparProjectId="xyz123" />
 * ```
 *
 * @note This adapter is maintained by the community. For support, check Formspark docs.
 */
export const formsparAdapter: FormAdapter = {
  async submit(
    data: Record<string, string>,
    config: ResolvedFormConfig
  ): Promise<{ ok: boolean; error?: string }> {
    if (!config.formsparProjectId) {
      return {
        ok: false,
        error:
          'Formspark project ID is required. Set formsparProjectId in your forms config. ' +
          'Get it from https://formspark.io → Project Settings → copy Project ID',
      };
    }

    try {
      const response = await fetch('https://submit-form.com/formsparkapi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: config.formsparProjectId,
          ...data,
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (response.ok && result.success) {
        return { ok: true };
      }

      return {
        ok: false,
        error:
          result.error ||
          `Formspark submission failed with status ${response.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
};
