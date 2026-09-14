import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Separate Vitest config for the Worker.
 *
 * Kept apart from the root config (`vitest.config.ts`) because the Worker
 * targets the Workers runtime, not Node/DOM — its types come from the
 * generated `worker-configuration.d.ts`, not `tsconfig.json`'s DOM lib.
 * Vitest itself doesn't type-check (esbuild transpiles), so this only
 * needs the right test environment; run `npm run check:worker` for
 * Worker-specific type safety.
 */
export default defineConfig({
  test: {
    root: dirname(fileURLToPath(import.meta.url)),
    include: ['**/*.test.ts'],
    environment: 'node',
    globals: true,
  },
});
