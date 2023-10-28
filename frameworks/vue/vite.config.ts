import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir:'../../node_modules/.vite',
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@' : fileURLToPath(new URL('../..', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
