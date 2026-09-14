import {
  validateSubmission,
  isFormType,
  type FormType,
} from '../../src/utils/forms/schema';
import { verifyTurnstileToken } from './turnstile';
import { buildEnvelope, submitToAppsScript } from './apps-script';
import { jsonResponse, respondError, respondSuccess } from './respond';
import type { FormsEnv } from './types';

const MAX_BODY_BYTES = 32 * 1024;

interface ParsedBody {
  raw: Record<string, unknown>;
  turnstileToken: string;
}

/**
 * Parse either the JSON body the enhanced client sends, or the
 * urlencoded/multipart body a native (no-JS) form POST sends.
 * Returns null for anything else, or a body over the size cap.
 */
async function parseBody(request: Request): Promise<ParsedBody | null> {
  const contentType = request.headers.get('Content-Type') || '';

  if (contentType.includes('application/json')) {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return null;

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return null;
    }
    if (typeof json !== 'object' || json === null) return null;

    const body = json as Record<string, unknown>;
    const fields =
      typeof body.fields === 'object' && body.fields !== null
        ? (body.fields as Record<string, unknown>)
        : {};

    return {
      raw: { formType: body.formType, ...fields, website: body.website },
      turnstileToken:
        typeof body.turnstileToken === 'string' ? body.turnstileToken : '',
    };
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return null;
    }

    let size = 0;
    const raw: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        size += value.length;
        raw[key] = value;
      }
    });
    if (size > MAX_BODY_BYTES) return null;

    return {
      raw,
      turnstileToken:
        typeof raw['cf-turnstile-response'] === 'string'
          ? (raw['cf-turnstile-response'] as string)
          : '',
    };
  }

  return null;
}

function isHoneypotFilled(raw: Record<string, unknown>): boolean {
  return typeof raw.website === 'string' && raw.website.trim() !== '';
}

export async function handleFormSubmission(
  request: Request,
  env: FormsEnv
): Promise<Response> {
  const requestUrl = new URL(request.url);

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'method-not-allowed' }, 405);
  }

  const parsed = await parseBody(request);
  if (!parsed) {
    return respondError(
      request,
      requestUrl,
      400,
      'invalid',
      'Malformed request.'
    );
  }

  const formTypeValue = parsed.raw.formType;
  const formTypeForRedirect =
    typeof formTypeValue === 'string' ? formTypeValue : 'unknown';

  // Honeypot: bots fill every field, real visitors never see this one.
  // Pretend success without touching the rate limiter, Turnstile, or Apps Script.
  if (isHoneypotFilled(parsed.raw)) {
    return respondSuccess(
      request,
      requestUrl,
      crypto.randomUUID(),
      formTypeForRedirect
    );
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const { success: withinLimit } = await env.FORM_RATE_LIMITER.limit({
    key: `forms:${ip}`,
  });
  if (!withinLimit) {
    return respondError(
      request,
      requestUrl,
      429,
      'rate',
      'Too many submissions. Please try again in a minute.'
    );
  }

  const validation = validateSubmission(formTypeValue, parsed.raw);
  if (!validation.ok) {
    if (!isFormType(formTypeValue)) {
      return respondError(request, requestUrl, 400, 'invalid', 'Unknown form.');
    }
    return respondError(
      request,
      requestUrl,
      400,
      'invalid',
      'Please check the highlighted fields.',
      validation.fieldErrors
    );
  }

  if (!parsed.turnstileToken) {
    // No token generally means JavaScript didn't run (Turnstile requires a
    // browser), so this reads as "please enable JavaScript" rather than a
    // generic verification failure.
    return respondError(
      request,
      requestUrl,
      400,
      'js',
      'JavaScript is required to submit this form.'
    );
  }

  const turnstileResult = await verifyTurnstileToken(
    env.TURNSTILE_SECRET_KEY,
    parsed.turnstileToken,
    ip !== 'unknown' ? ip : undefined,
    requestUrl.hostname
  );
  if (!turnstileResult.ok) {
    return respondError(
      request,
      requestUrl,
      403,
      'verify',
      'Verification failed. Please try again.'
    );
  }

  if (env.FORMS_DRY_RUN === 'true') {
    return respondSuccess(
      request,
      requestUrl,
      crypto.randomUUID(),
      formTypeForRedirect
    );
  }

  const envelope = await buildEnvelope(
    env.APPS_SCRIPT_HMAC_SECRET,
    formTypeValue as FormType,
    validation.data,
    {
      page: request.headers.get('Referer') || requestUrl.pathname,
      userAgent: request.headers.get('User-Agent') || '',
      country: request.cf?.country ? String(request.cf.country) : '',
    }
  );

  const result = await submitToAppsScript(env.APPS_SCRIPT_URL, envelope);
  if (!result.ok) {
    return respondError(
      request,
      requestUrl,
      502,
      'server',
      'Could not deliver your submission. Please try again shortly.'
    );
  }

  return respondSuccess(request, requestUrl, envelope.id, formTypeForRedirect);
}
