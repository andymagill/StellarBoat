import { forms } from '../../config/forms';
import { web3FormsAdapter } from './adapters/web3forms';
import { netlifyAdapter } from './adapters/netlify';
import { apiAdapter } from './adapters/api';
import { formspreeAdapter } from './adapters/formspree';
import { formsparAdapter } from './adapters/formspark';
import type { FormsConfig } from '../../types/config';
import type { ResolvedFormConfig } from '../../types/forms';

/**
 * Submit form data using the configured backend adapter.
 *
 * Merges global forms config with per-component overrides, selects the appropriate adapter,
 * and submits the form data.
 *
 * @param data - Form field data (typically { name, email, message } etc.)
 * @param overrides - Per-component backend overrides (backend name, apiUrl, etc.)
 * @returns Promise resolving to { ok: true } on success, { ok: false, error: string } on failure
 *
 * @example
 * ```typescript
 * // In a form component's <script> block:
 * import { submitForm } from '../utils/forms';
 *
 * const result = await submitForm(
 *   { name: 'John', email: 'john@example.com', message: 'Hello' },
 *   { backend: 'api', apiUrl: 'https://my-api.com/submit' }
 * );
 *
 * if (result.ok) {
 *   // Show success message
 * } else {
 *   // Show error: result.error
 * }
 * ```
 */
export async function submitForm(
  data: Record<string, string>,
  overrides?: Partial<FormsConfig>
): Promise<{ ok: boolean; error?: string }> {
  // Merge global config with per-component overrides
  const resolvedConfig: ResolvedFormConfig = {
    ...forms,
    ...overrides,
    backend: (overrides?.defaultBackend ?? forms.defaultBackend) as
      | 'web3forms'
      | 'netlify'
      | 'api'
      | 'formspree'
      | 'formspark',
  };

  // Select adapter based on backend
  let adapter;
  switch (resolvedConfig.backend) {
    case 'web3forms':
      adapter = web3FormsAdapter;
      break;
    case 'netlify':
      adapter = netlifyAdapter;
      break;
    case 'api':
      adapter = apiAdapter;
      break;
    case 'formspree':
      adapter = formspreeAdapter;
      break;
    case 'formspark':
      adapter = formsparAdapter;
      break;
    default:
      return {
        ok: false,
        error: `Unknown form backend: ${resolvedConfig.backend}. Supported backends: web3forms, netlify, api, formspree, formspark.`,
      };
  }

  // Call the selected adapter
  return adapter.submit(data, resolvedConfig);
}
