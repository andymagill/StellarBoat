import type { FormAdapter, ResolvedFormConfig } from '../../../types/forms';

/**
 * Formspark adapter (NOT YET IMPLEMENTED)
 * @see https://formspark.io
 *
 * To implement: integrate with Formspark's form submission API
 * and handle submission to Formspark project endpoints.
 *
 * For now, this adapter throws a clear error to prevent silent failures.
 * If you need Formspark support, please submit a GitHub issue or PR.
 */
export const formsparkAdapter: FormAdapter = {
  async submit(
    _data: Record<string, string>,
    _config: ResolvedFormConfig
  ): Promise<{ ok: boolean; error?: string }> {
    throw new Error(
      'Formspark adapter is not yet implemented. ' +
        'See ARCHITECTURE.md#form-adapters for alternatives or implement this adapter. ' +
        'PR contributions welcome!'
    );
  },
};
