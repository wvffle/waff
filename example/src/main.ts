import { createApp, createElement, defineComponent, ref } from '@waff/core'
import Counter from './components/counter.waff'

// const Root = defineComponent('Root', {
//   setup: () => {
//     const elements = ref((Math.random() * 10 | 0) + 1)
//     const x = ref(Math.random())

//     const onClick = () => {
//       elements.value = (Math.random() * 10 | 0) + 1
//       x.value = Math.random()
//     }

//     return { onClick, elements, x }
//   },
//   render: (_props, { onClick, elements, x }) => {
//     return createElement('ul', { on: { click: onClick } }, [...Array(elements.value)].map(() => createElement('li', 'nice ' + x.value)))
//   }
// })

console.log(Counter())

createApp({
  root: document.querySelector('#app')!,
  // component: Root()
  component: Counter(),
})
