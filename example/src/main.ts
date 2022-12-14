import { createApp } from '@waff/core'
import Counter from './components/counter.waff'

createApp({
  root: document.querySelector('#app')!,
  component: Counter(),
})
