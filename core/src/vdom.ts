import type { VNode, VNodeData } from 'snabbdom'

import { init, attributesModule, classModule, styleModule, eventListenersModule, propsModule } from 'snabbdom'

type UpdateFn = Exclude<typeof classModule['update'], undefined>

const decorateUpdateClass = (fn: UpdateFn): UpdateFn => (oldVNode: VNode, node: VNode) => {
  const updateClass = (data?: VNodeData) => {
    if (!data?.class) return

    const keys: string[] = []
    for (const key of Object.keys(data.class)) {
      if (key.includes(' ')) {
        keys.push(key)
      }
    }

    for (const key of keys) {
      const value = data.class[key]
      delete data.class[key]

      for (const name of key.split(' ')) {
        data.class[name] = value
      }
    }
  }


  updateClass(oldVNode.data)
  updateClass(node.data)

  return fn(oldVNode, node)
}

classModule.update = decorateUpdateClass(classModule.update!)
classModule.create = decorateUpdateClass(classModule.create!)

export const patch = init([
  // Init patch function with chosen modules
  classModule, // makes it easy to toggle classes
  styleModule, // handles styling on elements with support for animations
  eventListenersModule, // attaches event listeners
  propsModule, // for setting properties on DOM elements
  attributesModule
])
