import type { Ref } from './ref'
import type { Reactive } from './reactive'

import { createEffect } from './effect'
import { toRaw } from './utils/shared'

interface WatchOptions {
  immediate?: boolean
}

export const watchEffect = (fn: () => void) => {
  const effect = createEffect(fn)
  return () => effect.stop()
}

export function watch<T> (target: Reactive<T> | Ref<T>, handler: (to: T, from: T | undefined) => void, options: WatchOptions = { immediate: false }) {
  let lastValue: T | undefined = undefined
  let initialized = options.immediate

  return watchEffect(() => {
    const to = toRaw(target)
    const from = lastValue

    if (initialized) {
      handler(to, from)
    } else {
      initialized = true
    }

    lastValue = to
  })
}

