import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleFormSubmission } from './handler';
import type { FormsEnv } from './types';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/test-deployment/exec';

function makeEnv(overrides: Partial<FormsEnv> = {}): FormsEnv {
  return {
    ASSETS: { fetch: vi.fn() },
    FORM_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    TURNSTILE_SECRET_KEY: 'test-turnstile-secret',
    APPS_SCRIPT_URL,
    APPS_SCRIPT_HMAC_SECRET: 'test-hmac-secret',
    ...overrides,
  } as unknown as FormsEnv;
}

function jsonRequest(
  body: unknown,
  opts: { accept?: string | null; ip?: string } = {}
): Request {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (opts.accept !== null) headers.Accept = opts.accept ?? 'application/json';
  if (opts.ip !== undefined) headers['CF-Connecting-IP'] = opts.ip;
  else headers['CF-Connecting-IP'] = '203.0.113.1';

  return new Request('https://example.com/api/forms', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

function stubFetch(
  opts: {
    turnstileSuccess?: boolean;
    hostname?: string;
    appsScriptOk?: boolean;
    appsScriptStatus?: number;
  } = {}
) {
  const {
    turnstileSuccess = true,
    hostname = 'example.com',
    appsScriptOk = true,
    appsScriptStatus = 200,
  } = opts;

  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as Request).url;

    if (url.startsWith('https://challenges.cloudflare.com')) {
      return new Response(
        JSON.stringify({ success: turnstileSuccess, hostname }),
        { status: 200 }
      );
    }
    if (url.startsWith(APPS_SCRIPT_URL)) {
      return new Response(
        JSON.stringify({ ok: appsScriptOk, id: 'script-id' }),
        {
          status: appsScriptStatus,
        }
      );
    }
    throw new Error(`Unexpected fetch to ${url}`);
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const validContactBody = {
  formType: 'contact',
  fields: {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Hello, testing this out.',
  },
  turnstileToken: 'valid-token',
};

beforeEach(() => {
  stubFetch();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('handleFormSubmission', () => {
  it('rejects non-POST methods', async () => {
    const request = new Request('https://example.com/api/forms', {
      method: 'GET',
    });
    const response = await handleFormSubmission(request, makeEnv());
    expect(response.status).toBe(405);
  });

  it('rejects a malformed body', async () => {
    const request = new Request('https://example.com/api/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: 'not json',
    });
    const response = await handleFormSubmission(request, makeEnv());
    expect(response.status).toBe(400);
    const body = (await response.json()) as { ok: boolean };
    expect(body.ok).toBe(false);
  });

  it('returns fake success for a filled honeypot without checking rate limit or Turnstile', async () => {
    const env = makeEnv();
    const fetchMock = stubFetch();
    const request = jsonRequest({
      ...validContactBody,
      website: 'http://spam.example',
    });

    const response = await handleFormSubmission(request, env);

    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok: boolean };
    expect(body.ok).toBe(true);
    expect(env.FORM_RATE_LIMITER.limit).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 429 when the rate limiter rejects the request', async () => {
    const env = makeEnv({
      FORM_RATE_LIMITER: {
        limit: vi.fn().mockResolvedValue({ success: false }),
      } as never,
    });
    const request = jsonRequest(validContactBody);

    const response = await handleFormSubmission(request, env);

    expect(response.status).toBe(429);
  });

  it('returns field errors for an invalid submission', async () => {
    const request = jsonRequest({
      formType: 'contact',
      fields: { name: 'A', email: 'not-an-email', message: 'short' },
      turnstileToken: 'valid-token',
    });

    const response = await handleFormSubmission(request, makeEnv());

    expect(response.status).toBe(400);
    const body = (await response.json()) as {
      ok: boolean;
      fieldErrors?: Record<string, string>;
    };
    expect(body.ok).toBe(false);
    expect(body.fieldErrors?.name).toBeTruthy();
    expect(body.fieldErrors?.email).toBeTruthy();
    expect(body.fieldErrors?.message).toBeTruthy();
  });

  it('returns a JS-required error when no Turnstile token is present', async () => {
    const request = jsonRequest({ ...validContactBody, turnstileToken: '' });

    const response = await handleFormSubmission(request, makeEnv());

    expect(response.status).toBe(400);
    const body = (await response.json()) as { ok: boolean; error?: string };
    expect(body.error).toMatch(/javascript/i);
  });

  it('redirects to /form-error?reason=js for a native POST with no token', async () => {
    const request = jsonRequest(
      { ...validContactBody, turnstileToken: '' },
      { accept: null }
    );

    const response = await handleFormSubmission(request, makeEnv());

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toContain('/form-error?reason=js');
  });

  it('returns 403 when Turnstile verification fails', async () => {
    stubFetch({ turnstileSuccess: false });
    const request = jsonRequest(validContactBody);

    const response = await handleFormSubmission(request, makeEnv());

    expect(response.status).toBe(403);
  });

  it('returns 403 when the Turnstile hostname does not match the request', async () => {
    stubFetch({ hostname: 'attacker.example' });
    const request = jsonRequest(validContactBody);

    const response = await handleFormSubmission(request, makeEnv());

    expect(response.status).toBe(403);
  });

  it('succeeds and forwards to Apps Script on a fully valid submission', async () => {
    const fetchMock = stubFetch();
    const request = jsonRequest(validContactBody);

    const response = await handleFormSubmission(request, makeEnv());

    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok: boolean; id?: string };
    expect(body.ok).toBe(true);
    expect(body.id).toBeTruthy();

    const appsScriptCall = fetchMock.mock.calls.find(([input]) =>
      String(input).startsWith(APPS_SCRIPT_URL)
    );
    expect(appsScriptCall).toBeTruthy();
  });

  it('redirects to /thank-you on a fully valid native (no-JS-capable-of-JSON) POST', async () => {
    // Turnstile still requires JS to produce a token in practice, but the
    // response-negotiation path is exercised independently here.
    const request = jsonRequest(validContactBody, { accept: null });

    const response = await handleFormSubmission(request, makeEnv());

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toContain(
      '/thank-you?form=contact'
    );
  });

  it('returns 502 when Apps Script reports failure', async () => {
    stubFetch({ appsScriptOk: false });
    const request = jsonRequest(validContactBody);

    const response = await handleFormSubmission(request, makeEnv());

    expect(response.status).toBe(502);
  });

  it('returns 502 when Apps Script is unreachable', async () => {
    stubFetch({ appsScriptStatus: 500 });
    const request = jsonRequest(validContactBody);

    const response = await handleFormSubmission(request, makeEnv());

    expect(response.status).toBe(502);
  });

  it('skips the Apps Script call and returns success when FORMS_DRY_RUN is true', async () => {
    const fetchMock = stubFetch();
    const env = makeEnv({ FORMS_DRY_RUN: 'true' });
    const request = jsonRequest(validContactBody);

    const response = await handleFormSubmission(request, env);

    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok: boolean };
    expect(body.ok).toBe(true);

    const appsScriptCall = fetchMock.mock.calls.find(([input]) =>
      String(input).startsWith(APPS_SCRIPT_URL)
    );
    expect(appsScriptCall).toBeUndefined();
  });
});
