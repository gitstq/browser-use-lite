import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'BrowserUseLite',
      fileName: 'browser-use-lite',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'puppeteer',
        'puppeteer-extra',
        'puppeteer-extra-plugin-stealth',
        'commander',
        'zod',
        'fs',
        'path',
        'os',
      ],
      output: {
        globals: {
          puppeteer: 'puppeteer',
          commander: 'commander',
          zod: 'zod',
        },
      },
    },
    minify: false,
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{js,ts}'],
  },
});
