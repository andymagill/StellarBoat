import { signEnvelope } from './sign';
import type { FormType } from '../../src/utils/forms/schema';

export interface SubmissionMeta {
  page: string;
  userAgent: string;
  country: string;
}

export interface AppsScriptEnvelope {
  v: 1;
  id: string;
  ts: number;
  /**
   * Raw JSON string of `{ formType, fields, meta }`, signed exactly as
   * transmitted. Signing the serialized string (rather than the parsed
   * object) means the receiving Apps Script never has to reproduce our
   * JSON.stringify output byte-for-byte to verify the signature.
   */
  payload: string;
  sig: string;
}

export interface AppsScriptResult {
  ok: boolean;
  error?: string;
  duplicate?: boolean;
}

/**
 * Build and sign the envelope sent to the Apps Script web app.
 */
export async function buildEnvelope(
  secret: string,
  formType: FormType,
  fields: Record<string, string>,
  meta: SubmissionMeta
): Promise<AppsScriptEnvelope> {
  const id = crypto.randomUUID();
  const ts = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({ formType, fields, meta });
  const sig = await signEnvelope(secret, ts, id, payload);

  return { v: 1, id, ts, payload, sig };
}

/**
 * POST the signed envelope to the Apps Script web app.
 *
 * Apps Script always answers with HTTP 200 (errors are reported inside
 * the JSON body), and `fetch` on a Worker follows the intermediate
 * redirect through script.googleusercontent.com automatically.
 */
export async function submitToAppsScript(
  scriptUrl: string,
  envelope: AppsScriptEnvelope
): Promise<AppsScriptResult> {
  let response: Response;
  try {
    response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envelope),
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    return {
      ok: false,
      error: `apps-script-unreachable: ${(error as Error).message}`,
    };
  }

  if (!response.ok) {
    return { ok: false, error: `apps-script-http-${response.status}` };
  }

  let result: AppsScriptResult;
  try {
    result = (await response.json()) as AppsScriptResult;
  } catch {
    return { ok: false, error: 'apps-script-invalid-response' };
  }

  return result;
}
