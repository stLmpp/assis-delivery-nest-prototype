import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    coverage: {
      enabled: true,
      // branches: 70,
      // functions: 70,
      // lines: 70,
      // statements: 70,
      all: true,
      reporter: ['text', 'html', 'json', 'lcovonly'],
    },
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
});
