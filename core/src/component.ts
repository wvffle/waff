import type { Reactive } from "@waff/reactivity"
import type { VNode } from "snabbdom"

import { reactive, watchEffect } from "@waff/reactivity"
import { patch } from "./vdom"

export type PropsOrData<T> = Record<keyof T, any>

export interface DefineComponentOptions<Props extends PropsOrData<Props>, Data extends PropsOrData<Data>> {
  setup(props: Reactive<Props>): Data | Promise<Data>
  render(props: Reactive<Props>, data: Reactive<Data>): VNode
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

  let root: VNode | undefined
  watchEffect(() => {
    const vnode = options.render(reactiveProps, data)

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
