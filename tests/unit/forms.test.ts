import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the config
vi.mock('../../src/config/forms', () => ({
  forms: {
    backend: 'web3forms',
    web3formsKey: 'global-key-123',
    recaptcha: {
      enabled: false,
    },
  },
}));

// Mock web3forms adapter - define the submit mock inside the factory
vi.mock('../../src/utils/forms/adapters/web3forms', async () => {
  return {
    web3FormsAdapter: {
      submit: vi.fn(),
    },
  };
});

// Now we can import the function we're testing
import { submitForm } from '../../src/utils/forms';
import { web3FormsAdapter } from '../../src/utils/forms/adapters/web3forms';

describe('forms/index.ts', () => {
  describe('submitForm()', () => {
    beforeEach(() => {
      vi.mocked(web3FormsAdapter.submit).mockReset();
    });

    it('submits form with global config', async () => {
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

    it('forces backend to web3forms', async () => {
      const data = { email: 'test@example.com' };
      vi.mocked(web3FormsAdapter.submit).mockResolvedValue({ ok: true });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await submitForm(data, { backend: 'api' as any });

      // Verify that backend is forced to 'web3forms'
      const callArgs = vi.mocked(web3FormsAdapter.submit).mock.calls[0][1];
      expect(callArgs.backend).toBe('web3forms');
      expect(result).toEqual({ ok: true });
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

    it('handles empty overrides', async () => {
      const data = { name: 'Test' };
      vi.mocked(web3FormsAdapter.submit).mockResolvedValue({ ok: true });

      const result = await submitForm(data, {});

      expect(vi.mocked(web3FormsAdapter.submit)).toHaveBeenCalled();
      expect(result).toEqual({ ok: true });
    });
  });
});
