import { Reactive, watch, computed, ref, Ref, watchEffect } from '@waff/reactivity'
import type { VNode } from 'snabbdom'

import { h, init, attributesModule, classModule, styleModule, eventListenersModule } from 'snabbdom'
import { reactive } from '@waff/reactivity'

export { h as createElement } from 'snabbdom'

interface WaffOptions {
  root: HTMLElement | VNode | null
  component: ComponentFactoryFn<{}>
}

type Props<T extends Record<string, unknown>> = Reactive<T>

interface ComponentContext<T extends Record<string, unknown>> {
  props?: Props<T>
}

type ComponentFactoryFn<T extends Record<string, unknown>> = (context: ComponentContext<T>) => Promise<ComponentInstance>

interface ComponentInstance {
  root: Ref<VNode | undefined>

  destroy(): void
}

interface ComponentDefinition<PropTypes extends Record<string, unknown>, Setup extends Record<string, unknown>> {
  setup: (context: ComponentContext<PropTypes>) => Promise<Setup>
  render: (props: Props<PropTypes>, data: Setup) => VNode
}

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
  options.component({ props }).then((rootComponent) => {
    watchEffect(() => {
      const vnode = rootComponent.root.value
      root = patch(root, vnode
        ? vnode
        : h('!')
      )
    })
  })
}

const components: Record<string, ComponentFactoryFn<any>> = {}

export const defineComponent = <PropTypes extends Record<string, unknown>>(name: string, definition: ComponentDefinition<PropTypes, {}>) => {
  if (name in components) {
    throw new Error(`Component '${name}' already exists.`)
  }

  const factory: ComponentFactoryFn<PropTypes> = async (context) => {
    const data = await definition.setup(context)
    const root = ref<VNode>()

    const props = context.props ?? reactive({} as PropTypes)
    const stop = watchEffect(() => {
      console.log('@', data)
      root.value = definition.render(props, data)
    })

    const instance: ComponentInstance = {
      destroy: () => stop(),
      root
    }

    return instance
  }

  components[name] = factory
  return factory
}

export const createComponent = <T extends Reactive | object>(name: string, props: T) => {
  return components[name]({
    props
  })
}
