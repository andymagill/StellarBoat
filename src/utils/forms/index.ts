import { forms } from '../../config/forms';
import { web3FormsAdapter } from './adapters/web3forms';
import type { ResolvedFormConfig } from '../../types/forms';

/**
 * Submit form data using Web3Forms adapter.
 *
 * Merges global forms config with per-component overrides,
 * and submits the form data to Web3Forms.
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
 */
export async function submitForm(
  data: Record<string, string>,
  overrides?: Partial<ResolvedFormConfig>
): Promise<{ ok: boolean; error?: string }> {
  // Merge global config with per-component overrides
  const resolvedConfig: ResolvedFormConfig = {
    ...forms,
    ...overrides,
    backend: 'web3forms',
  };

  // Call Web3Forms adapter
  return web3FormsAdapter.submit(data, resolvedConfig);
}
