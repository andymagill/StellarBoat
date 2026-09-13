import type { FormAdapter, ResolvedFormConfig } from '../../../types/forms';

/**
 * Formspree adapter (NOT YET IMPLEMENTED)
 * @see https://formspree.io
 *
 * To implement: integrate with Formspree's form submission API
 * and handle submission to Formspree endpoints.
 *
 * For now, this adapter throws a clear error to prevent silent failures.
 * If you need Formspree support, please submit a GitHub issue or PR.
 */
export const formspreeAdapter: FormAdapter = {
  async submit(
    _data: Record<string, string>,
    _config: ResolvedFormConfig
  ): Promise<{ ok: boolean; error?: string }> {
    throw new Error(
      'Formspree adapter is not yet implemented. ' +
        'See ARCHITECTURE.md#form-adapters for alternatives or implement this adapter. ' +
        'PR contributions welcome!'
    );
  },
};
