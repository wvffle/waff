import type { Component } from "./component"
import type { VNode } from "snabbdom"

import { patch } from "./vdom"

export interface AppOptions {
  root: VNode | Element
  component: Component<any> | Promise<Component<any>>
}

export const createApp = async (options: AppOptions) => {
  const component = await options.component
  const { root } = component

  const app = {
    root: options.root
  }

  patch(options.root, root)
  return app
}
