// import { h, init, attributesModule, classModule, styleModule } from 'snabbdom'

interface WaffOptions {
  root: HTMLElement | null
}

export const createApp = (options: WaffOptions) => {
  if (options.root === null) {
    throw new Error('Root node is not available.')
  }

  options.root.innerHTML = 'nice'
}
