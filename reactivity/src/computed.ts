import type { Ref } from './ref'

import { IS_COMPUTED, IS_REF } from './utils/shared'

export interface Computed<T> extends Ref<T> {
  [IS_COMPUTED]: true
}

export const computed = <T>(fn: () => T): Computed<T> => ({
  [IS_COMPUTED]: true,
  [IS_REF]: true,

  get value () {
    return fn()
  }
})

