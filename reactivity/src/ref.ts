import { IS_REF, isRef } from './utils/shared'
import { reactive } from './reactive'

export interface Ref<T = unknown> {
  [IS_REF]: true
  value: T
}

export type MaybeRef<T> = Ref<T> | T

const refs = reactive<Record<string, unknown>>({}, true)
let refCount = 0

export class RefImpl<T = unknown> implements Ref<T> {
  #ref_id: string

  constructor (value: T) {
    this.#ref_id = `${refCount++}`
    refs[this.#ref_id] = value
  }

  get [IS_REF] (): true {
    return true
  }

  get value () {
    return refs[this.#ref_id] as T
  }

  set value (value) {
    refs[this.#ref_id] = value
  }
}

export function ref<T> (target: MaybeRef<T>): Ref<T>
export function ref<T = any> (): Ref<T | undefined>
export function ref (target?: unknown): Ref {
  if(isRef(target)) {
    return target
  }

  return new RefImpl(target)
}

export const unwrap = <T>(target: MaybeRef<T>): T => isRef(target)
  ? target.value
  : target
