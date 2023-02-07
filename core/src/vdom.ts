import { init, attributesModule, classModule, styleModule, eventListenersModule, propsModule } from 'snabbdom'

export const patch = init([
  // Init patch function with chosen modules
  classModule, // makes it easy to toggle classes
  styleModule, // handles styling on elements with support for animations
  eventListenersModule, // attaches event listeners
  propsModule, // for setting properties on DOM elements
  attributesModule
])
