/**
 * Cloudflare Turnstile server-side verification.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface SiteverifyResponse {
  success: boolean;
  hostname?: string;
  'error-codes'?: string[];
  challenge_ts?: string;
  action?: string;
}

export interface TurnstileVerifyResult {
  ok: boolean;
  errorCode?: string;
}

/**
 * Verify a Turnstile token. Tokens are single-use and expire 300s after
 * issue — a `timeout-or-duplicate` error code means the token was already
 * consumed (e.g. a retried submit), not necessarily an attack.
 *
 * `expectedHostname` is checked against the response's `hostname` field
 * so a token solved on another site can't be replayed against this one.
 */
export async function verifyTurnstileToken(
  secret: string,
  token: string,
  remoteIp: string | undefined,
  expectedHostname: string
): Promise<TurnstileVerifyResult> {
  if (!token) {
    return { ok: false, errorCode: 'missing-input-response' };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  let response: Response;
  try {
    response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return { ok: false, errorCode: 'siteverify-unreachable' };
  }

  if (!response.ok) {
    return { ok: false, errorCode: 'siteverify-error' };
  }

  const result = (await response.json()) as SiteverifyResponse;

  if (!result.success) {
    return {
      ok: false,
      errorCode: result['error-codes']?.[0] || 'verification-failed',
    };
  }

  if (result.hostname && result.hostname !== expectedHostname) {
    return { ok: false, errorCode: 'hostname-mismatch' };
  }

  return { ok: true };
}
