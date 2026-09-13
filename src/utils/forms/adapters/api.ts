import type { FormAdapter, ResolvedFormConfig } from '../../../types/forms';

/**
 * Generic API adapter (NOT YET IMPLEMENTED)
 * For custom API endpoints that handle form submissions.
 *
 * To implement: add a `apiEndpoint` field to the forms config
 * and POST the form data to that endpoint.
 *
 * For now, this adapter throws a clear error to prevent silent failures.
 * If you need generic API support, please submit a GitHub issue or PR.
 */
export const apiAdapter: FormAdapter = {
  async submit(
    _data: Record<string, string>,
    _config: ResolvedFormConfig
  ): Promise<{ ok: boolean; error?: string }> {
    throw new Error(
      'Generic API adapter is not yet implemented. ' +
        'See ARCHITECTURE.md#form-adapters for alternatives or implement this adapter. ' +
        'PR contributions welcome!'
    );
  },
};
