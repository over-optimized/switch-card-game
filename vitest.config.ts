import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        global: {
          lines: 75,
          functions: 75,
          branches: 75,
          statements: 75,
        },
        'shared/src/': {
          lines: 85,
          functions: 85,
          branches: 80,
          statements: 85,
        },
      },
    },
  },
});
