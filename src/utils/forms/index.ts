import { forms } from '../../config/forms';
import { web3FormsAdapter } from './adapters/web3forms';
import { apiAdapter } from './adapters/api';
import { formspreeAdapter } from './adapters/formspree';
import { formsparkAdapter } from './adapters/formspark';
import type { ResolvedFormConfig } from '../../types/forms';
import type { FormAdapter } from '../../types/forms';

/**
 * Submit form data using the configured backend adapter.
 *
 * Merges global forms config with per-component overrides,
 * then delegates to the appropriate form backend adapter.
 *
 * @param data - Form field data (typically { name, email, message } etc.)
 * @param overrides - Per-component overrides (web3formsKey, recaptcha settings, etc.)
 * @returns Promise resolving to { ok: true } on success, { ok: false, error: string } on failure
 *
 * @example
 * ```typescript
 * // In a form component's <script> block:
 * import { submitForm } from '../utils/forms';
 *
 * const result = await submitForm(
 *   { name: 'John', email: 'john@example.com', message: 'Hello' },
 *   { web3formsKey: 'your-key-here' }
 * );
 *
 * if (result.ok) {
 *   // Show success message
 * } else {
 *   // Show error: result.error
 * }
 * ```
 *
 * Supported backends:
 * - web3forms (implemented)
 * - api (stub — throws NotImplementedError)
 * - formspree (stub — throws NotImplementedError)
 * - formspark (stub — throws NotImplementedError)
 *
 * To implement a stub adapter, see ARCHITECTURE.md#form-adapters.
 */
export async function submitForm(
  data: Record<string, string>,
  overrides?: Partial<ResolvedFormConfig>
): Promise<{ ok: boolean; error?: string }> {
  // Merge global config with per-component overrides
  const resolvedConfig: ResolvedFormConfig = {
    ...forms,
    ...overrides,
    backend: overrides?.backend || forms.defaultBackend,
  };

  // Select adapter based on configured backend
  const adapter = getAdapter(resolvedConfig.backend);

  try {
    return await adapter.submit(data, resolvedConfig);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown form submission error';
    return { ok: false, error: errorMessage };
  }
}

/**
 * Get the adapter for the specified backend.
 * Throws if backend is not recognized.
 */
function getAdapter(backend: string): FormAdapter {
  switch (backend) {
    case 'web3forms':
      return web3FormsAdapter;
    case 'api':
      return apiAdapter;
    case 'formspree':
      return formspreeAdapter;
    case 'formspark':
      return formsparkAdapter;
    default:
      throw new Error(
        `Unknown form backend: "${backend}". ` +
          'Supported backends: web3forms, api, formspree, formspark. ' +
          'See ARCHITECTURE.md#form-adapters for more info.'
      );
  }
}
