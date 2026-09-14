# Apps Script Forms Bridge

`Code.gs` receives signed submissions from the Cloudflare Worker (`worker/forms/`) and appends them to a Google Sheet, one tab per form type (`contact`, `lead`, `newsletter`), each tab created on first write with a bold, frozen header row. It also emails a notification per submission.

This is not deployed automatically — it's a Google Apps Script **container-bound** to a Sheet you create, deployed through the Apps Script editor (or [`clasp`](https://github.com/google/clasp) if you prefer the CLI). Treat it the same as any other secret-bearing deployment: the files here are the source of truth, but the live script and its Script Properties live in your Google account.

## Setup

1. **Create the Sheet.** In Google Sheets, create a new spreadsheet (this becomes your submissions database — name it something like "StellarBoat Form Submissions").
2. **Open the bound script.** Extensions → Apps Script. This opens an empty project bound to the Sheet.
3. **Add the files.** Either:
   - Paste the contents of `Code.gs` and `appsscript.json` into the editor (Project Settings → check "Show appsscript.json manifest file in editor" to edit the manifest directly), or
   - Use `clasp`: `clasp create --type sheets --parentId <SHEET_ID>` then `clasp push` from this directory.
4. **Set Script Properties.** Project Settings → Script Properties → Add property:
   | Property | Value |
   |---|---|
   | `HMAC_SECRET` | A long random secret — generate with `openssl rand -hex 32`. Must exactly match the Worker's `APPS_SCRIPT_HMAC_SECRET`. |
   | `NOTIFY_EMAIL` | Where submission notifications are sent. Optional — leave unset to skip email entirely. |
5. **Deploy as a web app.** Deploy → New deployment → type "Web app":
   - **Execute as:** Me (your account) — the script needs your permission to write to the Sheet and send mail, regardless of who submits the form.
   - **Who has access:** Anyone — the endpoint is only usable by someone holding `HMAC_SECRET`, so this is safe; Apps Script has no "authenticated callers only" option that would work for a public form anyway.
   - Click Deploy, authorize the requested scopes (Sheets, Mail) when prompted.
6. **Copy the `/exec` URL** shown after deploying. Set it as the Worker's `APPS_SCRIPT_URL` secret (`wrangler secret put APPS_SCRIPT_URL`, or in `.dev.vars` for local dev).
7. **Verify the HMAC implementation matches.** Run → `selfTest` in the Apps Script editor (View → Logs, or Execution log, to see the output). It should print:
   ```
   55714ef3a695539d86f08c9f4daebd314e1b748def0e140a7c42b5e8417ba059
   ```
   The same fixed inputs are asserted in `worker/forms/sign.test.ts` — if these two ever disagree, every submission will fail signature verification.

## Redeploying

Editing `Code.gs` after the initial deploy does **not** update the live `/exec` URL on its own — Apps Script versions deployments. To ship a change:

Deploy → Manage deployments → pick the existing web app deployment → the pencil/edit icon → **New version** → Deploy.

This updates the code served at the _same_ `/exec` URL, so the Worker's `APPS_SCRIPT_URL` secret never needs to change for a code-only update.

## How it works

- **Signature:** the Worker signs `${ts}.${id}.${payload}` with HMAC-SHA256 (`worker/forms/sign.ts`); `Code.gs` recomputes the same signature with `Utilities.computeHmacSha256Signature` and compares in (best-effort) constant time.
- **Replay window:** envelopes older than 300 seconds are rejected.
- **Replay/dedup:** each envelope's `id` is cached (`CacheService`, 10 minutes) — a retried request with the same `id` returns `{ ok: true, duplicate: true }` instead of writing a second row.
- **Concurrency:** `LockService` serializes the read-header/append-row sequence so concurrent submissions can't race on sheet creation or row order.
- **Formula injection:** any field value starting with `=`, `+`, `-`, `@`, or a leading tab/CR is stored with a leading apostrophe, so Sheets never evaluates submitted text as a formula.
- **Columns:** fixed per form type in `FORM_COLUMNS` — keep this in sync with `FORM_SCHEMAS` in `src/utils/forms/schema.ts` if you add or rename a form field (the two can't share code directly; Apps Script projects can't import from the main repo).

See [ARCHITECTURE.md](../ARCHITECTURE.md#form-submission-flow) for the full request pipeline, including the Worker-side gates that run before a submission ever reaches this script.
