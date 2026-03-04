export default {
  test: {
    testDir: './tests/unit',
    include: ['**/*.test.ts'],
    exclude: ['node_modules/', 'dist/', '.astro/', 'tests/e2e/**'],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '.astro/', 'tests/'],
    },
  },
};
