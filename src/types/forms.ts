/**
 * Forms type definitions and adapters.
 *
 * Defines the contract for form submission adapters (Web3Forms, Netlify, custom API, etc.)
 * and the resolved form configuration that results from merging global config + per-component overrides.
 */

import type { FormsConfig } from './config';

/**
 * Form submission adapter interface.
 * Every backend (web3forms, netlify, api, formspree, formspark) implements this contract.
 */
export interface FormAdapter {
  /**
   * Submit form data to the backend.
   * @param data - Form field data (typically { name, email, message } etc.)
   * @param config - Resolved form configuration (merged global + per-component overrides)
   * @returns Promise resolving to { ok: true } on success, { ok: false, error: string } on failure
   */
  submit(
    data: Record<string, string>,
    config: ResolvedFormConfig
  ): Promise<{ ok: boolean; error?: string }>;
}

/**
 * Resolved form configuration after merging global config with per-component prop overrides.
 * Used internally by adapters to determine endpoint, auth keys, etc.
 */
export interface ResolvedFormConfig extends FormsConfig {
  /** The resolved backend name after merging global + overrides */
  backend: 'web3forms' | 'netlify' | 'api' | 'formspree' | 'formspark';

  /** Resolved action URL (for 'api', 'formspree', 'formspark' backends) */
  actionUrl?: string;

  /** Resolved access key / endpoint based on backend */
  accessKey?: string;

  /** Additional backend-specific metadata */
  metadata?: Record<string, unknown>;
}
