import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { join } from 'path';

export default defineConfig({
  cacheDir:'../../node_modules/.vite',
  plugins: [
    solidPlugin(),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: [
      { find: '@', replacement: join(__dirname, '../..') },
      { find: '~', replacement: join(__dirname, './src') }
    ],
  }
});
