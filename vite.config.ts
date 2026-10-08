import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

const srcDirectory = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  base: '/tools-collection/',
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': srcDirectory,
    },
    tsconfigPaths: true,
  },
  test: {
    projects: [
      {
        test: {
          environment: 'node',
          globals: true,
          include: ['src/**/*.test.ts'],
          name: 'unit',
        },
      },
      {
        optimizeDeps: {
          include: ['vitest-browser-react'],
        },
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: 'chromium' }, { browser: 'firefox' }],
            provider: playwright(),
          },
          css: true,
          globals: true,
          include: ['src/**/*.test.tsx'],
          name: 'browser',
          setupFiles: './src/test/setup.ts',
        },
      },
    ],
  },
});
