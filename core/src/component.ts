import type { Reactive } from "@waff/reactivity"
import type { VNode } from "snabbdom"

import { reactive, ref, watchEffect } from "@waff/reactivity"
import { patch } from "./vdom"
import { createElement } from "./main"

export type PropsOrData<T> = Record<keyof T, any>

export interface DefineComponentOptions<Props extends PropsOrData<Props>, Data extends PropsOrData<Data>> {
  setup(props: Reactive<Props>): Data | Promise<Data>
  render(props: Reactive<Props>, data: Reactive<Data>, context: ComponentContext): VNode
}

export interface ComponentContext<Props = {}> {
  createInnerComponent: (id: number, componentConstructor: ReturnType<typeof defineComponent>, props: Props) => VNode
}

export interface Component<Props> {
  props: Reactive<Props>
  root: VNode
}

const componentOptions: Record<string, DefineComponentOptions<PropsOrData<any>, PropsOrData<any>>> = {}
// TODO: Allow passing only Props
export const defineComponent = <Data, Props = {}>(name: string, options: DefineComponentOptions<Props, Data>) => {
  componentOptions[name] = options as DefineComponentOptions<PropsOrData<Props>, PropsOrData<Data>>
  return (props = {} as Props) => createComponent(name, props)
}

export const createComponent = async <Props extends PropsOrData<Props>>(name: string, props = {} as Props): Promise<Component<Props>> => {
  const options = componentOptions[name]

  const reactiveProps = reactive(props)
  const data = reactive(await options.setup(reactiveProps), true)

  const componentInstances = Object.create(null)

  const forceUpdate = ref(false)

  let root: VNode | undefined
  watchEffect(() => {
    // NOTE: Track force updates
    if (forceUpdate.value) forceUpdate.value = false

    const vnode = options.render(reactiveProps, data, {
      createInnerComponent: (id, componentConstructor, props): VNode => {
        if (id in componentInstances) return componentInstances[id].root

        componentInstances[id] = {
          root: createElement('!'),
          initialize: () => componentConstructor(props)
            .then(({ root }) => {
              componentInstances[id].root.value = root
              forceUpdate.value = true
            })
            .catch(err => console.error('Cannot create component: ', err))
        }

        componentInstances[id].initialize()
        return componentInstances[id].root
      }
    })

    if (!root) {
      root = vnode
      return
    }

    root = patch(root, vnode)
  })

  return {
    root: root as VNode,
    props: reactiveProps
  }
}
