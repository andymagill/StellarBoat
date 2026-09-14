export default {
  test: {
    testDir: './tests/unit',
    include: ['**/*.test.ts'],
    // Worker code targets the Workers runtime (not Node) and has its own
    // suite/config — see worker/vitest.config.ts and `npm run test:worker`.
    exclude: ['node_modules/', 'dist/', '.astro/', 'tests/e2e/**', 'worker/**'],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '.astro/', 'tests/'],
    },
  },
};
