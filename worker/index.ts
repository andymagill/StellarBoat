/**
 * Worker entry point.
 *
 * `wrangler.jsonc`'s `assets.run_worker_first` is scoped to `/api/*`, so
 * this only ever runs for API requests — every other request (all static
 * pages and assets) is served directly by Cloudflare's asset handler
 * without invoking this Worker at all. The `env.ASSETS.fetch` fallback
 * below exists as a safety net in case that scope ever widens.
 */

import { handleFormSubmission } from './forms/handler';
import type { FormsEnv } from './forms/types';

export default {
  async fetch(request: Request, env: FormsEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/forms') {
      return handleFormSubmission(request, env);
    }

    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ ok: false, error: 'not-found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
