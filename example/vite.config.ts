/// <reference types="vitest" />

import { defineConfig } from 'vite'
import waff from '@waff/vite'

export default defineConfig({
  plugins: [
    // waff(),
    waff()
  ],
})
