import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the config
vi.mock('../../src/config/forms', () => ({
  forms: {
    defaultBackend: 'web3forms',
    web3formsKey: 'global-key-123',
    recaptcha: {
      enabled: false,
    },
  },
}));

// Mock all adapters
vi.mock('../../src/utils/forms/adapters/web3forms', async () => {
  return {
    web3FormsAdapter: {
      submit: vi.fn(),
    },
  };
});

vi.mock('../../src/utils/forms/adapters/netlify', async () => {
  return {
    netlifyAdapter: {
      submit: vi.fn(),
    },
  };
});

vi.mock('../../src/utils/forms/adapters/api', async () => {
  return {
    apiAdapter: {
      submit: vi.fn(),
    },
  };
});

vi.mock('../../src/utils/forms/adapters/formspree', async () => {
  return {
    formspreeAdapter: {
      submit: vi.fn(),
    },
  };
});

vi.mock('../../src/utils/forms/adapters/formspark', async () => {
  return {
    formsparkAdapter: {
      submit: vi.fn(),
    },
  };
});

// Now we can import the function we're testing
import { submitForm } from '../../src/utils/forms';
import { web3FormsAdapter } from '../../src/utils/forms/adapters/web3forms';
import { netlifyAdapter } from '../../src/utils/forms/adapters/netlify';
import { apiAdapter } from '../../src/utils/forms/adapters/api';
import { formspreeAdapter } from '../../src/utils/forms/adapters/formspree';
import { formsparkAdapter } from '../../src/utils/forms/adapters/formspark';

describe('forms/index.ts', () => {
  describe('submitForm()', () => {
    beforeEach(() => {
      vi.mocked(web3FormsAdapter.submit).mockReset();
      vi.mocked(netlifyAdapter.submit).mockReset();
      vi.mocked(apiAdapter.submit).mockReset();
      vi.mocked(formspreeAdapter.submit).mockReset();
      vi.mocked(formsparkAdapter.submit).mockReset();
    });

    it('submits form with global config using web3forms backend', async () => {
      const data = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hello',
      };
      vi.mocked(web3FormsAdapter.submit).mockResolvedValue({ ok: true });

      const result = await submitForm(data);

      expect(vi.mocked(web3FormsAdapter.submit)).toHaveBeenCalledWith(
        data,
        expect.objectContaining({
          backend: 'web3forms',
          web3formsKey: 'global-key-123',
        })
      );
      expect(result).toEqual({ ok: true });
    });

    it('merges overrides with global config', async () => {
      const data = { name: 'Jane', email: 'jane@example.com' };
      const overrides = { web3formsKey: 'override-key-456' };
      vi.mocked(web3FormsAdapter.submit).mockResolvedValue({ ok: true });

      const result = await submitForm(data, overrides);

      expect(vi.mocked(web3FormsAdapter.submit)).toHaveBeenCalledWith(
        data,
        expect.objectContaining({
          backend: 'web3forms',
          web3formsKey: 'override-key-456',
        })
      );
      expect(result).toEqual({ ok: true });
    });

    it('selects netlify adapter when backend is netlify', async () => {
      const data = { email: 'test@example.com' };
      vi.mocked(netlifyAdapter.submit).mockRejectedValue(
        new Error('Netlify Forms adapter is not yet implemented.')
      );

      const result = await submitForm(data, { backend: 'netlify' });

      expect(vi.mocked(netlifyAdapter.submit)).toHaveBeenCalled();
      expect(result.ok).toBe(false);
      expect(result.error).toContain('not yet implemented');
    });

    it('selects api adapter when backend is api', async () => {
      const data = { email: 'test@example.com' };
      vi.mocked(apiAdapter.submit).mockRejectedValue(
        new Error('Generic API adapter is not yet implemented.')
      );

      const result = await submitForm(data, { backend: 'api' });

      expect(vi.mocked(apiAdapter.submit)).toHaveBeenCalled();
      expect(result.ok).toBe(false);
      expect(result.error).toContain('not yet implemented');
    });

    it('selects formspree adapter when backend is formspree', async () => {
      const data = { email: 'test@example.com' };
      vi.mocked(formspreeAdapter.submit).mockRejectedValue(
        new Error('Formspree adapter is not yet implemented.')
      );

      const result = await submitForm(data, { backend: 'formspree' });

      expect(vi.mocked(formspreeAdapter.submit)).toHaveBeenCalled();
      expect(result.ok).toBe(false);
      expect(result.error).toContain('not yet implemented');
    });

    it('selects formspark adapter when backend is formspark', async () => {
      const data = { email: 'test@example.com' };
      vi.mocked(formsparkAdapter.submit).mockRejectedValue(
        new Error('Formspark adapter is not yet implemented.')
      );

      const result = await submitForm(data, { backend: 'formspark' });

      expect(vi.mocked(formsparkAdapter.submit)).toHaveBeenCalled();
      expect(result.ok).toBe(false);
      expect(result.error).toContain('not yet implemented');
    });

    it('returns error from adapter on failure', async () => {
      const data = { email: 'test@example.com' };
      vi.mocked(web3FormsAdapter.submit).mockResolvedValue({
        ok: false,
        error: 'Failed to submit form',
      });

      const result = await submitForm(data);

      expect(result).toEqual({
        ok: false,
        error: 'Failed to submit form',
      });
    });

    it('catches and returns adapter errors', async () => {
      const data = { email: 'test@example.com' };
      const errorMessage = 'Adapter threw an exception';
      vi.mocked(web3FormsAdapter.submit).mockRejectedValue(
        new Error(errorMessage)
      );

      const result = await submitForm(data);

      expect(result.ok).toBe(false);
      expect(result.error).toContain(errorMessage);
    });

    it('handles empty overrides', async () => {
      const data = { name: 'Test' };
      vi.mocked(web3FormsAdapter.submit).mockResolvedValue({ ok: true });

      const result = await submitForm(data, {});

      expect(vi.mocked(web3FormsAdapter.submit)).toHaveBeenCalled();
      expect(result).toEqual({ ok: true });
    });
  });
});
