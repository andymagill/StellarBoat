/**
 * Response helpers for /api/forms.
 *
 * The JS-enhanced client always sends `Accept: application/json` and
 * expects a JSON body it can render inline. A native (no-JS) HTML POST
 * doesn't set that header, so it gets a 303 redirect to a plain page
 * instead — redirecting after POST avoids a resubmission prompt on
 * refresh.
 */

export type ErrorCode = 'invalid' | 'rate' | 'verify' | 'server' | 'js';

const REDIRECT_REASON: Record<ErrorCode, string> = {
  invalid: 'invalid',
  rate: 'rate',
  verify: 'verify',
  server: 'server',
  js: 'js',
};

function wantsJson(request: Request): boolean {
  return (request.headers.get('Accept') || '').includes('application/json');
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Respond to a successful submission: JSON for the enhanced client, or a
 * 303 redirect to the thank-you page for a native POST.
 */
export function respondSuccess(
  request: Request,
  requestUrl: URL,
  id: string,
  formType: string
): Response {
  if (wantsJson(request)) {
    return jsonResponse({ ok: true, id });
  }
  const location = new URL(
    `/thank-you?form=${encodeURIComponent(formType)}`,
    requestUrl
  );
  return Response.redirect(location.toString(), 303);
}

/**
 * Respond to a failed submission: JSON with an error code (and optional
 * per-field errors) for the enhanced client, or a 303 redirect to the
 * form-error page carrying just the reason code for a native POST.
 */
export function respondError(
  request: Request,
  requestUrl: URL,
  status: number,
  code: ErrorCode,
  message: string,
  fieldErrors?: Record<string, string>
): Response {
  if (wantsJson(request)) {
    return jsonResponse({ ok: false, error: message, fieldErrors }, status);
  }
  const location = new URL(
    `/form-error?reason=${REDIRECT_REASON[code]}`,
    requestUrl
  );
  return Response.redirect(location.toString(), 303);
}
