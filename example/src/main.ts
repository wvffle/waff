import 'uno.css'
import '@unocss/reset/tailwind.css'

import { createApp } from '@waff/core'
import TodoApp from './components/todo-app.waff'

createApp({
  root: document.querySelector('#app')!,
  component: TodoApp(),
})
