/* eslint-disable no-undef */
import type { FormAdapter, ResolvedFormConfig } from '../../../types/forms';

/**
 * Netlify Forms adapter.
 * @see https://docs.netlify.com/forms/setup/
 *
 * Uses native Netlify form handling via POST to `/?no-cache=1` with a hidden `form-name` field.
 * Only works on Netlify deployments; warns if deploy is non-Netlify.
 *
 * Requires that a form exists in your Netlify site configuration.
 * @example
 * ```html
 * <form name="contact" method="POST" netlify>
 *   <input type="hidden" name="form-name" value="contact" />
 *   <!-- inputs -->
 * </form>
 * ```
 */
export const netlifyAdapter: FormAdapter = {
  async submit(
    data: Record<string, string>,
    _config: ResolvedFormConfig
  ): Promise<{ ok: boolean; error?: string }> {
    // Check if we're on Netlify
    const isNetlify =
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('netlify.app') ||
        window.location.hostname.includes('.netlify.com'));

    if (!isNetlify && typeof window !== 'undefined') {
      console.warn(
        '[Forms] Netlify adapter detected non-Netlify deployment. Forms will not be submitted. ' +
          'Ensure your site is deployed on Netlify, or switch to a different backend (web3forms, api, etc.)'
      );
    }

    try {
      const formData = new FormData();

      // Add all form data fields
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Netlify-specific: must include form-name field (matches <form name="...">)
      // We use a generic name since we don't know the actual form name at this point
      formData.append('form-name', 'contact');

      const response = await fetch('/?no-cache=1', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        return { ok: true };
      }

      return {
        ok: false,
        error: `Netlify form submission failed with status ${response.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
};
