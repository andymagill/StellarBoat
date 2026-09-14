/**
 * Progressive enhancement for StellarBoat forms.
 *
 * Wires every `form[data-stellar-form]` on the page independently (so two
 * forms on the same page never collide), validates with the same schema
 * the Worker uses, lazy-loads Cloudflare Turnstile on first interaction,
 * and POSTs JSON to the form's `action` endpoint.
 *
 * Native HTML POST is the fallback: with JS disabled, the form still
 * submits to the same endpoint, which redirects back to a friendly
 * "please enable JavaScript" page (Turnstile requires a browser to run).
 */

import { validateSubmission, type FormType, type FieldErrors } from './schema';

interface TurnstileRenderOptions {
  sitekey: string;
  execution: 'execute';
  callback: (token: string) => void;
  'error-callback'?: () => void;
}

interface TurnstileGlobal {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileGlobal;
    __stellarTurnstileOnload?: () => void;
  }
}

const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__stellarTurnstileOnload&render=explicit';
const TOKEN_TIMEOUT_MS = 8000;

const SUCCESS_MESSAGES: Record<FormType, string> = {
  contact: 'Thank you! Your message has been sent.',
  lead: "Thank you! We'll be in touch shortly.",
  newsletter: 'Thanks for signing up!',
};

let turnstileLoadPromise: Promise<TurnstileGlobal> | null = null;

function loadTurnstile(): Promise<TurnstileGlobal> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileLoadPromise) return turnstileLoadPromise;

  turnstileLoadPromise = new Promise((resolve, reject) => {
    window.__stellarTurnstileOnload = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('Turnstile failed to load'));
    };
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.onerror = () => reject(new Error('Turnstile script failed to load'));
    document.head.appendChild(script);
  });

  return turnstileLoadPromise;
}

function createDeferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('Verification timed out.')),
      ms
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function setLoading(button: HTMLButtonElement, loading: boolean): void {
  button.disabled = loading;
  if (loading) button.setAttribute('aria-busy', 'true');
  else button.removeAttribute('aria-busy');
}

function clearMessages(container: HTMLElement): void {
  container.innerHTML = '';
  container.classList.add('hidden');
}

function renderAlert(
  container: HTMLElement,
  kind: 'success' | 'error',
  text: string
): void {
  container.innerHTML = '';
  const alert = document.createElement('div');
  alert.className =
    kind === 'success'
      ? 'p-4 bg-success/10 border border-success text-success rounded-md'
      : 'p-4 bg-error/10 border border-error text-error rounded-md';
  alert.setAttribute('role', kind === 'success' ? 'status' : 'alert');
  alert.textContent = text;
  container.appendChild(alert);
  container.classList.remove('hidden');
}

function showFieldErrors(
  form: HTMLFormElement,
  idPrefix: string,
  fieldErrors: FieldErrors,
  messages: HTMLElement
): void {
  const summary =
    Object.values(fieldErrors)[0] || 'Please check the highlighted fields.';
  renderAlert(messages, 'error', summary);

  for (const [field, message] of Object.entries(fieldErrors)) {
    const errorEl = form.querySelector<HTMLElement>(
      `#${idPrefix}-${field}-error`
    );
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  }
}

function clearFieldErrors(form: HTMLFormElement): void {
  form.querySelectorAll<HTMLElement>('[id$="-error"]').forEach((el) => {
    el.textContent = '';
    el.classList.add('hidden');
  });
}

interface FormApiResponse {
  ok: boolean;
  error?: string;
  fieldErrors?: FieldErrors;
}

