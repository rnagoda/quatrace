import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      // Process entry points and config wiring are exercised by integration/E2E,
      // not unit tests, so they are excluded from the unit coverage target.
      exclude: ['src/server.js', 'src/config/**'],
      reporter: ['text', 'html'],
    },
  },
});
