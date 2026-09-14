/* eslint-disable no-undef */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 1,
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.75 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.75 }],
        'categories:seo': ['error', { minScore: 0.65 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1600 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 16000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
};
