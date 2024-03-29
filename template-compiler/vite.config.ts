/// <reference types="vitest" />

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({ insertTypesEntry: true }),
  ],
  test: {
    globals: true,
  },
  build: {
    lib: {
      entry: 'src/main',
      name: '@waff/template-compiler',
      fileName: 'template-compiler'
    },
    minify: process.env.NODE_ENV === 'development',
    rollupOptions: {
      external: ['typescript', 'hast-util-from-html', 'pascal-case']
    }
  }
})
