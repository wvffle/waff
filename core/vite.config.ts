import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig(() => ({
  plugins: [
    dts({ insertTypesEntry: true }),
  ],
  build: {
    lib: {
      entry: 'src/main',
      name: '@waff/core',
      fileName: 'waff'
    },
    minify: process.env.NODE_ENV === 'development'
  }
}))
