/**
 * HMAC-SHA256 signing for the Worker → Apps Script envelope.
 *
 * Apps Script's `doPost` cannot read request headers, and its /exec URL
 * is public once deployed with "Anyone" access, so the signature travels
 * in the JSON body instead. `Code.gs` in `apps-script/` recomputes the
 * same signature with `Utilities.computeHmacSha256Signature` — keep the
 * signed-string format (`${ts}.${nonce}.${body}`) identical on both sides.
 */

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

/**
 * Sign `${ts}.${nonce}.${body}` with HMAC-SHA256, returning a hex digest.
 */
export async function signEnvelope(
  secret: string,
  ts: number,
  nonce: string,
  body: string
): Promise<string> {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${ts}.${nonce}.${body}`)
  );
  return toHex(signature);
}
