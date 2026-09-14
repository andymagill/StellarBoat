/**
 * StellarBoat forms → Google Sheets bridge.
 *
 * Receives signed submissions from the Cloudflare Worker (worker/forms/),
 * verifies the HMAC signature and replay window, appends a row to a
 * per-form-type sheet tab, and emails a notification.
 *
 * Setup: see apps-script/README.md.
 *
 * Required Script Properties (Project Settings → Script Properties):
 *   HMAC_SECRET  — must exactly match the Worker's APPS_SCRIPT_HMAC_SECRET
 *   NOTIFY_EMAIL — where submission notifications are sent (optional;
 *                  notifications are skipped silently if unset)
 */

// Column order per form type. Keep in sync with FORM_SCHEMAS in
// src/utils/forms/schema.ts — this is a plain object (not shared code)
// because Apps Script projects can't import from the main repo.
var FORM_COLUMNS = {
  contact: ['name', 'email', 'message'],
  lead: ['name', 'email', 'company', 'phone'],
  newsletter: ['email'],
};

var REPLAY_WINDOW_SECONDS = 300; // Must match the Worker's signing window.
var NONCE_CACHE_SECONDS = 600; // How long a submission id blocks a replay.

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: 'missing-body' });
    }

    var envelope;
    try {
      envelope = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ ok: false, error: 'invalid-json' });
    }

    if (envelope.v !== 1) {
      return jsonResponse({ ok: false, error: 'unsupported-version' });
    }
    if (!envelope.id || !envelope.ts || !envelope.payload || !envelope.sig) {
      return jsonResponse({ ok: false, error: 'malformed-envelope' });
    }

    var secret =
      PropertiesService.getScriptProperties().getProperty('HMAC_SECRET');
    if (!secret) {
      return jsonResponse({ ok: false, error: 'not-configured' });
    }

    var expectedSig = computeSignatureHex(
      secret,
      envelope.ts,
      envelope.id,
      envelope.payload
    );
    if (!timingSafeEqual(String(envelope.sig), expectedSig)) {
      return jsonResponse({ ok: false, error: 'bad-signature' });
    }

    var now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - envelope.ts) > REPLAY_WINDOW_SECONDS) {
      return jsonResponse({ ok: false, error: 'expired' });
    }

    // Replay protection: the same signed envelope retried (e.g. a client
    // that didn't see our response) is treated as already-delivered
    // rather than written twice.
    var cache = CacheService.getScriptCache();
    var cacheKey = 'nonce:' + envelope.id;
    if (cache.get(cacheKey)) {
      return jsonResponse({ ok: true, id: envelope.id, duplicate: true });
    }
    cache.put(cacheKey, '1', NONCE_CACHE_SECONDS);

    var data;
    try {
      data = JSON.parse(envelope.payload);
    } catch (payloadErr) {
      return jsonResponse({ ok: false, error: 'invalid-payload' });
    }

    var columns = FORM_COLUMNS[data.formType];
    if (!columns) {
      return jsonResponse({ ok: false, error: 'unknown-form-type' });
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = getOrCreateSheet(data.formType, columns);
      sheet.appendRow(buildRow(columns, data, envelope));
    } finally {
      lock.releaseLock();
    }

    sendNotification(data.formType, data, envelope);

    return jsonResponse({ ok: true, id: envelope.id });
  } catch (err) {
    return jsonResponse({ ok: false, error: 'internal-error' });
  }
}

function doGet() {
  return jsonResponse({ ok: false, error: 'method-not-allowed' });
}

/**
 * Get (or lazily create, with a bold frozen header row) the sheet tab for
 * a form type.
 */
function getOrCreateSheet(formType, columns) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(formType);
  if (sheet) return sheet;

  sheet = spreadsheet.insertSheet(formType);
  var header = ['Timestamp', 'ID']
    .concat(columns.map(titleCase))
    .concat(['Page', 'Country', 'User Agent']);
  sheet.appendRow(header);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, header.length).setFontWeight('bold');
  return sheet;
}

function buildRow(columns, data, envelope) {
  var fields = data.fields || {};
  var meta = data.meta || {};
  var row = [new Date(envelope.ts * 1000), envelope.id];
  columns.forEach(function (column) {
    row.push(sanitizeCell(fields[column] || ''));
  });
  row.push(sanitizeCell(meta.page || ''));
  row.push(sanitizeCell(meta.country || ''));
  row.push(sanitizeCell(meta.userAgent || ''));
  return row;
}

/**
 * Prefix values that would otherwise be interpreted as a spreadsheet
 * formula (starting with =, +, -, @, or a leading tab/CR) with an
 * apostrophe, so Sheets always stores submitted text literally.
 */
function sanitizeCell(value) {
  var str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

function titleCase(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Best-effort notification email. A failure here must never fail the
 * submission itself — the row is already written by the time this runs.
 */
function sendNotification(formType, data, envelope) {
  try {
    var notifyEmail =
      PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
    if (!notifyEmail) return;

    var fields = data.fields || {};
    var lines = Object.keys(fields).map(function (key) {
      return key + ': ' + fields[key];
    });
    var sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();

    MailApp.sendEmail({
      to: notifyEmail,
      subject: 'New ' + formType + ' submission',
      body:
        lines.join('\n') +
        '\n\nSubmission ID: ' +
        envelope.id +
        '\nSheet: ' +
        sheetUrl,
    });
  } catch (err) {
    // Swallow — notification is a courtesy, not part of the contract.
  }
}

/**
 * HMAC-SHA256 over `${ts}.${nonce}.${payload}`, hex-encoded. Must match
 * worker/forms/sign.ts byte-for-byte — see selfTest() below.
 */
function computeSignatureHex(secret, ts, nonce, payload) {
  var input = ts + '.' + nonce + '.' + payload;
  var rawSignature = Utilities.computeHmacSha256Signature(input, secret);
  return bytesToHex(rawSignature);
}

function bytesToHex(bytes) {
  return bytes
    .map(function (signedByte) {
      var unsignedByte = signedByte < 0 ? signedByte + 256 : signedByte;
      var hex = unsignedByte.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');
}

/**
 * Constant-time-ish string comparison — every character is inspected
 * regardless of where the first mismatch occurs, so response timing
 * doesn't leak how much of the signature was correct.
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Run from the Apps Script editor (Run → selfTest) after deploying to
 * confirm this file's HMAC implementation agrees with the Worker's.
 * worker/forms/sign.test.ts asserts the same fixed inputs produce this
 * exact hex string — the two implementations must never disagree:
 *   55714ef3a695539d86f08c9f4daebd314e1b748def0e140a7c42b5e8417ba059
 */
function selfTest() {
  var secret = 'test-secret';
  var ts = 1700000000;
  var nonce = 'test-nonce-id';
  var payload = '{"formType":"contact","fields":{"name":"Ada Lovelace"}}';
  var signature = computeSignatureHex(secret, ts, nonce, payload);
  Logger.log('Signature: ' + signature);
  return signature;
}
