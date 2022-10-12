import { createApp, createElement, defineComponent } from '@waff/core'

const rootComponent = defineComponent('Root', ({ props }) => {
  props.elements = (Math.random() * 10 | 0) + 1

  const onClick = () => {
    props.elements = (Math.random() * 10 | 0) + 1
  }

  return () => createElement('ul', { on: { click: onClick } }, [...Array(props.elements)].map(() => createElement('li', 'nice')))
})

createApp({
  root: document.querySelector('#app'),
  component: rootComponent
})
