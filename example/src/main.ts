import { createApp, createElement, defineComponent } from '@waff/core'
import { ref } from '@waff/reactivity'

const rootComponent = defineComponent('Root', {
  setup: () => {
    const elements = ref((Math.random() * 10 | 0) + 1)

    const onClick = () => {
      elements.value = (Math.random() * 10 | 0) + 1
    }

    return { onClick, elements }
  },
  render: (props, { onClick, elements }) => {
    console.log(elements.value)
    return createElement('ul', { on: { click: onClick } }, [...Array(elements.value)].map(() => createElement('li', 'nice')))
  }
})

createApp({
  root: document.querySelector('#app'),
  component: rootComponent
})
