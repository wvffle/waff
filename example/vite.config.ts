/// <reference types="vitest" />

import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import presetWind from '@unocss/preset-wind'
import presetIcons from '@unocss/preset-icons'
import waff from '@waff/vite'

export default defineConfig({
  plugins: [
    // @ts-expect-error no types
    waff(),
    UnoCSS({
      presets: [
        presetWind(),
        presetIcons(),
      ],
      include: [
        /\.waff$/
      ]
    }),
  ],
})