function initForm(form: HTMLFormElement): void {
  // Multiple form components can appear on one page (e.g. /forms), and each
  // renders its own <script> calling enhanceForms(). Guard so a form is
  // only ever wired once, however many times enhanceForms() runs.
  if (form.dataset.stellarEnhanced === 'true') return;
  form.dataset.stellarEnhanced = 'true';

  const formType = form.dataset.stellarForm as FormType | undefined;
  if (!formType) return;

  const idPrefix = form.dataset.idPrefix || formType;
  const messages = form.querySelector<HTMLElement>('[data-form-messages]');
  const submitButton = form.querySelector<HTMLButtonElement>(
    'button[type="submit"]'
  );
  const turnstileContainer =
    form.querySelector<HTMLElement>('[data-turnstile]');
  const siteKey = form.dataset.turnstileSitekey || '';

  if (!messages || !submitButton) {
    console.warn(`[forms] "${formType}" form is missing required elements`);
    return;
  }

  let widgetId: string | null = null;
  let pendingToken: {
    promise: Promise<string>;
    resolve: (token: string) => void;
  } | null = null;

  function ensureWidget(): void {
    if (!siteKey || !turnstileContainer || widgetId) return;
    loadTurnstile()
      .then((turnstile) => {
        if (widgetId) return;
        widgetId = turnstile.render(turnstileContainer, {
          sitekey: siteKey,
          execution: 'execute',
          callback: (token) => pendingToken?.resolve(token),
          'error-callback': () => {
            /* left unresolved; requestToken() times out and surfaces an error */
          },
        });
      })
      .catch(() => {
        /* requestToken() will time out and the user sees a clear error */
      });
  }

  // Lazy-load Turnstile on first interaction so it never delays initial paint.
  form.addEventListener('focusin', ensureWidget, { once: true });

  async function requestToken(): Promise<string> {
    if (!siteKey) return '';

    const deferred = createDeferred<string>();
    pendingToken = deferred;

    if (widgetId) {
      window.turnstile?.execute(widgetId);
    } else {
      ensureWidget();
      void loadTurnstile().then((turnstile) => {
        const tryExecute = (): void => {
          if (widgetId) turnstile.execute(widgetId);
          else setTimeout(tryExecute, 50);
        };
        tryExecute();
      });
    }

    return withTimeout(deferred.promise, TOKEN_TIMEOUT_MS);
  }

  form.addEventListener('submit', (event) => {
    void handleSubmit(event);
  });

  async function handleSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!messages || !submitButton) return;

    clearMessages(messages);
    clearFieldErrors(form);

    const raw: Record<string, unknown> = {};
    new FormData(form).forEach((value, key) => {
      raw[key] = typeof value === 'string' ? value : '';
    });

    // Honeypot: bots fill every input, humans never see this one.
    if (typeof raw.website === 'string' && raw.website.trim() !== '') {
      renderAlert(messages, 'success', SUCCESS_MESSAGES[formType as FormType]);
      form.reset();
      return;
    }

    const validation = validateSubmission(formType, raw);
    if (!validation.ok) {
      showFieldErrors(form, idPrefix, validation.fieldErrors, messages);
      return;
    }

    setLoading(submitButton, true);

    let token: string;
    try {
      token = await requestToken();
    } catch {
      setLoading(submitButton, false);
      renderAlert(
        messages,
        'error',
        'Verification did not complete. Please try again.'
      );
      return;
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          formType,
          fields: validation.data,
          turnstileToken: token,
        }),
      });

      const payload = (await response.json()) as FormApiResponse;

      if (payload.ok) {
        renderAlert(
          messages,
          'success',
          SUCCESS_MESSAGES[formType as FormType]
        );
        form.reset();
      } else if (payload.fieldErrors) {
        showFieldErrors(form, idPrefix, payload.fieldErrors, messages);
      } else {
        renderAlert(
          messages,
          'error',
          payload.error || 'Something went wrong. Please try again.'
        );
      }
    } catch (error) {
      renderAlert(
        messages,
        'error',
        error instanceof Error ? error.message : 'An unexpected error occurred.'
      );
    } finally {
      setLoading(submitButton, false);
      if (widgetId) window.turnstile?.reset(widgetId);
    }
  }
}

export function enhanceForms(): void {
  document
    .querySelectorAll<HTMLFormElement>('form[data-stellar-form]')
    .forEach(initForm);
}
