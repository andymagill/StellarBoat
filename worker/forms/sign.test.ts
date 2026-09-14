import { describe, it, expect } from 'vitest';
import { signEnvelope } from './sign';

describe('signEnvelope', () => {
  it('matches the Apps Script HMAC implementation (apps-script/Code.gs selfTest)', async () => {
    // Fixed test vector shared with apps-script/Code.gs's selfTest() —
    // both implementations must produce this exact signature, or a real
    // submission signed by the Worker would be rejected by the script.
    const secret = 'test-secret';
    const ts = 1700000000;
    const nonce = 'test-nonce-id';
    const payload = '{"formType":"contact","fields":{"name":"Ada Lovelace"}}';

    const signature = await signEnvelope(secret, ts, nonce, payload);

    expect(signature).toBe(
      '55714ef3a695539d86f08c9f4daebd314e1b748def0e140a7c42b5e8417ba059'
    );
  });

  it('produces a 64-character hex string', async () => {
    const signature = await signEnvelope('secret', 1700000000, 'nonce', '{}');
    expect(signature).toMatch(/^[0-9a-f]{64}$/);
  });

  it('changes when any input changes', async () => {
    const base = await signEnvelope('secret', 1700000000, 'nonce', '{"a":1}');
    const diffSecret = await signEnvelope(
      'other',
      1700000000,
      'nonce',
      '{"a":1}'
    );
    const diffTs = await signEnvelope('secret', 1700000001, 'nonce', '{"a":1}');
    const diffNonce = await signEnvelope(
      'secret',
      1700000000,
      'nonce2',
      '{"a":1}'
    );
    const diffPayload = await signEnvelope(
      'secret',
      1700000000,
      'nonce',
      '{"a":2}'
    );

    expect(diffSecret).not.toBe(base);
    expect(diffTs).not.toBe(base);
    expect(diffNonce).not.toBe(base);
    expect(diffPayload).not.toBe(base);
  });
});
