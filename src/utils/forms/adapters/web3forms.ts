/* eslint-disable no-undef */
import type { FormAdapter, ResolvedFormConfig } from '../../../types/forms';

/**
 * Web3Forms adapter
 * @see https://web3forms.com
 *
 * Free form backend with no setup required.
 * Sends a POST request to Web3Forms API with the form data + access key.
 */
export const web3FormsAdapter: FormAdapter = {
  async submit(
    data: Record<string, string>,
    config: ResolvedFormConfig
  ): Promise<{ ok: boolean; error?: string }> {
    if (!config.web3formsKey) {
      return {
        ok: false,
        error:
          'Web3Forms access key is required. Set web3formsKey in your forms config.',
      };
    }

    try {
      const formData = new FormData();

      // Add all form data fields
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Add Web3Forms-specific fields
      formData.append('access_key', config.web3formsKey);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (response.ok && result.success) {
        return { ok: true };
      }

      return {
        ok: false,
        error: result.message || 'Form submission failed',
      };
    } catch (error) {
      return {
        ok: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
};
