import type { FormAdapter, ResolvedFormConfig } from '../../../types/forms';

/**
 * Netlify Forms adapter (NOT YET IMPLEMENTED)
 * @see https://www.netlify.com/products/forms/
 *
 * To implement: integrate with Netlify's form handling API
 * and hook into the Netlify build system.
 *
 * For now, this adapter throws a clear error to prevent silent failures.
 * If you need Netlify Forms support, please submit a GitHub issue or PR.
 */
export const netlifyAdapter: FormAdapter = {
  async submit(
    _data: Record<string, string>,
    _config: ResolvedFormConfig
  ): Promise<{ ok: boolean; error?: string }> {
    throw new Error(
      'Netlify Forms adapter is not yet implemented. ' +
        'See ARCHITECTURE.md#form-adapters for alternatives or implement this adapter. ' +
        'PR contributions welcome!'
    );
  },
};
