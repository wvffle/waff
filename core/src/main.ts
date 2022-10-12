import { Reactive, watch, computed, ref } from '@waff/reactivity'
import type { VNode } from 'snabbdom'

import { init, attributesModule, classModule, styleModule, eventListenersModule } from 'snabbdom'
import { reactive } from '@waff/reactivity'

export { h as createElement } from 'snabbdom'

interface WaffOptions {
  root: HTMLElement | null
  component: Component
}

interface ComponentContext {
  props: Reactive<Record<string, unknown>>
}

type ComponentRenderFn = () => VNode
type Component = (context: ComponentContext) => ComponentRenderFn

export const createApp = (options: WaffOptions) => {
  if (options.root === null) {
    throw new Error('Root node is not available.')
  }

  const patch = init([
    eventListenersModule,
    attributesModule,
    classModule,
    styleModule,
  ])

  let { root } = options
  const props = reactive({})
  const render = options.component({ props })

  patch(root, render())
}

const components: Record<string, Component> = {}

interface ComponentDefinition<Props extends Reactive> {
  props: Props
  setup: (props: Props) => Promise<Reactive<Record<string, unknown>>>
  render: () => VNode
}

export const defineComponent = <T>(name: string, definition: ComponentDefinition<T>) => {
  if (name in components) {
    throw new Error(`Component '${name}' already exists.`)
  }

  const factory: Component = async () => {
    const data = await definition.setup(definition.props)
    const root = ref<VNode>()

    const stop = watch(computed(() => [data, definition.props]), () => {
      root.value = definition.render()
    }, { immediate: true })

    return {
      destroy: () => stop(),
      root
    }
  }

  components[name] = factory
  return factory
}

export const createComponent = (name: string, props) => {
  return components[name](props)
}
